"""
Train Early Warning Model

Trains an early warning classifier to proactively predict student struggle.
"""
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
import joblib

from ml.features.feature_engineering import EARLY_WARNING_FEATURES
from ml.evaluation.metrics import classification_metrics
from ml.utils.model_registry import register_model
from ml.data.generate_demo_dataset import generate_early_warning_dataset

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic')
DATA_PATH = os.path.join(DATA_DIR, 'early_warning.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'early_warning_model.joblib')

def train():
    print("[TRAIN] Starting Early Warning Model training...")

    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Generating synthetic data...")
        df = generate_early_warning_dataset()
    else:
        df = pd.read_csv(DATA_PATH)

    X = df[EARLY_WARNING_FEATURES]
    y = df['will_struggle']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=43)

    print("  Training GradientBoostingClassifier...")
    model = GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=43)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = classification_metrics(y_test, y_pred, y_proba)
    print(f"  Evaluation - ROC-AUC: {metrics.get('roc_auc', 0):.4f}, F1: {metrics['f1_score']:.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({
        'model': model,
        'model_name': 'GradientBoosting',
        'feature_names': EARLY_WARNING_FEATURES
    }, MODEL_PATH)

    dataset_type = df['dataset_type'].iloc[0] if 'dataset_type' in df.columns else 'synthetic'
    register_model('early_warning', 'v1.0', EARLY_WARNING_FEATURES, metrics, dataset_type)
    
    print(f"[TRAIN] Model saved to {MODEL_PATH}")
    return metrics

if __name__ == '__main__':
    train()
