"""
Ensemble Learning Risk — Model 8 (Cogniva Risk Score)

Combines outputs from multiple models into a single Cogniva Risk Score (0-100).

Inputs:
  - BKT mastery probability
  - Confusion risk probability
  - Early warning probability
  - Concept difficulty score
  - Recent confusion count
  - Practice accuracy
  - Prerequisite mastery average
  - Anomaly score

This is clearly labeled as "Cogniva Learning Risk" — NOT claimed
as a scientifically validated score.
"""
import numpy as np


def calculate_learning_risk(model_outputs):
    """
    Calculate the Cogniva Learning Risk Score.

    Args:
        model_outputs: dict with:
            - mastery_probability: float 0-1 (from BKT)
            - confusion_risk: float 0-1 (from confusion model)
            - early_warning_risk: float 0-1 (from early warning model)
            - concept_difficulty: float 0-100 (from difficulty model)
            - recent_confusion_count: int
            - practice_accuracy: float 0-1
            - prerequisite_avg: float 0-1
            - anomaly_detected: bool

    Returns:
        dict with risk_score (0-100), risk_level, main_factors, recommendations
    """
    mastery = model_outputs.get('mastery_probability', 0.5)
    confusion_risk = model_outputs.get('confusion_risk', 0.5)
    early_warning = model_outputs.get('early_warning_risk', 0.5)
    difficulty = model_outputs.get('concept_difficulty', 50) / 100.0
    recent_confusion = min(model_outputs.get('recent_confusion_count', 0) / 5.0, 1.0)
    accuracy = model_outputs.get('practice_accuracy', 0.5)
    prereq = model_outputs.get('prerequisite_avg', 0.5)
    anomaly = 1.0 if model_outputs.get('anomaly_detected', False) else 0.0

    # Weighted ensemble
    risk_raw = (
        (1.0 - mastery) * 0.20        # Low mastery increases risk
        + confusion_risk * 0.20        # High confusion risk increases risk
        + early_warning * 0.15         # High early warning increases risk
        + difficulty * 0.10            # Harder concepts increase risk
        + recent_confusion * 0.10      # Recent confusion increases risk
        + (1.0 - accuracy) * 0.10      # Low practice accuracy increases risk
        + (1.0 - prereq) * 0.10        # Low prerequisites increase risk
        + anomaly * 0.05              # Anomaly detection adds risk
    )

    # Scale to 0-100
    risk_score = round(min(100.0, max(0.0, risk_raw * 100)), 1)

    # Determine risk level
    if risk_score >= 75:
        risk_level = 'critical'
    elif risk_score >= 55:
        risk_level = 'high'
    elif risk_score >= 35:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    # Identify main contributing factors (sorted by impact)
    factors = []
    factor_contributions = [
        ('Low mastery', (1.0 - mastery) * 0.20, mastery < 0.45),
        ('High confusion risk', confusion_risk * 0.20, confusion_risk > 0.5),
        ('Early warning triggered', early_warning * 0.15, early_warning > 0.5),
        ('High concept difficulty', difficulty * 0.10, difficulty > 0.6),
        ('Recent confusion signals', recent_confusion * 0.10, recent_confusion > 0.3),
        ('Low practice accuracy', (1.0 - accuracy) * 0.10, accuracy < 0.5),
        ('Low prerequisite mastery', (1.0 - prereq) * 0.10, prereq < 0.5),
        ('Anomaly detected', anomaly * 0.05, anomaly > 0),
    ]

    for name, contribution, is_active in factor_contributions:
        if is_active:
            # Normalize to a visual bar length (0-10)
            bar_length = int(min(10, contribution * 50))
            factors.append({
                'factor': name,
                'contribution': round(contribution * 100, 1),
                'bar': '█' * bar_length,
            })

    factors.sort(key=lambda x: x['contribution'], reverse=True)

    return {
        'risk_score': risk_score,
        'risk_level': risk_level,
        'model': 'cogniva_learning_risk_v1',
        'main_factors': factors[:5],  # Top 5 factors
        'note': 'Cogniva Learning Risk — demo/synthetic evaluation. Not scientifically validated.',
        'components': {
            'mastery_component': round((1.0 - mastery) * 0.20 * 100, 1),
            'confusion_component': round(confusion_risk * 0.20 * 100, 1),
            'early_warning_component': round(early_warning * 0.15 * 100, 1),
            'difficulty_component': round(difficulty * 0.10 * 100, 1),
            'recent_confusion_component': round(recent_confusion * 0.10 * 100, 1),
            'accuracy_component': round((1.0 - accuracy) * 0.10 * 100, 1),
            'prerequisite_component': round((1.0 - prereq) * 0.10 * 100, 1),
            'anomaly_component': round(anomaly * 0.05 * 100, 1),
        }
    }
