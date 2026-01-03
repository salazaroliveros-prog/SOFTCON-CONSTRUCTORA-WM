from __future__ import annotations

import pathlib
import sys

# Allow running as a script from any CWD.
_ROOT = pathlib.Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from sqlalchemy import text

import backend.database as db


def main() -> int:
    with db.engine.connect() as conn:
        rows = conn.execute(
            text(
                "select id::text, username, email, rol from usuarios where rol = 'admin' order by creado_en asc"
            )
        ).fetchall()

    if not rows:
        print("NO_ADMINS")
        return 1

    for r in rows:
        print(f"ADMIN id={r[0]} username={r[1]} email={r[2]} rol={r[3]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
