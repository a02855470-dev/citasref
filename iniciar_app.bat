@echo off
color 0b
title Servidor CITASREF
echo =======================================================
echo          INICIANDO SERVIDOR DE CITASREF
echo =======================================================
echo.
echo 📱 Para ver la aplicacion en tu TELEFONO,
echo    asegurate de estar conectado al mismo WiFi y abre este link:
echo.
echo    http://192.168.18.9:5173
echo.
echo =======================================================
echo.
echo Presiona CTRL+C para detener el servidor cuando termines.
echo.
call npm run dev -- --host
pause
