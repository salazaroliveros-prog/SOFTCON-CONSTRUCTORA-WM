import pathlib
import sys

from sqlalchemy import text

_ROOT = pathlib.Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import backend.database as d


def main() -> None:
    safe_host = d.db_url.split("@", 1)[1].split("?", 1)[0]
    print("DB_URL_HOST=", safe_host)
    try:
        with d.engine.connect() as conn:
            version = conn.execute(text("select version()"))
            print("CONNECTED_OK")
            print(version.scalar())
    except Exception as exc:  # noqa: BLE001
        print("CONNECT_FAILED")
        print(type(exc).__name__, exc)


if __name__ == "__main__":
    main()
