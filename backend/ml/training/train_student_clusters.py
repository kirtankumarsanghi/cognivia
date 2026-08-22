"""
Train Student Clusters Model

Trains a K-Means model to group students into learning profiles.
"""
import os
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

from ml.features.feature_engineering import STUDENT_PROFILE_FEATURES
from ml.evaluation.metrics import clustering_metrics
from ml.utils.model_registry import register_model
from ml.data.generate_demo_dataset import generate_student_profile_dataset
from ml.inference.student_profile import CLUSTER_LABELS

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic')
DATA_PATH = os.path.join(DATA_DIR, 'student_profiles.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'student_clusters_model.joblib')

def train():
    print("[TRAIN] Starting Student Clusters training...")

    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Generating synthetic data...")
        df = generate_student_profile_dataset()
    else:
        df = pd.read_csv(DATA_PATH)

    X = df[STUDENT_PROFILE_FEATURES]

    print("  Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k = min(len(CLUSTER_LABELS), len(X))
    print(f"  Training KMeans with k={k}...")
    model = KMeans(n_clusters=k, random_state=44, n_init=10)
    labels = model.fit_predict(X_scaled)

    metrics = clustering_metrics(X_scaled, labels)
    print(f"  Evaluation - Silhouette Score: {metrics.get('silhouette_score', 0):.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({
        'model': model,
        'scaler': scaler,
        'feature_names': STUDENT_PROFILE_FEATURES
    }, MODEL_PATH)

    dataset_type = df['dataset_type'].iloc[0] if 'dataset_type' in df.columns else 'synthetic'
    register_model('student_clusters', 'v1.0', STUDENT_PROFILE_FEATURES, metrics, dataset_type)
    
    print(f"[TRAIN] Model saved to {MODEL_PATH}")
    return metrics

if __name__ == '__main__':
    train()
