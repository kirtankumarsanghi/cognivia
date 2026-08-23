@echo off
echo.
echo ========================================
echo   Starting Cogniva Development Servers
echo ========================================
echo.

echo [1/3] Starting Backend API (Port 5000)...
start "Cogniva Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting ML Service (Port 5001)...
start "Cogniva ML Service" cmd /k "cd backend\ml && python app.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (Port 5173)...
start "Cogniva Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Backend API:    http://localhost:5000
echo ML Service:     http://localhost:5001
echo Frontend:       http://localhost:5173
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
