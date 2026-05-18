@echo off
echo Parando servidor Eletricista Pro...
taskkill /F /FI "WINDOWTITLE eq Servidor Eletricista Pro*" /T >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Servidor Eletricista Pro*" >nul 2>&1
echo Servidor parado.
pause
