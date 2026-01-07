#!/bin/bash
# Instalador automatizado para Mac/Linux
# Ejecuta: bash install-unix.sh

# Instala Homebrew si no está instalado (Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install node python git
else
  # Linux: instala dependencias
  if command -v apt &> /dev/null; then
    sudo apt update && sudo apt install -y nodejs npm python3 python3-venv python3-pip git curl
  elif command -v yum &> /dev/null; then
    sudo yum install -y nodejs npm python3 python3-venv python3-pip git curl
  fi
fi

# Instala Supabase CLI
if [[ "$OSTYPE" == "darwin"* ]]; then
  brew install supabase/tap/supabase
else
  curl -sL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | sudo tar -xz -C /usr/local/bin supabase
fi

# Clona el repositorio si no existe
if [ ! -d "SOFTCON-CONSTRU-WM-02" ]; then
  git clone https://github.com/salazaroliveros-prog/SOFTCON-CONSTRUCTORA-WM.git
fi

# Instala dependencias del backend
cd SOFTCON-CONSTRU-WM-02/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Instala dependencias del frontend
cd frontend
npm install
cd ..

echo "Instalación completada. Configura tus variables y ejecuta los servicios según la documentación."
