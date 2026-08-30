"""
Concept Difficulty Estimation — Model 4

Estimates concept difficulty using actual student outcomes rather than
assuming every concept has the same difficulty.

Uses: average correctness, average attempts, confusion frequency,
average mastery time, revision frequency, re-explanation rate.

Output: Difficulty Score 0-100
"""
import numpy as np


def calculate_difficulty(concept_stats):
    """
    Calculate concept difficulty from aggregate student outcome data.

    Args:
        concept_stats: dict with keys:
            - avg_correctness: float 0-1 (average correctness across students)
            - avg_attempts: float (average attempts per student)
            - confusion_frequency: float 0-1 (fraction of students who signaled confusion)
            - avg_mastery_time: float (average time to reach 70% mastery, in sessions)
            - revision_frequency: float 0-1 (fraction of students who revised this concept)
            - re_explanation_rate: float 0-1 (fraction needing re-explanation)

    Returns:
        dict with difficulty_score, difficulty_level, contributing_factors
    """
    avg_correct = concept_stats.get('avg_correctness', 0.5)
    avg_attempts = concept_stats.get('avg_attempts', 3.0)
    confusion_freq = concept_stats.get('confusion_frequency', 0.2)
    avg_mastery_time = concept_stats.get('avg_mastery_time', 2.0)
    revision_freq = concept_stats.get('revision_frequency', 0.3)
    re_explanation = concept_stats.get('re_explanation_rate', 0.2)

    # Normalize each component to 0-1 where higher = harder
    error_rate = 1.0 - avg_correct  # 0-1
    attempt_difficulty = min(avg_attempts / 10.0, 1.0)  # Cap at 10 attempts
    mastery_time_norm = min(avg_mastery_time / 10.0, 1.0)  # Cap at 10 sessions

    # Weighted combination
    difficulty_raw = (
        error_rate * 0.25
        + attempt_difficulty * 0.15
        + confusion_freq * 0.20
        + mastery_time_norm * 0.15
        + revision_freq * 0.15
        + re_explanation * 0.10
    )

    # Scale to 0-100
    difficulty_score = round(min(100.0, max(0.0, difficulty_raw * 100)), 1)

    # Categorize
    if difficulty_score >= 75:
        level = 'very_hard'
    elif difficulty_score >= 55:
        level = 'hard'
    elif difficulty_score >= 35:
        level = 'moderate'
    elif difficulty_score >= 15:
        level = 'easy'
    else:
        level = 'very_easy'

    # Contributing factors
    factors = []
    if error_rate > 0.5:
        factors.append({'factor': 'High error rate', 'value': f'{error_rate*100:.0f}%', 'impact': 'high'})
    if confusion_freq > 0.4:
        factors.append({'factor': 'Frequent confusion signals', 'value': f'{confusion_freq*100:.0f}%', 'impact': 'high'})
    if avg_attempts > 5:
        factors.append({'factor': 'Many attempts needed', 'value': f'{avg_attempts:.1f} avg', 'impact': 'medium'})
    if revision_freq > 0.4:
        factors.append({'factor': 'High revision rate', 'value': f'{revision_freq*100:.0f}%', 'impact': 'medium'})
    if re_explanation > 0.3:
        factors.append({'factor': 'Re-explanation needed', 'value': f'{re_explanation*100:.0f}%', 'impact': 'medium'})

    return {
        'difficulty_score': difficulty_score,
        'difficulty_level': level,
        'model': 'concept_difficulty_v1',
        'contributing_factors': factors,
        'components': {
            'error_rate': round(error_rate, 4),
            'attempt_difficulty': round(attempt_difficulty, 4),
            'confusion_component': round(confusion_freq, 4),
            'mastery_time_component': round(mastery_time_norm, 4),
            'revision_component': round(revision_freq, 4),
            're_explanation_component': round(re_explanation, 4),
        }
    }
