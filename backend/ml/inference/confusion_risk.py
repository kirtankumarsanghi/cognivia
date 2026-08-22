"""
Confusion Risk Prediction — Model 2

Supervised classification model predicting:
"How likely is this student to struggle with this concept?"

Trains Logistic Regression, Random Forest, and Gradient Boosting,
then automatically selects the best-performing model by ROC-AUC.
"""
import os
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'confusion_risk_model.joblib')

# The loaded model (set by load_model or train)
_model = None
_model_name = None
_feature_names = None


FEATURE_NAMES = [
    'current_mastery',
    'prerequisite_avg',
    'prerequisite_min',
    'incorrect_attempts',
    'recent_accuracy',
    'confusion_frequency',
    'recent_confusion_count',
    'time_since_last_practice',
    'total_attempts',
    'streak',
    'revision_completion_rate',
    'previous_concept_accuracy',
]


def _extract_feature_vector(features):
    """Extract ordered feature vector from a dict."""
    return [float(features.get(name, 0.0)) for name in FEATURE_NAMES]


def load_model():
    """Load the trained model from disk."""
    global _model, _model_name, _feature_names
    if os.path.exists(MODEL_PATH):
        saved = joblib.load(MODEL_PATH)
        _model = saved['model']
        _model_name = saved['model_name']
        _feature_names = saved.get('feature_names', FEATURE_NAMES)
        return True
    return False


def predict(features):
    """
    Predict confusion risk for a student-concept pair.

    Args:
        features: dict with keys matching FEATURE_NAMES

    Returns:
        dict with confusion_probability, risk_level, model, feature_contributions
    """
    global _model, _model_name

    if _model is None:
        if not load_model():
            # Fallback: rule-based estimate
            return _rule_based_prediction(features)

    X = np.array([_extract_feature_vector(features)])
    probability = float(_model.predict_proba(X)[0][1])

    # Compute feature contributions (importance-based explanation)
    contributions = _explain_prediction(features, probability)

    if probability >= 0.7:
        risk_level = 'high'
    elif probability >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    return {
        'confusion_probability': round(probability, 4),
        'risk_level': risk_level,
        'risk_percentage': round(probability * 100),
        'model': _model_name or 'confusion_risk',
        'feature_contributions': contributions,
    }


def _explain_prediction(features, probability):
    """Generate human-readable explanations for the prediction."""
    contributions = []

    mastery = features.get('current_mastery', 0.5)
    if mastery < 0.45:
        contributions.append({
            'factor': 'Low current mastery',
            'value': f'{mastery*100:.0f}%',
            'impact': 'high'
        })

    prereq = features.get('prerequisite_avg', 0.5)
    if prereq < 0.5:
        contributions.append({
            'factor': 'Low prerequisite mastery',
            'value': f'{prereq*100:.0f}%',
            'impact': 'high'
        })

    recent_acc = features.get('recent_accuracy', 0.5)
    if recent_acc < 0.5:
        contributions.append({
            'factor': 'Recent attempts mostly incorrect',
            'value': f'{recent_acc*100:.0f}% accuracy',
            'impact': 'high'
        })

    confusion_freq = features.get('confusion_frequency', 0.0)
    if confusion_freq > 0.3:
        contributions.append({
            'factor': 'Frequent confusion signals',
            'value': f'{confusion_freq*100:.0f}% of interactions',
            'impact': 'medium'
        })

    recent_confusion = features.get('recent_confusion_count', 0)
    if recent_confusion >= 2:
        contributions.append({
            'factor': 'Recent confusion signals',
            'value': f'{int(recent_confusion)} signals this week',
            'impact': 'medium'
        })

    streak = features.get('streak', 0)
    if streak >= 3:
        contributions.append({
            'factor': 'Learning streak',
            'value': f'{int(streak)} correct in a row',
            'impact': 'low'  # positive factor
        })

    return contributions


def _rule_based_prediction(features):
    """Fallback rule-based confusion risk when no model is available."""
    mastery = features.get('current_mastery', 0.5)
    prereq = features.get('prerequisite_avg', 0.5)
    recent_acc = features.get('recent_accuracy', 0.5)
    confusion_freq = features.get('confusion_frequency', 0.0)

    # Simple weighted formula
    risk = (
        (1.0 - mastery) * 0.3
        + (1.0 - prereq) * 0.25
        + (1.0 - recent_acc) * 0.25
        + confusion_freq * 0.2
    )
    risk = max(0.0, min(1.0, risk))

    if risk >= 0.7:
        risk_level = 'high'
    elif risk >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    return {
        'confusion_probability': round(risk, 4),
        'risk_level': risk_level,
        'risk_percentage': round(risk * 100),
        'model': 'rule_based_fallback',
        'feature_contributions': _explain_prediction(features, risk),
    }
