"""
Train Anomaly Detector

Trains an Isolation Forest model to detect unusual spikes in confusion signals.
"""
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

from ml.utils.model_registry import register_model
from ml.data.generate_demo_dataset import generate_anomaly_dataset

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic')
DATA_PATH = os.path.join(DATA_DIR, 'anomaly_signals.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'anomaly_detector_model.joblib')

def train():
    print("[TRAIN] Starting Anomaly Detector training...")

    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Generating synthetic data...")
        df = generate_anomaly_dataset()
    else:
        df = pd.read_csv(DATA_PATH)

    # Use signal count for anomaly detection
    X = df[['signal_count']].values

    print("  Training Isolation Forest...")
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=45)
    model.fit(X)

    # Evaluate on training data (unsupervised, so just check contamination rate)
    preds = model.predict(X)
    anomaly_rate = sum(preds == -1) / len(preds)
    
    metrics = {
        'contamination_rate': 0.05,
        'detected_anomaly_rate': round(anomaly_rate, 4)
    }
    
    print(f"  Evaluation - Detected Anomaly Rate: {anomaly_rate:.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({
        'model': model,
        'feature_names': ['signal_count']
    }, MODEL_PATH)

    dataset_type = df['dataset_type'].iloc[0] if 'dataset_type' in df.columns else 'synthetic'
    register_model('anomaly_detector', 'v1.0', ['signal_count'], metrics, dataset_type)
    
    print(f"[TRAIN] Model saved to {MODEL_PATH}")
    return metrics

if __name__ == '__main__':
    train()
