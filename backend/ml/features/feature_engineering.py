"""
Feature Engineering — Shared utility functions for extracting and transforming features.
"""
import numpy as np


def compute_prerequisite_features(prerequisite_mastery_scores):
    """Compute aggregate prerequisite features from a list of mastery scores (0-1)."""
    if not prerequisite_mastery_scores:
        return {
            'prerequisite_avg': 0.5,
            'prerequisite_min': 0.5,
            'prerequisite_max': 0.5,
            'prerequisite_std': 0.0,
            'prerequisite_count': 0
        }
    scores = np.array(prerequisite_mastery_scores, dtype=float)
    return {
        'prerequisite_avg': float(np.mean(scores)),
        'prerequisite_min': float(np.min(scores)),
        'prerequisite_max': float(np.max(scores)),
        'prerequisite_std': float(np.std(scores)) if len(scores) > 1 else 0.0,
        'prerequisite_count': len(scores)
    }


def compute_practice_features(attempts):
    """Compute practice-related features from a list of attempt dicts [{correct: bool}]."""
    if not attempts:
        return {
            'total_attempts': 0,
            'correct_count': 0,
            'incorrect_count': 0,
            'accuracy': 0.5,
            'recent_accuracy': 0.5,
            'streak': 0,
        }

    correct_list = [a.get('correct', a) if isinstance(a, dict) else bool(a) for a in attempts]
    total = len(correct_list)
    correct = sum(1 for c in correct_list if c)
    incorrect = total - correct

    # Recent accuracy (last 5 attempts)
    recent = correct_list[-5:]
    recent_accuracy = sum(1 for c in recent if c) / len(recent) if recent else 0.5

    # Current streak (consecutive correct from end)
    streak = 0
    for c in reversed(correct_list):
        if c:
            streak += 1
        else:
            break

    return {
        'total_attempts': total,
        'correct_count': correct,
        'incorrect_count': incorrect,
        'accuracy': correct / total if total > 0 else 0.5,
        'recent_accuracy': recent_accuracy,
        'streak': streak,
    }


def compute_confusion_features(confusion_signals):
    """Compute confusion-related features from signal history."""
    if not confusion_signals:
        return {
            'confusion_count': 0,
            'confusion_frequency': 0.0,
            'recent_confusion_count': 0,
        }
    total = len(confusion_signals)
    confused_count = sum(1 for s in confusion_signals if s.get('signal') == 'Confused')
    recent = confusion_signals[-10:]
    recent_confused = sum(1 for s in recent if s.get('signal') == 'Confused')

    return {
        'confusion_count': confused_count,
        'confusion_frequency': confused_count / total if total > 0 else 0.0,
        'recent_confusion_count': recent_confused,
    }


def normalize_feature_vector(features_dict, feature_names):
    """Extract a feature vector from a dict in a consistent order."""
    return [float(features_dict.get(name, 0.0)) for name in feature_names]


# Standard feature names for the confusion risk model
CONFUSION_RISK_FEATURES = [
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

# Standard feature names for the early warning model
EARLY_WARNING_FEATURES = [
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

# Standard feature names for student clustering
STUDENT_PROFILE_FEATURES = [
    'avg_practice_accuracy',
    'avg_confusion_frequency',
    'session_frequency',
    'revision_completion',
    'tutor_usage',
    'avg_mastery_progression',
    'total_practice_attempts',
]
