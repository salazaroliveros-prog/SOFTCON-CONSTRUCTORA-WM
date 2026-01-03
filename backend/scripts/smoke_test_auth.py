from __future__ import annotations

import json
import os
import time
import uuid
import urllib.error
import urllib.parse
import urllib.request

from pathlib import Path

from dotenv import load_dotenv


def _req(method: str, url: str, *, headers: dict[str, str] | None = None, data: bytes | None = None):
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in (headers or {}).items():
        req.add_header(k, v)

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            ct = resp.headers.get("Content-Type", "")
            if "application/json" in ct:
                return resp.status, json.loads(raw)
            return resp.status, raw
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        try:
            body_json = json.loads(body) if body else None
        except Exception:
            body_json = None
        return e.code, body_json or body


def main() -> int:
    # Load secrets for local runs.
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)

    base = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")
    bootstrap_token = os.getenv("BOOTSTRAP_ADMIN_TOKEN")
    if not bootstrap_token:
        print("ERROR: BOOTSTRAP_ADMIN_TOKEN no está definido en el entorno/.env")
        return 2

    admin_user = f"admin_{uuid.uuid4().hex[:8]}"
    admin_email = f"{admin_user}@demo.local"
    admin_pass = "Admin12345!"

    existing_admin_user = os.getenv("ADMIN_USERNAME")
    existing_admin_pass = os.getenv("ADMIN_PASSWORD")

    test_user = f"user_{uuid.uuid4().hex[:8]}"
    test_email = f"{test_user}@demo.local"
    test_pass = "User12345!"

    print(f"API_BASE_URL={base}")

    # 0) Health
    st, body = _req("GET", f"{base}/")
    print("GET / ->", st)
    if st != 200:
        print("Backend no responde.")
        print(body)
        return 3

    # 1) Bootstrap admin (may fail if already exists)
    payload = json.dumps({"username": admin_user, "email": admin_email, "password": admin_pass}).encode("utf-8")
    st, body = _req(
        "POST",
        f"{base}/auth/bootstrap-admin",
        headers={
            "Content-Type": "application/json",
            "X-BOOTSTRAP-TOKEN": bootstrap_token,
        },
        data=payload,
    )
    print("POST /auth/bootstrap-admin ->", st)
    if st not in (200, 400):
        print(body)
        return 4

    if st == 400:
        if not (existing_admin_user and existing_admin_pass):
            print(
                "NOTA: ya existe un administrador. Define ADMIN_USERNAME y ADMIN_PASSWORD para que el smoke-test pueda loguearse con ese admin existente."
            )
            return 5
        admin_user = existing_admin_user
        admin_pass = existing_admin_pass

    # 2) Login as admin
    form = urllib.parse.urlencode({"username": admin_user, "password": admin_pass}).encode("utf-8")
    st, body = _req(
        "POST",
        f"{base}/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=form,
    )
    print("POST /auth/login (admin) ->", st)
    if st != 200:
        print(body)
        return 5

    admin_token = body.get("access_token") if isinstance(body, dict) else None
    if not admin_token:
        print("No se recibió token admin")
        print(body)
        return 6

    # 3) Register normal user (should be pending)
    reg_payload = json.dumps({"username": test_user, "email": test_email, "password": test_pass}).encode("utf-8")
    st, body = _req(
        "POST",
        f"{base}/auth/register",
        headers={"Content-Type": "application/json"},
        data=reg_payload,
    )
    print("POST /auth/register (user) ->", st)
    if st != 200:
        print(body)
        return 7

    # 4) Login as user should fail (pending)
    form = urllib.parse.urlencode({"username": test_user, "password": test_pass}).encode("utf-8")
    st, body = _req(
        "POST",
        f"{base}/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=form,
    )
    print("POST /auth/login (user pending) ->", st)
    if st == 200:
        print("ERROR: el usuario pendiente NO debería poder loguearse")
        return 8

    # 5) List pending users
    st, body = _req(
        "GET",
        f"{base}/auth/admin/users/pending",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    print("GET /auth/admin/users/pending ->", st)
    if st != 200 or not isinstance(body, dict):
        print(body)
        return 9

    pending = body.get("items") or []
    target = next((u for u in pending if u.get("username") == test_user), None)
    if not target:
        print("No encontré el usuario en pendientes")
        print(pending[:3])
        return 10

    user_id = target.get("id")
    if not user_id:
        print("Pendiente sin id")
        print(target)
        return 11

    # 6) Approve user
    st, body = _req(
        "POST",
        f"{base}/auth/admin/users/{user_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"},
        data=b"",
    )
    print("POST /auth/admin/users/{id}/approve ->", st)
    if st != 200:
        print(body)
        return 12

    time.sleep(0.3)

    # 7) Login as user should succeed now
    form = urllib.parse.urlencode({"username": test_user, "password": test_pass}).encode("utf-8")
    st, body = _req(
        "POST",
        f"{base}/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=form,
    )
    print("POST /auth/login (user approved) ->", st)
    if st != 200:
        print(body)
        return 13

    print("OK: flujo auth/admin-aprobación funcionando")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
