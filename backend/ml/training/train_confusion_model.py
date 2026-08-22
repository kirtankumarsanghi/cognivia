"""
Train Confusion Risk Model

Trains Logistic Regression, Random Forest, and Gradient Boosting Classifiers
on the synthetic confusion risk dataset. Selects the best model based on ROC-AUC
and registers it.
"""
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import joblib

from ml.features.feature_engineering import CONFUSION_RISK_FEATURES
from ml.evaluation.metrics import classification_metrics
from ml.utils.model_registry import register_model
from ml.data.generate_demo_dataset import generate_confusion_dataset

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic')
DATA_PATH = os.path.join(DATA_DIR, 'confusion_risk.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'confusion_risk_model.joblib')


def train():
    print("[TRAIN] Starting Confusion Risk Model training...")

    # Load data
    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Generating synthetic data...")
        df = generate_confusion_dataset()
    else:
        df = pd.read_csv(DATA_PATH)

    X = df[CONFUSION_RISK_FEATURES]
    y = df['is_confused']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train candidates
    models = {
        'LogisticRegression': LogisticRegression(max_iter=1000, random_state=42),
        'RandomForest': RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
    }

    best_model = None
    best_name = ""
    best_score = 0
    best_metrics = {}

    for name, model in models.items():
        print(f"  Training {name}...")
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        
        metrics = classification_metrics(y_test, y_pred, y_proba)
        score = metrics.get('roc_auc', 0)
        
        print(f"    ROC-AUC: {score:.4f}, F1: {metrics['f1_score']:.4f}")
        
        if score > best_score:
            best_score = score
            best_model = model
            best_name = name
            best_metrics = metrics

    print(f"\n[TRAIN] Selected {best_name} as the best model.")

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({
        'model': best_model,
        'model_name': best_name,
        'feature_names': CONFUSION_RISK_FEATURES
    }, MODEL_PATH)

    # Register
    dataset_type = df['dataset_type'].iloc[0] if 'dataset_type' in df.columns else 'synthetic'
    register_model('confusion_risk', 'v1.0', CONFUSION_RISK_FEATURES, best_metrics, dataset_type)
    
    print(f"[TRAIN] Model saved to {MODEL_PATH}")
    return best_metrics

if __name__ == '__main__':
    train()
