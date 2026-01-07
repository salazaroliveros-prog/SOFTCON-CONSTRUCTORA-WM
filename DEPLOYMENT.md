# Guía de despliegue multiplataforma

## Windows
1. Descarga y ejecuta `install-windows.ps1` como Administrador:
  - Haz clic derecho en el archivo y selecciona "Ejecutar con PowerShell".
2. Sigue las instrucciones en pantalla.

## Mac/Linux
1. Abre una terminal y ejecuta:
  ```bash
  bash install-unix.sh
  ```
2. Sigue las instrucciones en pantalla.

## Móviles/Tablets
- Accede desde el navegador web. El sistema es compatible y responsivo.
- Para experiencia tipo app, instala como PWA desde el navegador.

## Requisitos generales
- Acceso a internet para la instalación inicial.
- Permisos de administrador para instalar dependencias.
- Configura variables de entorno y credenciales según la documentación del proyecto.

## Notas
- Reemplaza `<URL_DEL_REPOSITORIO>` en los scripts por la URL real de tu repositorio.
- Si usas Supabase, asegúrate de tener el CLI instalado y vinculado.
- Consulta la documentación para comandos de desarrollo y producción.

---
¿Dudas? Contacta al equipo técnico o revisa la documentación oficial incluida en el proyecto.
# Deploy: GitHub + Supabase + Railway + Vercel

This repo is a small monorepo:
- Backend: `backend/` (FastAPI)
- Frontend: `frontend/` (Vite + React)
- DB: Supabase Postgres

## 1) GitHub
1. Create a GitHub repo.
2. Push this code:
   - `git init`
   - `git add .`
   - `git commit -m "initial"`
   - `git branch -M main`
   - `git remote add origin <YOUR_GITHUB_REPO_URL>`
   - `git push -u origin main`

## 2) Supabase (Database)
1. Create a Supabase project.
2. Run the schema SQL in Supabase SQL editor:
   - Use `backend/supabase_schema.sql` (generated).
3. Copy the **connection string** (pooler or direct).

Required DB env var format:
- Pooler example:
  - `postgresql://postgres.<ref>:<DB_PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require`

## 3) Railway (Backend)
Railway will deploy the backend from GitHub using the repo-root `Dockerfile`.

### Create Railway project
1. Railway → New Project → Deploy from GitHub Repo.
2. Select this repo.

### Set Railway environment variables
In Railway → Variables:
- `DATABASE_URL` = your Supabase Postgres connection string
- `SECRET_KEY` = long random string
- `BOOTSTRAP_ADMIN_TOKEN` = long random string (used once to create the first admin)
- `JWT_ALGORITHM` = `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` = `480`

Optional:
- `OPENAI_API_KEY`
- WhatsApp/Twilio vars if you enable that feature

### Health check
After deploy, open the Railway backend URL:
- `GET /` should return `{"status":"Online",...}`

## 4) Vercel (Frontend)
1. Vercel → New Project → Import Git Repo.
2. Select this repo.
3. Set **Root Directory** to `frontend/`.

Build settings:
- Build Command: `npm run build`
- Output Directory: `dist`

### Vercel environment variable
In Vercel → Settings → Environment Variables:
- `VITE_API_URL` = `https://<your-railway-backend-domain>`

Redeploy after setting env.

## 5) Create the first admin (production)
Call once (example with curl):

- `POST https://<backend>/auth/bootstrap-admin`
- Header: `X-BOOTSTRAP-TOKEN: <BOOTSTRAP_ADMIN_TOKEN>`
- JSON body:
  - `{ "username": "admin", "email": "admin@demo.local", "password": "Admin12345!" }`

After that:
- Users can register with `/auth/register` and will be **pending**.
- Admin approves users in `/auth/admin/users/pending`.

## Notes
- If you already have an admin in DB, `/auth/bootstrap-admin` returns 400 (expected).
- Password hashing supports PBKDF2 (new) and bcrypt (legacy).
