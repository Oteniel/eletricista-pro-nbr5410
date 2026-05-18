@echo off
chcp 65001 >nul
echo ============================================
echo   Eletricista Pro - Abrir no Navegador
echo   Funciona OFFLINE - sem internet
echo ============================================
echo.

cd /d "%~dp0"

echo Abrindo o app no navegador padrao...
echo O app funciona 100% offline!
echo.

start "" "index.html"

echo.
echo ============================================
echo   Para usar no CELULAR:
echo ============================================
echo.
echo   Opcao 1 - APK Android (Recomendado):
echo     Execute: gerar_apk.bat
echo.
echo   Opcao 2 - Copiar para o celular:
echo     1. Conecte o celular por USB
echo     2. Copie TODA a pasta eletricista-pro-nbr5410
echo     3. No celular, abra o arquivo index.html
echo.
echo   Opcao 3 - Via Wi-Fi (mesma rede):
echo     1. Execute: iniciar.bat
echo     2. No celular, acesse o IP mostrado
echo.
echo ============================================
echo.
pause
