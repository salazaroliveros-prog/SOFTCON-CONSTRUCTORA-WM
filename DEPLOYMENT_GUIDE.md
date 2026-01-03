# 🚀 Guía de Despliegue en Vercel + Railway

## 📋 Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Railway](https://railway.app)
- Cuenta en [Supabase](https://supabase.com) (base de datos Postgres)

## 1️⃣ Configurar Base de Datos (Supabase)

1. Crear proyecto en Supabase
2. Ir a **Settings → Database**
3. Copiar el **Connection string (Pooler)**
4. Formato: `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require`

## 2️⃣ Deploy Backend en Railway

### Paso 1: Crear Proyecto
1. Railway → **New Project → Deploy from GitHub repo**
2. Seleccionar tu repositorio `SOFTCON-CONSTRUCTORA-WM`
3. Railway detectará automáticamente el `Dockerfile` en la raíz

### Paso 2: Configurar Variables de Entorno
En Railway → Settings → Variables:

```bash
# BASE DE DATOS (Requerido)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres?sslmode=require

# SEGURIDAD (Requerido)
SECRET_KEY=tu-secreto-super-largo-y-aleatorio-aqui
BOOTSTRAP_ADMIN_TOKEN=otro-token-super-seguro-para-crear-admin

# JWT (Opcional)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# IA OPENAI (Opcional - para APU inteligentes)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# WHATSAPP (Opcional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+50212345678
ENABLE_WHATSAPP_REPEAT_EVERY=false
NOMBRE_DUENO=Tu Nombre
```

### Paso 3: Deploy
1. Railway iniciará el build automáticamente
2. Esperar a que esté **Active**
3. Copiar la URL pública (ej: `https://softcon-production.up.railway.app`)

### Paso 4: Crear Primer Admin
```bash
curl -X POST https://tu-backend.railway.app/auth/bootstrap-admin \
  -H "X-BOOTSTRAP-TOKEN: tu-token-bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@tucorreo.com",
    "password": "Admin12345!"
  }'
```

## 3️⃣ Deploy Frontend en Vercel

### Paso 1: Importar Proyecto
1. Vercel → **Add New → Project**
2. Importar desde GitHub: `SOFTCON-CONSTRUCTORA-WM`
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`

### Paso 2: Configurar Build
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Paso 3: Variables de Entorno
En Vercel → Settings → Environment Variables:

```bash
VITE_API_URL=https://softcon-production.up.railway.app
```

⚠️ **IMPORTANTE**: Reemplazar con tu URL real de Railway

### Paso 4: Deploy
1. Click **Deploy**
2. Esperar a que termine el build
3. Vercel te dará una URL (ej: `https://softcon-wm.vercel.app`)

## 4️⃣ Verificar Despliegue

### Backend (Railway)
```bash
curl https://tu-backend.railway.app/
# Debe retornar: {"status":"Online","msg":"API Construct-ERP Activa"}
```

### Frontend (Vercel)
1. Abrir `https://tu-frontend.vercel.app`
2. Ir a `/login`
3. Ingresar con el admin creado
4. Debe entrar al dashboard

## 🔧 Troubleshooting

### Error: "Missing DATABASE_URL"
- Verificar que la variable esté en Railway
- Verificar que empiece con `postgresql://`

### Error: Frontend no conecta con backend
- Verificar `VITE_API_URL` en Vercel
- Verificar CORS en Railway (ya está configurado en `main.py`)

### Error: "Usuario pendiente de aprobación"
- Usar endpoint `/auth/bootstrap-admin` para crear primer admin
- O aprobar desde admin existente

## 📊 Monitoreo

### Railway
- Logs en tiempo real: Railway → Project → Deployments → View Logs
- Métricas: Railway → Project → Metrics

### Vercel
- Analytics: Vercel → Project → Analytics
- Logs: Vercel → Project → Deployments → View Function Logs

## 🔄 Actualizaciones

Cualquier push a `main` dispara:
- Railway: Rebuild automático del backend
- Vercel: Rebuild automático del frontend

## 🆘 Soporte

Si tienes problemas:
1. Revisar logs de Railway/Vercel
2. Verificar variables de entorno
3. Probar endpoints con curl
4. Contactar soporte técnico
