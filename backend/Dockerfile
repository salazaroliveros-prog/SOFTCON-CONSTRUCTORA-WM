# Usamos una imagen ligera de Python
FROM python:3.10-slim

# Directorio de trabajo
WORKDIR /app
ENV PYTHONPATH=/app

# Copia TODO el backend como paquete "backend"
COPY . /app/backend

RUN python -m pip install --no-cache-dir -U pip \
 && python -m pip install --no-cache-dir -r /app/backend/requirements.txt

# Usa el paquete backend.main
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
