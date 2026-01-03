from __future__ import annotations

import os
import pathlib
import sys
import time
import uuid
from pathlib import Path

from dotenv import load_dotenv


def main() -> int:
    # Load secrets for local runs.
    root = pathlib.Path(__file__).resolve().parents[2]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))

    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=True)
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)

    bootstrap_token = os.getenv("BOOTSTRAP_ADMIN_TOKEN")
    if not bootstrap_token:
        print("ERROR: BOOTSTRAP_ADMIN_TOKEN no está definido")
        return 2

    existing_admin_user = os.getenv("ADMIN_USERNAME")
    existing_admin_pass = os.getenv("ADMIN_PASSWORD")

    admin_user = f"admin_{uuid.uuid4().hex[:8]}"
    admin_email = f"{admin_user}@demo.local"
    admin_pass = "Admin12345!"

    test_user = f"user_{uuid.uuid4().hex[:8]}"
    test_email = f"{test_user}@demo.local"
    test_pass = "User12345!"

    from backend.main import app  # imported after env is loaded

    try:
        from fastapi.testclient import TestClient
    except Exception as exc:  # noqa: BLE001
        print("ERROR: No se pudo importar TestClient. Falta dependencia de testing.")
        print(type(exc).__name__, exc)
        return 98

    with TestClient(app) as client:
        # 0) Health
        r = client.get("/")
        print("GET / ->", r.status_code)
        if r.status_code != 200:
            print(r.text)
            return 3

        # 1) Bootstrap admin (may fail if already exists)
        r = client.post(
            "/auth/bootstrap-admin",
            headers={"X-BOOTSTRAP-TOKEN": bootstrap_token},
            json={"username": admin_user, "email": admin_email, "password": admin_pass},
        )
        print("POST /auth/bootstrap-admin ->", r.status_code)
        if r.status_code not in (200, 400):
            print(r.text)
            return 4

        if r.status_code == 400:
            if not (existing_admin_user and existing_admin_pass):
                print(
                    "NOTA: ya existe un administrador. Define ADMIN_USERNAME y ADMIN_PASSWORD para continuar el smoke-test."
                )
                return 5
            admin_user = existing_admin_user
            admin_pass = existing_admin_pass

        # 2) Login as admin
        r = client.post(
            "/auth/login",
            data={"username": admin_user, "password": admin_pass},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        print("POST /auth/login (admin) ->", r.status_code)
        if r.status_code != 200:
            print(r.text)
            return 6

        admin_token = (r.json() or {}).get("access_token")
        if not admin_token:
            print("No se recibió token admin")
            print(r.text)
            return 7

        # 3) Register normal user (should be pending)
        r = client.post(
            "/auth/register",
            json={"username": test_user, "email": test_email, "password": test_pass},
        )
        print("POST /auth/register (user) ->", r.status_code)
        if r.status_code != 200:
            print(r.text)
            return 8

        # 4) Login as user should fail (pending)
        r = client.post(
            "/auth/login",
            data={"username": test_user, "password": test_pass},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        print("POST /auth/login (user pending) ->", r.status_code)
        if r.status_code == 200:
            print("ERROR: el usuario pendiente NO debería poder loguearse")
            return 9

        # 5) List pending users
        r = client.get(
            "/auth/admin/users/pending",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        print("GET /auth/admin/users/pending ->", r.status_code)
        if r.status_code != 200:
            print(r.text)
            return 10

        data = r.json() or {}
        pending = data.get("items") or []
        target = next((u for u in pending if u.get("username") == test_user), None)
        if not target:
            print("No encontré el usuario en pendientes")
            print(pending[:3])
            return 11

        user_id = target.get("id")
        if not user_id:
            print("Pendiente sin id")
            print(target)
            return 12

        # 6) Approve user
        r = client.post(
            f"/auth/admin/users/{user_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        print("POST /auth/admin/users/{id}/approve ->", r.status_code)
        if r.status_code != 200:
            print(r.text)
            return 13

        time.sleep(0.2)

        # 7) Login as user should succeed now
        r = client.post(
            "/auth/login",
            data={"username": test_user, "password": test_pass},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        print("POST /auth/login (user approved) ->", r.status_code)
        if r.status_code != 200:
            print(r.text)
            return 14

        print("OK: flujo auth/admin-aprobación funcionando")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
