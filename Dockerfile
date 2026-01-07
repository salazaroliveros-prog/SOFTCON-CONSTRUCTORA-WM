# Railway will auto-detect this Dockerfile.
# Backend (FastAPI) + Supabase Postgres

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg2-binary are not required; keep image small.

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend

# Railway's HTTP proxy commonly targets the container's exposed port.
# Keep it aligned with the PORT value the runtime provides (often 8080).
EXPOSE 8080

CMD sh -c "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"
