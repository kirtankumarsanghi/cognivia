@echo off
REM Start ML Service (Python Flask) - Windows version

echo 🤖 Starting Cogniva ML Service...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📥 Installing dependencies...
python -m pip install -q --upgrade pip
python -m pip install -q -r requirements.txt

REM Check if models exist
if not exist "models" (
    echo ⚠️  Warning: models directory not found. Training models first...
    python -c "from training.train_confusion_model import train as train_conf; train_conf()"
    python -c "from training.train_early_warning_model import train as train_warning; train_warning()"
    python -c "from training.train_student_clusters import train as train_clusters; train_clusters()"
)

REM Start Flask app
echo 🚀 Starting ML service on http://localhost:5001...
set FLASK_ENV=development
python app.py

