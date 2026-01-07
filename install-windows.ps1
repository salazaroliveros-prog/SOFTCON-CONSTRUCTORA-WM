# Instalador automatizado para Windows (PowerShell)
# Ejecuta este script como Administrador

# Instala Chocolatey si no está instalado
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Instala Node.js, Python, Git y Supabase CLI
choco install -y nodejs-lts python git

# Instala Supabase CLI (descarga el instalador oficial)
$installer = "supabase_windows_amd64.msi"
Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.msi" -OutFile $installer
Start-Process msiexec.exe -Wait -ArgumentList "/i $installer /quiet"

# Clona el repositorio si no existe
if (-not (Test-Path "SOFTCON-CONSTRU-WM-02")) {
    git clone https://github.com/salazaroliveros-prog/SOFTCON-CONSTRUCTORA-WM.git
}

# Instala dependencias del backend
cd SOFTCON-CONSTRU-WM-02/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Instala dependencias del frontend
cd frontend
npm install
cd ..

Write-Host "Instalación completada. Configura tus variables y ejecuta los servicios según la documentación."
