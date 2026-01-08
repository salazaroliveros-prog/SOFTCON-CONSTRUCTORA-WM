# --- ETAPA 1: Construir el Frontend (React + Vite) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copiamos archivos de dependencias
COPY frontend/package*.json ./
RUN npm install
# Copiamos el resto del código del frontend y construimos
COPY frontend/ ./
RUN npm run build

# --- ETAPA 2: Configurar el Backend (Python) ---
FROM python:3.11-slim
WORKDIR /app

# Instalamos dependencias de sistema necesarias para psycopg2 (conexión a Supabase)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo de requerimientos primero para aprovechar la caché de Docker
# Usamos el que está dentro de la carpeta backend
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# COPIAR LA CARPETA BACKEND COMPLETA
# Esto es vital para que "import backend" funcione
COPY backend/ ./backend/

# Copiamos la carpeta 'dist' del frontend a una carpeta static dentro de backend (si tu app la usa así)
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Exponer el puerto que Railway asignará
EXPOSE ${PORT}

# Comando de inicio corregido
# Usamos sh -c para que las variables de entorno como $PORT se interpreten correctamente
CMD ["sh", "-c", "PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]