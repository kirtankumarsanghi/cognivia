"""
Data Preprocessor — Validates and preprocesses input data for ML models.
"""
import numpy as np


def validate_and_clean(features_dict, required_keys, defaults=None):
    """
    Validate that required keys exist and fill defaults for missing optional ones.
    Returns cleaned dict.
    """
    if defaults is None:
        defaults = {}
    cleaned = {}
    for key in required_keys:
        val = features_dict.get(key)
        if val is None:
            val = defaults.get(key, 0.0)
        # Ensure numeric
        try:
            cleaned[key] = float(val)
        except (TypeError, ValueError):
            cleaned[key] = defaults.get(key, 0.0)
    return cleaned


def clip_probability(value, eps=1e-6):
    """Clip a probability to [eps, 1-eps] range."""
    return float(np.clip(value, eps, 1.0 - eps))


def scale_to_percentage(probability):
    """Convert a 0-1 probability to 0-100 percentage."""
    return round(probability * 100, 2)


def risk_level_from_probability(probability):
    """Categorize a probability into risk levels."""
    if probability >= 0.7:
        return 'high'
    elif probability >= 0.4:
        return 'medium'
    else:
        return 'low'


def mastery_status_from_probability(probability):
    """Categorize mastery probability into status labels."""
    if probability >= 0.85:
        return 'mastered'
    elif probability >= 0.65:
        return 'proficient'
    elif probability >= 0.45:
        return 'developing'
    elif probability >= 0.25:
        return 'emerging'
    else:
        return 'novice'
