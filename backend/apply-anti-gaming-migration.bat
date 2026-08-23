@echo off
echo ============================================
echo  Anti-Gaming Rate Limits - Database Setup
echo ============================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found
    echo Please create .env with your SUPABASE_URL
    pause
    exit /b 1
)

REM Load SUPABASE_URL from .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="SUPABASE_URL" set SUPABASE_URL=%%b
    if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" set SUPABASE_SERVICE_ROLE_KEY=%%b
)

if "%SUPABASE_URL%"=="" (
    echo ERROR: SUPABASE_URL not found in .env
    pause
    exit /b 1
)

echo Found Supabase URL: %SUPABASE_URL%
echo.
echo This will:
echo  1. Create rate_limit_violations table
echo  2. Create rate_limit_config table
echo  3. Add weight column to practice_attempts
echo  4. Create monitoring views and functions
echo  5. Set up Row Level Security policies
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Running migration...
echo.

REM Use psql if available
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using psql...
    psql %SUPABASE_URL% -f ..\database\rate_limiting_schema.sql
) else (
    echo psql not found. Please install PostgreSQL client tools.
    echo.
    echo Alternatively, you can:
    echo  1. Go to https://supabase.com/dashboard
    echo  2. Select your project
    echo  3. Go to SQL Editor
    echo  4. Copy contents from: database\rate_limiting_schema.sql
    echo  5. Paste and run
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Migration Complete!
echo ============================================
echo.
echo Next steps:
echo  1. Restart your backend server
echo  2. Test with: npm run dev
echo  3. Check monitoring dashboard
echo.
pause
