@echo off
color 0b
title Subir a GitHub - CITASREF
echo =======================================================
echo          SUBIENDO CAMBIOS A GITHUB...
echo =======================================================
echo.

git add .
git commit -m "Actualizacion automatica CITASREF"
git push

echo.
echo =======================================================
if %errorlevel% neq 0 (
    color 0c
    echo Ocurrio un error al subir los archivos. Revisa tu conexion.
) else (
    color 0a
    echo LOS ARCHIVOS SE SUBIERON CON EXITO A GITHUB!
    echo Vercel actualizara tu aplicacion automaticamente en un par de minutos.
)
echo =======================================================
pause
