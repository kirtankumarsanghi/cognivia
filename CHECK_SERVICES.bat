@echo off
echo.
echo ========================================
echo   Checking Cogniva Services Status
echo ========================================
echo.

echo [1/3] Checking Backend API (Port 5000)...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is RUNNING
) else (
    echo ❌ Backend is NOT RUNNING
    echo    Start with: cd backend ^&^& npm run dev
)
echo.

echo [2/3] Checking ML Service (Port 5001)...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ML Service is RUNNING
) else (
    echo ❌ ML Service is NOT RUNNING
    echo    Start with: cd backend\ml ^&^& python app.py
)
echo.

echo [3/3] Checking Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is RUNNING
) else (
    echo ❌ Frontend is NOT RUNNING
    echo    Start with: cd frontend ^&^& npm run dev
)
echo.

echo ========================================
echo   Status Check Complete
echo ========================================
echo.
echo To start all services, run: start-dev.bat
echo.
pause
