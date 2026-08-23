@echo off
echo.
echo ========================================
echo   Commit & Push to GitHub
echo ========================================
echo.

echo Checking Git status...
git status
echo.

echo Adding all changes...
git add .
echo.

echo Committing changes...
git commit -m "Fix TypeScript build errors and mobile UI improvements"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Changes Pushed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Render dashboard: https://dashboard.render.com
echo 2. Click your backend service
echo 3. Click "Manual Deploy" → "Deploy latest commit"
echo 4. Wait 2-3 minutes for deployment
echo 5. Update Netlify environment variable with new backend URL
echo.
pause
