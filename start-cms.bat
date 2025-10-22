@echo off
echo Starting FutureMind Application...
echo.

echo [1/2] Starting Next.js Development Server (Port 3000)...
start "Next.js Dev Server" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 5 /nobreak >nul

echo [2/2] Starting Upload Server (Port 3002)...
start "Upload Server" cmd /k "cd /d %~dp0 && node scripts/upload-server.js"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   FutureMind Application Started!
echo ========================================
echo.
echo 🌐 Main Application:     http://localhost:3000
echo 📋 Content Management:   http://localhost:3000/final
echo 📁 Upload Service:       http://localhost:3002
echo.
echo Opening Content Management Interface...
start http://localhost:3000/final

echo.
echo Press any key to exit...
pause >nul
