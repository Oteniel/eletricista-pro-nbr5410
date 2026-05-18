@echo off
chcp 65001 >nul
echo ============================================
echo   Eletricista Pro - Gerador de APK Android
echo   Versao 7.0
echo ============================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js encontrado.
echo.

echo [2/5] Preparando arquivos web...
node build-mobile.js
echo.

echo [3/5] Instalando dependencias do Capacitor...
call npm install
if %errorlevel% neq 0 (
    echo ERRO ao instalar dependencias!
    pause
    exit /b 1
)
echo.

echo [4/5] Sincronizando com Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo AVISO: Platform Android nao encontrada.
    echo Adicionando platform Android...
    call npx cap add android
    call npx cap sync android
)
echo.

echo [5/5] Abrindo Android Studio...
echo.
echo ============================================
echo   Para gerar o APK:
echo ============================================
echo   1. O Android Studio vai abrir
echo   2. Aguarde o Gradle sincronizar
echo   3. Menu: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo   4. O APK sera gerado em: android\app\build\outputs\apk\debug\
echo.
echo   Ou pelo terminal (com Android SDK instalado):
echo   cd android ^&^& gradlew assembleDebug
echo ============================================
echo.

call npx cap open android

pause
