"""
Early Warning Model — Model 3

Predicts: "Will this student struggle with the NEXT concept?"
Operates BEFORE the student signals confusion — proactive, not reactive.

Uses prerequisite mastery, recent performance, learning velocity,
and concept difficulty to generate early warnings.
"""
import os
import numpy as np
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'early_warning_model.joblib')

_model = None
_model_name = None

FEATURE_NAMES = [
    'prerequisite_avg',
    'prerequisite_min',
    'previous_accuracy',
    'recent_incorrect',
    'learning_velocity',
    'recent_confusion_count',
    'time_gap_hours',
    'revision_completion',
    'concept_difficulty',
]

RECOMMENDED_ACTIONS = {
    'high': 'Review prerequisite concepts before proceeding',
    'medium': 'Practice similar problems to build confidence',
    'low': 'Continue with the current learning path',
}


def _extract_feature_vector(features):
    return [float(features.get(name, 0.0)) for name in FEATURE_NAMES]


def load_model():
    global _model, _model_name
    if os.path.exists(MODEL_PATH):
        saved = joblib.load(MODEL_PATH)
        _model = saved['model']
        _model_name = saved['model_name']
        return True
    return False


def predict(features):
    """
    Predict early warning risk.

    Args:
        features: dict with keys matching FEATURE_NAMES

    Returns:
        dict with risk_probability, risk_level, recommended_action
    """
    global _model, _model_name

    if _model is None:
        if not load_model():
            return _rule_based_prediction(features)

    X = np.array([_extract_feature_vector(features)])
    probability = float(_model.predict_proba(X)[0][1])

    if probability >= 0.7:
        risk_level = 'high'
    elif probability >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    return {
        'risk_probability': round(probability, 4),
        'risk_level': risk_level,
        'risk_percentage': round(probability * 100),
        'recommended_action': RECOMMENDED_ACTIONS[risk_level],
        'model': _model_name or 'early_warning',
        'feature_contributions': _explain(features),
    }


def _explain(features):
    """Generate human-readable explanations."""
    contribs = []

    prereq = features.get('prerequisite_avg', 0.5)
    if prereq < 0.5:
        contribs.append({
            'factor': 'Prerequisite mastery is low',
            'value': f'{prereq*100:.0f}%',
            'impact': 'high'
        })

    prev_acc = features.get('previous_accuracy', 0.5)
    if prev_acc < 0.5:
        contribs.append({
            'factor': 'Previous concept accuracy was low',
            'value': f'{prev_acc*100:.0f}%',
            'impact': 'high'
        })

    velocity = features.get('learning_velocity', 0.0)
    if velocity < 0:
        contribs.append({
            'factor': 'Learning velocity is declining',
            'value': f'{velocity:.2f}',
            'impact': 'medium'
        })

    difficulty = features.get('concept_difficulty', 50)
    if difficulty > 70:
        contribs.append({
            'factor': 'Upcoming concept has high difficulty',
            'value': f'{difficulty:.0f}/100',
            'impact': 'medium'
        })

    return contribs


def _rule_based_prediction(features):
    """Fallback when no trained model is available."""
    prereq = features.get('prerequisite_avg', 0.5)
    prev_acc = features.get('previous_accuracy', 0.5)
    difficulty = features.get('concept_difficulty', 50) / 100.0
    confusion = features.get('recent_confusion_count', 0) / 5.0

    risk = (
        (1.0 - prereq) * 0.3
        + (1.0 - prev_acc) * 0.25
        + difficulty * 0.25
        + min(confusion, 1.0) * 0.2
    )
    risk = max(0.0, min(1.0, risk))

    if risk >= 0.7:
        risk_level = 'high'
    elif risk >= 0.4:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    return {
        'risk_probability': round(risk, 4),
        'risk_level': risk_level,
        'risk_percentage': round(risk * 100),
        'recommended_action': RECOMMENDED_ACTIONS[risk_level],
        'model': 'rule_based_fallback',
        'feature_contributions': _explain(features),
    }
