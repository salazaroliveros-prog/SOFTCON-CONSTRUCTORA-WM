
# --- ETAPA 1: Construir el Frontend (React + Vite) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- ETAPA 2: Configurar el Backend (Python) ---
FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias de Python desde la carpeta backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el contenido de la carpeta backend
COPY backend/ .

# Copiar la carpeta 'dist' (generada en la Etapa 1) a una carpeta llamada 'static'
COPY --from=frontend-builder /app/frontend/dist ./static

# Configuración de puerto para Railway
ENV PORT=8080
EXPOSE 8080

# Comando para arrancar Uvicorn apuntando a backend/main.py
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"]
