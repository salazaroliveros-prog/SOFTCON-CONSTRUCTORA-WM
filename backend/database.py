import os
import pathlib
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

_backend_env = pathlib.Path(__file__).resolve().parent / ".env"
_root_env = pathlib.Path(__file__).resolve().parents[1] / ".env"


def _recover_db_url_from_backend_env(env_path: pathlib.Path) -> str | None:
    """Best-effort recovery when backend/.env contains multiple DATABASE_URL lines.

    We prefer the last postgres/postgresql URL found and ignore http/https URLs.
    """
    if not env_path.exists():
        return None

    best: str | None = None
    for raw in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if not line.startswith("DATABASE_URL="):
            continue
        value = line.split("=", 1)[1].strip().strip('"').strip("'")
        if value.startswith("postgresql://") or value.startswith("postgres://"):
            best = value
    return best

# Prefer backend/.env (secrets), then fallback to repo-root .env.
if _backend_env.exists():
    # backend/.env is the source of truth for secrets in local dev.
    # Override any process/user env var to avoid "sticky" DATABASE_URL from prior terminal commands.
    load_dotenv(dotenv_path=_backend_env, override=True)
else:
    load_dotenv()

if _root_env.exists():
    load_dotenv(dotenv_path=_root_env, override=False)

db_url = os.getenv("DATABASE_URL")
if db_url and (db_url.startswith("http://") or db_url.startswith("https://")):
    recovered = _recover_db_url_from_backend_env(_backend_env)
    if recovered:
        db_url = recovered

if not db_url:
    raise RuntimeError(
        "Missing DATABASE_URL env var. Set it to your Supabase Postgres connection string."
    )

if db_url.startswith("http://") or db_url.startswith("https://"):
    raise RuntimeError(
        "DATABASE_URL appears to be an HTTP URL. It must be a Postgres connection string starting with postgresql://"
    )

# SQLAlchemy expects 'postgresql://' (but some providers give 'postgres://')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Supabase Postgres requires SSL. If sslmode is missing, default to require.
if ".supabase.co" in db_url and "sslmode=" not in db_url:
    db_url = db_url + ("&" if "?" in db_url else "?") + "sslmode=require"

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    connect_args={
        # Fail fast if Supabase is unreachable; avoids the container hanging on startup.
        "connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT", "10")),
    },
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()