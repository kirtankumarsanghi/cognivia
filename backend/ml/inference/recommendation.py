"""
Recommendation Engine — Generates actionable, personalized learning suggestions.

Based on ML model outputs, generates specific recommendations for:
  - Students: what to study next, how to prepare, where to get help
  - Educators: which students need intervention, what topics to review

NOTE: These are data-driven suggestions, not AI-generated text.
They are template-based recommendations informed by ML predictions.
"""


def generate_student_recommendations(model_outputs):
    """
    Generate recommendations for a student based on their ML profile.

    Args:
        model_outputs: dict containing results from various models:
            - mastery: BKT output
            - confusion_risk: confusion risk output
            - early_warning: early warning output
            - concept_difficulty: difficulty output
            - learning_profile: student cluster output
            - learning_risk: ensemble risk output

    Returns:
        list of recommendation dicts with type, priority, message, action
    """
    recommendations = []

    mastery = model_outputs.get('mastery', {})
    confusion = model_outputs.get('confusion_risk', {})
    warning = model_outputs.get('early_warning', {})
    difficulty = model_outputs.get('concept_difficulty', {})
    profile = model_outputs.get('learning_profile', {})
    risk = model_outputs.get('learning_risk', {})

    # High risk: immediate attention
    risk_score = risk.get('risk_score', 50)
    if risk_score >= 75:
        recommendations.append({
            'type': 'urgent',
            'priority': 1,
            'icon': 'warning',
            'message': 'Your learning risk is elevated. Focus on prerequisite concepts before moving forward.',
            'action': 'Review prerequisites',
        })

    # Low mastery: practice more
    mastery_prob = mastery.get('mastery_probability', 0.5)
    if mastery_prob < 0.45:
        recommendations.append({
            'type': 'practice',
            'priority': 2,
            'icon': 'exercise',
            'message': f'Your mastery is at {mastery_prob*100:.0f}%. Additional practice will help reinforce your understanding.',
            'action': 'Start practice session',
        })

    # High confusion risk: get help
    confusion_prob = confusion.get('confusion_probability', 0.5)
    if confusion_prob > 0.6:
        recommendations.append({
            'type': 'support',
            'priority': 2,
            'icon': 'support_agent',
            'message': 'You may find this concept challenging. Use the AI Tutor for a step-by-step breakdown.',
            'action': 'Open AI Tutor',
        })

    # Early warning: prep ahead
    warning_risk = warning.get('risk_probability', 0.5)
    if warning_risk > 0.6:
        action = warning.get('recommended_action', 'Review prerequisite concepts')
        recommendations.append({
            'type': 'preparation',
            'priority': 3,
            'icon': 'event_upcoming',
            'message': f'Heads up: the next topic may be challenging. {action}.',
            'action': action,
        })

    # Concept difficulty: adjust expectations
    diff_score = difficulty.get('difficulty_score', 50)
    if diff_score >= 70:
        recommendations.append({
            'type': 'info',
            'priority': 4,
            'icon': 'trending_up',
            'message': f'This is a challenging concept (difficulty: {diff_score:.0f}/100). Many students need extra time here — that is normal.',
            'action': 'View study resources',
        })

    # Profile-based advice
    cluster = profile.get('cluster', '')
    if cluster == 'Needs Reinforcement':
        recommendations.append({
            'type': 'study_habit',
            'priority': 4,
            'icon': 'calendar_today',
            'message': 'Spaced repetition will help solidify your learning. Try reviewing this concept again tomorrow.',
            'action': 'Add to revision plan',
        })
    elif cluster == 'High Confusion':
        recommendations.append({
            'type': 'study_habit',
            'priority': 3,
            'icon': 'lightbulb',
            'message': 'Breaking down the concept into smaller pieces may help. Try the guided tutor mode.',
            'action': 'Start guided tutor',
        })
    elif cluster == 'Fast Mastery':
        recommendations.append({
            'type': 'challenge',
            'priority': 5,
            'icon': 'rocket_launch',
            'message': 'You are progressing quickly! Consider exploring advanced topics or helping peers.',
            'action': 'View advanced topics',
        })

    # Ensure at least one recommendation
    if not recommendations:
        recommendations.append({
            'type': 'encouragement',
            'priority': 5,
            'icon': 'thumb_up',
            'message': 'You are on track! Keep up the consistent effort.',
            'action': 'Continue learning',
        })

    # Sort by priority
    recommendations.sort(key=lambda r: r['priority'])

    return recommendations


def generate_educator_recommendations(class_model_outputs):
    """
    Generate recommendations for an educator based on class-wide ML insights.

    Args:
        class_model_outputs: dict with:
            - at_risk_students: list of student risk scores
            - concept_difficulties: list of concept difficulty scores
            - anomaly: anomaly detection output
            - confusion_categories: dict of category counts

    Returns:
        list of recommendation dicts
    """
    recommendations = []

    at_risk = class_model_outputs.get('at_risk_students', [])
    difficulties = class_model_outputs.get('concept_difficulties', [])
    anomaly = class_model_outputs.get('anomaly', {})
    categories = class_model_outputs.get('confusion_categories', {})

    # Critical: anomaly detected
    if anomaly.get('anomaly', False):
        recommendations.append({
            'type': 'alert',
            'priority': 1,
            'icon': 'notification_important',
            'message': anomaly.get('message', 'Unusual confusion spike detected.'),
            'action': 'View confusion data',
        })

    # At-risk students
    high_risk = [s for s in at_risk if s.get('risk_score', 0) >= 70]
    if high_risk:
        recommendations.append({
            'type': 'intervention',
            'priority': 1,
            'icon': 'person_alert',
            'message': f'{len(high_risk)} student(s) have elevated learning risk. Consider individual check-ins.',
            'action': 'View at-risk students',
        })

    # Hard concepts
    hard_concepts = [c for c in difficulties if c.get('difficulty_score', 0) >= 65]
    if hard_concepts:
        names = ', '.join([c.get('name', 'Unknown')[:20] for c in hard_concepts[:3]])
        recommendations.append({
            'type': 'curriculum',
            'priority': 2,
            'icon': 'school',
            'message': f'These topics have high difficulty: {names}. A mini-lesson may help.',
            'action': 'Generate mini-lesson',
        })

    # Dominant confusion category
    if categories:
        top_category = max(categories, key=categories.get)
        recommendations.append({
            'type': 'pedagogy',
            'priority': 3,
            'icon': 'psychology',
            'message': f'Most student confusion is {top_category.lower()}-based. Adjust teaching to address {top_category.lower()} gaps.',
            'action': 'View confusion breakdown',
        })

    if not recommendations:
        recommendations.append({
            'type': 'info',
            'priority': 5,
            'icon': 'check_circle',
            'message': 'All indicators are within normal range. Class is progressing well.',
            'action': 'View dashboard',
        })

    recommendations.sort(key=lambda r: r['priority'])
    return recommendations
