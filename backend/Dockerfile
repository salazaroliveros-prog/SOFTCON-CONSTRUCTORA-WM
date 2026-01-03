# Usamos una imagen ligera de Python
FROM python:3.10-slim

# Directorio de trabajo
WORKDIR /app

# Recomendado para containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Instalamos dependencias del sistema para PostgreSQL (psycopg2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiamos las dependencias
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código del backend
COPY . .

EXPOSE 8000

# Comando para correr la API con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
