# Script PowerShell para gerar APK do Eletricista Pro
# Requer: Node.js, Android Studio (ou Android SDK)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Eletricista Pro - Gerador de APK Android" -ForegroundColor Cyan
Write-Host "  Versao 7.0" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Mudar para o diretorio do script
Set-Location $PSScriptRoot

# Verificar Node.js
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  OK - Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERRO: Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "  Instale em: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Preparar arquivos web
Write-Host ""
Write-Host "[2/5] Preparando arquivos web..." -ForegroundColor Yellow
node build-mobile.js

# Instalar dependencias
Write-Host ""
Write-Host "[3/5] Instalando dependencias do Capacitor..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERRO ao instalar dependencias!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Adicionar/sincronizar Android
Write-Host ""
Write-Host "[4/5] Sincronizando com Android..." -ForegroundColor Yellow

$androidExists = Test-Path "android"
if (-not $androidExists) {
    Write-Host "  Platform Android nao encontrada. Adicionando..." -ForegroundColor Yellow
    npx cap add android
}

npx cap sync android

# Abrir Android Studio
Write-Host ""
Write-Host "[5/5] Abrindo Android Studio..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Para gerar o APK:" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  1. O Android Studio vai abrir" -ForegroundColor White
Write-Host "  2. Aguarde o Gradle sincronizar" -ForegroundColor White
Write-Host "  3. Menu: Build > Build Bundle(s) / APK(s)" -ForegroundColor White
Write-Host "     > Build APK(s)" -ForegroundColor White
Write-Host "  4. O APK sera gerado em:" -ForegroundColor White
Write-Host "     android\app\build\outputs\apk\debug\" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Ou pelo terminal (com Android SDK):" -ForegroundColor White
Write-Host "  cd android && .\gradlew assembleDebug" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

npx cap open android

Write-Host ""
Read-Host "Pressione Enter para sair"
