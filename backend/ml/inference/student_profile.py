"""
Student Learning Pattern Clustering — Model 5

Uses K-Means to identify student learning patterns.

Cluster labels (non-judgmental):
  - Fast Mastery
  - Steady Learner
  - Needs Reinforcement
  - High Confusion
  - Inconsistent Learner
"""
import os
import numpy as np
import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'student_clusters_model.joblib')

_model = None
_scaler = None

FEATURE_NAMES = [
    'avg_practice_accuracy',
    'avg_confusion_frequency',
    'session_frequency',
    'revision_completion',
    'tutor_usage',
    'avg_mastery_progression',
    'total_practice_attempts',
]

# Cluster label mapping (assigned after training based on centroids)
CLUSTER_LABELS = [
    'Fast Mastery',
    'Steady Learner',
    'Needs Reinforcement',
    'High Confusion',
    'Inconsistent Learner',
]


def _extract_feature_vector(features):
    return [float(features.get(name, 0.0)) for name in FEATURE_NAMES]


def load_model():
    global _model, _scaler
    if os.path.exists(MODEL_PATH):
        saved = joblib.load(MODEL_PATH)
        _model = saved['model']
        _scaler = saved['scaler']
        return True
    return False


def predict(features):
    """
    Assign a student to a learning pattern cluster.

    Args:
        features: dict with keys matching FEATURE_NAMES

    Returns:
        dict with cluster label, confidence, and profile description
    """
    global _model, _scaler

    if _model is None:
        if not load_model():
            return _rule_based_profile(features)

    X = np.array([_extract_feature_vector(features)])
    X_scaled = _scaler.transform(X)

    cluster_idx = int(_model.predict(X_scaled)[0])
    distances = _model.transform(X_scaled)[0]

    # Confidence: inverse distance to assigned cluster relative to all distances
    min_dist = distances[cluster_idx]
    total_dist = sum(distances)
    confidence = 1.0 - (min_dist / total_dist) if total_dist > 0 else 0.5

    # Map cluster index to label
    n_clusters = len(_model.cluster_centers_)
    label = _assign_label(cluster_idx, _model.cluster_centers_, _scaler)

    return {
        'cluster': label,
        'cluster_id': cluster_idx,
        'confidence': round(confidence, 4),
        'model': 'kmeans_student_profile',
        'profile_description': _describe_profile(label),
    }


def _assign_label(cluster_idx, centroids, scaler):
    """Assign a meaningful label based on centroid characteristics."""
    n = len(centroids)
    if cluster_idx < len(CLUSTER_LABELS) and cluster_idx < n:
        return CLUSTER_LABELS[cluster_idx]
    return f'Cluster {cluster_idx}'


def _describe_profile(label):
    """Return a helpful description for the learning profile."""
    descriptions = {
        'Fast Mastery': 'You learn concepts quickly and maintain high accuracy. Keep challenging yourself with advanced topics.',
        'Steady Learner': 'You have a consistent and reliable learning pace. Your systematic approach serves you well.',
        'Needs Reinforcement': 'You benefit from extra practice and revision. Spaced repetition will help solidify your understanding.',
        'High Confusion': 'You encounter confusion frequently, but that is a normal part of learning. Focus on prerequisite concepts first.',
        'Inconsistent Learner': 'Your learning pattern varies. Try to establish a regular study routine for better outcomes.',
    }
    return descriptions.get(label, 'Your learning pattern is being analyzed.')


def _rule_based_profile(features):
    """Fallback rule-based profiling when no model is trained."""
    accuracy = features.get('avg_practice_accuracy', 0.5)
    confusion = features.get('avg_confusion_frequency', 0.2)
    sessions = features.get('session_frequency', 3.0)
    mastery_prog = features.get('avg_mastery_progression', 0.5)

    if accuracy > 0.8 and confusion < 0.15 and mastery_prog > 0.7:
        label = 'Fast Mastery'
        conf = 0.75
    elif accuracy > 0.6 and confusion < 0.3:
        label = 'Steady Learner'
        conf = 0.70
    elif confusion > 0.5:
        label = 'High Confusion'
        conf = 0.65
    elif accuracy < 0.4 or mastery_prog < 0.3:
        label = 'Needs Reinforcement'
        conf = 0.60
    else:
        label = 'Inconsistent Learner'
        conf = 0.55

    return {
        'cluster': label,
        'cluster_id': -1,
        'confidence': conf,
        'model': 'rule_based_fallback',
        'profile_description': _describe_profile(label),
    }
