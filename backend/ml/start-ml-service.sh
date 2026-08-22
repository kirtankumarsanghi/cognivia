#!/bin/bash

# Start ML Service (Python Flask)
# This script starts the ML inference server

echo "🤖 Starting Cogniva ML Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if models exist
if [ ! -d "models" ]; then
    echo "⚠️  Warning: models directory not found. Training models first..."
    python -c "from training.train_confusion_model import train as train_conf; train_conf()"
    python -c "from training.train_early_warning_model import train as train_warning; train_warning()"
    python -c "from training.train_student_clusters import train as train_clusters; train_clusters()"
fi

# Start Flask app
echo "🚀 Starting ML service on http://localhost:5001..."
export FLASK_ENV=development
python app.py

