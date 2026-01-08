# Este script automatiza el arranque del servidor Vite y la ejecución del test Playwright
# Uso: Ejecuta este script desde la raíz del proyecto con PowerShell

# Limpiar cachés y procesos previos
Write-Host "Limpiando cachés y procesos previos..."
$ErrorActionPreference = 'SilentlyContinue'
Remove-Item -Recurse -Force ./frontend/.cache, ./frontend/node_modules/.cache, ./frontend/dist, ./backend/__pycache__, ./backend/tests/__pycache__, ./backend/.pytest_cache, ./__pycache__, ./.pytest_cache
$ErrorActionPreference = 'Continue'

# Iniciar Vite en segundo plano
echo "Iniciando servidor Vite..."
Start-Process powershell -ArgumentList 'cd frontend; npm run dev' -WindowStyle Minimized

# Esperar a que Vite esté listo
Write-Host "Esperando a que el servidor Vite esté disponible en http://localhost:5173 ..."
$maxTries = 20
$try = 0
while ($try -lt $maxTries) {
    try {
        $response = Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "Servidor Vite listo. Ejecutando test Playwright..."
            break
        }
    } catch {
        Start-Sleep -Seconds 1
        $try++
    }
}
if ($try -eq $maxTries) {
    Write-Host "No se pudo conectar a Vite. Abortando test."
    exit 1
}

# Ejecutar test Playwright
echo "Ejecutando test Playwright..."
npx playwright test frontend/tests/frontend_auth_dashboard.spec.js
