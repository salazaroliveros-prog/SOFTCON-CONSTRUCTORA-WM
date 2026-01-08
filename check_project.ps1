# ...existing code...
Param()

Write-Host "1) Python: flake8 y compilación"
pip install flake8 | Out-Null
if (Test-Path ".\backend") {
  flake8 .\backend
  python -m compileall .\backend
} else { Write-Host "No se encontró carpeta backend" }

Write-Host "`n2) Validar todos los JSON"
Get-ChildItem -Recurse -Include *.json -File | ForEach-Object {
  try {
    Get-Content -Raw $_.FullName | python -m json.tool > $null
    Write-Host "OK JSON: $($_.FullName)"
  } catch {
    Write-Host "INVALID JSON or unreadable: $($_.FullName)"
  }
}

Write-Host "`n3) Frontend: npm install, eslint, build"
if (Test-Path ".\frontend") {
  Push-Location .\frontend
  npm install
  npx eslint . --ext .js,.jsx,.ts,.tsx
  npm run build
  Pop-Location
} else { Write-Host "No se encontró carpeta frontend" }

Write-Host "`n4) Comprobar llaves { } en archivos fuente (manejo seguro de archivos binarios/vacíos)"
$exts = @("*.js","*.jsx","*.ts","*.tsx","*.py")
Get-ChildItem -Recurse -Include $exts -File -ErrorAction SilentlyContinue | ForEach-Object {
  $f = $_.FullName
  try {
    $content = Get-Content -Raw -ErrorAction Stop $f
  } catch {
    Write-Host "SKIP (no se puede leer): $f"
    return
  }
  if ([string]::IsNullOrEmpty($content)) {
    Write-Host "SKIP (vacío): $f"
    return
  }
  try {
    $open = ([regex]::Matches($content,'\{')).Count
    $close = ([regex]::Matches($content,'\}')).Count
  } catch {
    Write-Host "ERROR parsing regex for file: $f"
    return
  }
  if ($open -ne $close) { Write-Host "BRACES MISMATCH: $f -> { $open } vs } $close" }
}

Write-Host "`nScript finalizado."
# ...existing code...