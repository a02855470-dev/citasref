@echo off
color 0b
title Subir a GitHub - CITASREF
echo =======================================================
echo          ASISTENTE PARA SUBIR A GITHUB
echo =======================================================
echo.
echo ATENCION: Antes de continuar, asegurate de haber ido a
echo Github.com y haber creado un nuevo repositorio vacio 
echo llamado "citasref".
echo.
pause

echo.
set /p usuario=Escribe tu nombre de usuario de GitHub: 
echo.

echo Configurando repositorio...
git init
git add .
git commit -m "Actualizacion CITASREF"
git branch -M main

echo.
echo Conectando con GitHub de %usuario%...
git remote remove origin 2>nul
git remote add origin https://github.com/%usuario%/citasref.git

echo.
echo Subiendo archivos...
git push -u origin main

echo.
echo =======================================================
if %errorlevel% neq 0 (
    color 0c
    echo Ocurrio un error al subir los archivos.
    echo Asegurate de haber creado el repositorio en Github.
) else (
    color 0a
    echo LOS ARCHIVOS SE SUBIERON CON EXITO A GITHUB!
    echo Ya puedes ir a Vercel a conectar tu proyecto.
)
echo =======================================================
pause
