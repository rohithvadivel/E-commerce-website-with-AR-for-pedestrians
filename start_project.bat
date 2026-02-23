@echo off
echo Starting MERN E-commerce Project...
echo Backend: Port 5000
echo Frontend: Port 5173 (HTTPS)

cd /d "%~dp0"
npm run dev
pause
