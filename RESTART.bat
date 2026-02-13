@echo off
echo Redemarrage complet de l'application...
echo.
echo 1. Arretez npm run dev avec Ctrl+C
echo 2. Puis executez ce script
echo.
pause

echo Nettoyage du cache...
rmdir /s /q node_modules\.cache 2>nul
echo Cache nettoye!
echo.

echo Relancement du serveur...
call npm run dev
