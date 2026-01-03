from __future__ import annotations

import argparse
import pathlib
import sys

_ROOT = pathlib.Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from sqlalchemy import text

import backend.database as db
from backend.auth import hash_password


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--username", required=True)
    p.add_argument("--password", required=True)
    args = p.parse_args()

    hashed = hash_password(args.password)

    with db.engine.begin() as conn:
        res = conn.execute(
            text(
                "update usuarios set hashed_password = :hp where username = :u and rol = 'admin'"
            ),
            {"hp": hashed, "u": args.username},
        )

    if res.rowcount != 1:
        print(f"ERROR: expected to update 1 row, updated {res.rowcount}")
        return 2

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
