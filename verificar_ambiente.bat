@echo off
chcp 65001 >nul
echo ============================================
echo   Eletricista Pro - Verificar Ambiente
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale em: https://nodejs.org/
    goto :end
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER%
echo.

echo Verificando Android SDK...
if defined ANDROID_HOME (
    echo [OK] ANDROID_HOME=%ANDROID_HOME%
) else if defined ANDROID_SDK_ROOT (
    echo [OK] ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%
) else (
    echo [AVISO] Android SDK nao configurado.
    echo.
    echo Para gerar o APK, voce precisa:
    echo 1. Instalar o Android Studio:
    echo    https://developer.android.com/studio
    echo.
    echo 2. Ou configurar o ANDROID_HOME:
    echo    setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
    echo.
    echo Enquanto isso, o app funciona:
    echo - Abrindo index.html no navegador
    echo - Via Wi-Fi com iniciar.bat
    goto :end
)
echo.

echo Verificando platform Android...
if exist "android" (
    echo [OK] Platform Android encontrada
    echo.
    echo ============================================
    echo   Gerando APK Debug...
    echo ============================================
    echo.
    cd android
    call gradlew.bat assembleDebug
    if %errorlevel% equ 0 (
        echo.
        echo ============================================
        echo   APK GERADO COM SUCESSO!
        echo ============================================
        echo.
        echo Local: android\app\build\outputs\apk\debug\app-debug.apk
        echo.
        echo Transfira para o celular e instale.
    ) else (
        echo.
        echo [ERRO] Falha ao gerar APK.
        echo Abra o Android Studio para mais detalhes.
    )
) else (
    echo [ERRO] Platform Android nao encontrada.
    echo Execute: npx cap add android
)

:end
echo.
pause
