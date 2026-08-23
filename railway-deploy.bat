@echo off
echo.
echo ========================================
echo   Deploy Cogniva Backend to Railway
echo ========================================
echo.

echo This script will help you deploy the backend to Railway (free hosting)
echo.
pause

echo.
echo [1/4] Checking Railway CLI...
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
) else (
    echo ✅ Railway CLI is installed
)
echo.

echo [2/4] Login to Railway...
echo Opening browser for authentication...
railway login
echo.

echo [3/4] Navigating to backend directory...
cd backend
echo.

echo [4/4] Deploying backend...
echo This will take a few minutes...
echo.
railway init
railway up
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Copy the URL shown above (something like: https://xxx.up.railway.app)
echo.
echo Next steps:
echo 1. Go to Netlify dashboard
echo 2. Add environment variable: VITE_API_URL = YOUR_RAILWAY_URL/api
echo 3. Trigger new deploy in Netlify
echo.
pause
