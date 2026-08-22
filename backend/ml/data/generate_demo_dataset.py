"""
Synthetic Data Generator — Creates realistic training data for all ML models.

All synthetic data is clearly labeled as DEMO/SYNTHETIC.
Data distributions are modeled after realistic educational patterns.
"""
import os
import numpy as np
import pandas as pd

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'synthetic')


def generate_all():
    """Generate all synthetic datasets."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    confusion_df = generate_confusion_dataset(n_samples=2000)
    early_warning_df = generate_early_warning_dataset(n_samples=2000)
    student_profile_df = generate_student_profile_dataset(n_students=500)
    anomaly_df = generate_anomaly_dataset(n_samples=1000)
    nlp_df = generate_confusion_text_dataset(n_samples=800)
    bkt_df = generate_bkt_sequences(n_students=200, n_concepts=10)

    print(f"[SYNTHETIC DATA] Generated:")
    print(f"  confusion_risk.csv     — {len(confusion_df)} samples")
    print(f"  early_warning.csv      — {len(early_warning_df)} samples")
    print(f"  student_profiles.csv   — {len(student_profile_df)} samples")
    print(f"  anomaly_signals.csv    — {len(anomaly_df)} samples")
    print(f"  confusion_texts.csv    — {len(nlp_df)} samples")
    print(f"  bkt_sequences.csv      — {len(bkt_df)} samples")

    return {
        'confusion_risk': confusion_df,
        'early_warning': early_warning_df,
        'student_profiles': student_profile_df,
        'anomaly_signals': anomaly_df,
        'confusion_texts': nlp_df,
        'bkt_sequences': bkt_df,
    }


def generate_confusion_dataset(n_samples=2000):
    """Generate labeled confusion risk dataset."""
    np.random.seed(42)
    data = []

    for _ in range(n_samples):
        # Student profile (determines confusion probability)
        skill_level = np.random.choice(['low', 'medium', 'high'], p=[0.3, 0.4, 0.3])

        if skill_level == 'low':
            current_mastery = np.random.beta(2, 5)
            prereq_avg = np.random.beta(2, 4)
            accuracy = np.random.beta(2, 5)
            confusion_freq = np.random.beta(4, 2)
        elif skill_level == 'medium':
            current_mastery = np.random.beta(4, 3)
            prereq_avg = np.random.beta(4, 3)
            accuracy = np.random.beta(4, 3)
            confusion_freq = np.random.beta(3, 4)
        else:
            current_mastery = np.random.beta(6, 2)
            prereq_avg = np.random.beta(5, 2)
            accuracy = np.random.beta(6, 2)
            confusion_freq = np.random.beta(2, 6)

        prereq_min = max(0, prereq_avg - np.random.uniform(0, 0.2))
        incorrect_attempts = int(np.random.poisson(max(0, (1 - accuracy) * 8)))
        recent_accuracy = np.clip(accuracy + np.random.normal(0, 0.1), 0, 1)
        recent_confusion = int(np.random.poisson(confusion_freq * 3))
        time_since_practice = np.random.exponential(24)  # hours
        total_attempts = int(np.random.poisson(10) + 3)
        streak = max(0, int(np.random.poisson(accuracy * 3)))
        revision_completion = np.random.beta(3, 2) if skill_level != 'low' else np.random.beta(2, 4)
        prev_concept_acc = np.clip(accuracy + np.random.normal(0, 0.15), 0, 1)

        # Generate label: risk of confusion (binary)
        risk_score = (
            (1 - current_mastery) * 0.25
            + (1 - prereq_avg) * 0.2
            + confusion_freq * 0.2
            + (1 - recent_accuracy) * 0.2
            + min(time_since_practice / 72, 1.0) * 0.15
        )
        is_confused = int(np.random.binomial(1, np.clip(risk_score, 0.05, 0.95)))

        data.append({
            'current_mastery': round(current_mastery, 4),
            'prerequisite_avg': round(prereq_avg, 4),
            'prerequisite_min': round(prereq_min, 4),
            'incorrect_attempts': incorrect_attempts,
            'recent_accuracy': round(recent_accuracy, 4),
            'confusion_frequency': round(confusion_freq, 4),
            'recent_confusion_count': recent_confusion,
            'time_since_last_practice': round(time_since_practice, 2),
            'total_attempts': total_attempts,
            'streak': streak,
            'revision_completion_rate': round(revision_completion, 4),
            'previous_concept_accuracy': round(prev_concept_acc, 4),
            'is_confused': is_confused,
            'dataset_type': 'SYNTHETIC',
        })

    df = pd.DataFrame(data)
    df.to_csv(os.path.join(OUTPUT_DIR, 'confusion_risk.csv'), index=False)
    return df


def generate_early_warning_dataset(n_samples=2000):
    """Generate labeled early warning dataset."""
    np.random.seed(43)
    data = []

    for _ in range(n_samples):
        prereq_avg = np.random.beta(4, 3)
        prereq_min = max(0, prereq_avg - np.random.uniform(0, 0.25))
        prev_accuracy = np.random.beta(4, 3)
        recent_incorrect = int(np.random.poisson(max(0, (1 - prev_accuracy) * 5)))
        learning_velocity = np.random.normal(0.05, 0.15)
        recent_confusion = int(np.random.poisson(1.5))
        time_gap = np.random.exponential(12)
        revision_completion = np.random.beta(3, 2)
        concept_difficulty = np.random.beta(3, 3) * 100

        # Label: will they struggle?
        struggle_prob = (
            (1 - prereq_avg) * 0.25
            + (1 - prev_accuracy) * 0.25
            + max(0, -learning_velocity) * 2.0 * 0.15
            + (concept_difficulty / 100) * 0.15
            + min(recent_confusion / 4.0, 1.0) * 0.10
            + (1 - revision_completion) * 0.10
        )
        will_struggle = int(np.random.binomial(1, np.clip(struggle_prob, 0.05, 0.95)))

        data.append({
            'prerequisite_avg': round(prereq_avg, 4),
            'prerequisite_min': round(prereq_min, 4),
            'previous_accuracy': round(prev_accuracy, 4),
            'recent_incorrect': recent_incorrect,
            'learning_velocity': round(learning_velocity, 4),
            'recent_confusion_count': recent_confusion,
            'time_gap_hours': round(time_gap, 2),
            'revision_completion': round(revision_completion, 4),
            'concept_difficulty': round(concept_difficulty, 2),
            'will_struggle': will_struggle,
            'dataset_type': 'SYNTHETIC',
        })

    df = pd.DataFrame(data)
    df.to_csv(os.path.join(OUTPUT_DIR, 'early_warning.csv'), index=False)
    return df


def generate_student_profile_dataset(n_students=500):
    """Generate student profile dataset for clustering."""
    np.random.seed(44)
    data = []

    archetypes = [
        # Fast Mastery
        {'accuracy': (0.8, 0.1), 'confusion': (0.1, 0.05), 'sessions': (5, 1.5),
         'revision': (0.9, 0.08), 'tutor': (0.2, 0.1), 'progression': (0.8, 0.1), 'attempts': (15, 5)},
        # Steady Learner
        {'accuracy': (0.65, 0.1), 'confusion': (0.2, 0.08), 'sessions': (4, 1.2),
         'revision': (0.7, 0.12), 'tutor': (0.4, 0.15), 'progression': (0.6, 0.1), 'attempts': (20, 7)},
        # Needs Reinforcement
        {'accuracy': (0.45, 0.12), 'confusion': (0.35, 0.1), 'sessions': (3, 1.5),
         'revision': (0.4, 0.15), 'tutor': (0.6, 0.15), 'progression': (0.3, 0.12), 'attempts': (25, 8)},
        # High Confusion
        {'accuracy': (0.3, 0.1), 'confusion': (0.55, 0.12), 'sessions': (2.5, 1.2),
         'revision': (0.3, 0.12), 'tutor': (0.7, 0.15), 'progression': (0.2, 0.1), 'attempts': (12, 6)},
        # Inconsistent
        {'accuracy': (0.5, 0.2), 'confusion': (0.3, 0.15), 'sessions': (3.5, 2.0),
         'revision': (0.5, 0.2), 'tutor': (0.3, 0.2), 'progression': (0.4, 0.2), 'attempts': (18, 10)},
    ]

    students_per_type = n_students // len(archetypes)

    for archetype in archetypes:
        for _ in range(students_per_type):
            data.append({
                'avg_practice_accuracy': round(np.clip(np.random.normal(*archetype['accuracy']), 0, 1), 4),
                'avg_confusion_frequency': round(np.clip(np.random.normal(*archetype['confusion']), 0, 1), 4),
                'session_frequency': round(max(0.5, np.random.normal(*archetype['sessions'])), 2),
                'revision_completion': round(np.clip(np.random.normal(*archetype['revision']), 0, 1), 4),
                'tutor_usage': round(np.clip(np.random.normal(*archetype['tutor']), 0, 1), 4),
                'avg_mastery_progression': round(np.clip(np.random.normal(*archetype['progression']), 0, 1), 4),
                'total_practice_attempts': max(1, int(np.random.normal(*archetype['attempts']))),
                'dataset_type': 'SYNTHETIC',
            })

    df = pd.DataFrame(data)
    df.to_csv(os.path.join(OUTPUT_DIR, 'student_profiles.csv'), index=False)
    return df


def generate_anomaly_dataset(n_samples=1000):
    """Generate confusion signal count data with anomalies."""
    np.random.seed(45)
    data = []

    for _ in range(n_samples):
        # Normal baseline for a concept: 10-40 signals per hour
        baseline = np.random.uniform(10, 40)
        counts = []

        for hour in range(24):
            if np.random.random() < 0.05:
                # 5% chance of anomaly
                count = baseline * np.random.uniform(2.5, 5.0)
                is_anomaly = 1
            else:
                count = max(0, np.random.normal(baseline, baseline * 0.25))
                is_anomaly = 0

            counts.append({
                'concept_baseline': round(baseline, 2),
                'signal_count': round(count, 0),
                'hour': hour,
                'is_anomaly': is_anomaly,
                'dataset_type': 'SYNTHETIC',
            })
        data.extend(counts)

    df = pd.DataFrame(data)
    df.to_csv(os.path.join(OUTPUT_DIR, 'anomaly_signals.csv'), index=False)
    return df


def generate_confusion_text_dataset(n_samples=800):
    """Generate labeled confusion text samples for NLP classification."""
    np.random.seed(46)

    templates = {
        'Conceptual': [
            "I don't understand what {topic} means",
            "What is the purpose of {topic}?",
            "I'm confused about the concept of {topic}",
            "Can someone explain {topic} differently?",
            "What's the difference between {topic} and {related}?",
            "I don't get why {topic} works that way",
            "The theory behind {topic} makes no sense to me",
            "I understand the steps but not why {topic} is important",
        ],
        'Procedural': [
            "I don't know how to implement {topic}",
            "What are the steps for {topic}?",
            "I'm stuck on the algorithm for {topic}",
            "How do I write the code for {topic}?",
            "I can't figure out the process for {topic}",
            "What method should I use for {topic}?",
            "I know what {topic} is but can't do it",
            "The procedure for {topic} is confusing",
        ],
        'Prerequisite': [
            "I think I need to learn {related} before {topic}",
            "I forgot the basics needed for {topic}",
            "I don't have the background for {topic}",
            "I need a refresher on {related} to understand {topic}",
            "My foundation in {related} is too weak for {topic}",
            "I never learned {related} properly",
        ],
        'Application': [
            "When should I use {topic} vs {related}?",
            "I understand {topic} but don't know when to apply it",
            "Give me a real-world example of {topic}",
            "How is {topic} used in practice?",
            "I can solve textbook problems but not real {topic} problems",
            "When would I actually need {topic}?",
        ],
        'Terminology': [
            "What does the term {topic} mean?",
            "The notation for {topic} is confusing",
            "Too much jargon in the {topic} section",
            "I keep mixing up the terminology for {topic}",
            "What's the symbol for {topic}?",
            "The abbreviations in {topic} are confusing",
        ],
        'Calculation': [
            "I keep getting the wrong answer for {topic} calculations",
            "My math for {topic} doesn't match the expected result",
            "I can't derive the formula for {topic}",
            "The computation for {topic} is confusing",
            "I make errors when calculating {topic}",
            "How do I compute {topic} step by step?",
        ],
    }

    topics = [
        'Big O Notation', 'Binary Search', 'Recursion', 'Dynamic Programming',
        'Hash Tables', 'Linked Lists', 'Binary Trees', 'Graph Traversal',
        'Sorting Algorithms', 'Normalization', 'SQL Joins', 'Pointer Arithmetic',
        'Stack Operations', 'Queue Implementation', 'Heap Sort',
    ]
    related_topics = [
        'Arrays', 'Functions', 'Variables', 'Loops', 'Conditions',
        'Basic Math', 'Logic Gates', 'Set Theory', 'Probability',
    ]

    data = []
    for _ in range(n_samples):
        category = np.random.choice(list(templates.keys()))
        template = np.random.choice(templates[category])
        topic = np.random.choice(topics)
        related = np.random.choice(related_topics)
        text = template.format(topic=topic, related=related)

        # Add some noise
        if np.random.random() < 0.2:
            noise_words = ['also', 'really', 'kind of', 'sort of', 'basically']
            text = text + ' ' + np.random.choice(noise_words)

        data.append({
            'text': text,
            'category': category,
            'concept': topic,
            'dataset_type': 'SYNTHETIC',
        })

    df = pd.DataFrame(data)
    df.to_csv(os.path.join(OUTPUT_DIR, 'confusion_texts.csv'), index=False)
    return df


def generate_bkt_sequences(n_students=200, n_concepts=10):
    """Generate BKT practice sequences."""
    np.random.seed(47)
    data = []

    for student in range(n_students):
        for concept in range(n_concepts):
            # Simulate a learning curve
            true_mastery = np.random.beta(2, 5)  # Start low
            n_attempts = np.random.randint(5, 25)

            for attempt in range(n_attempts):
                # Probability of correct increases with practice
                true_mastery = min(0.95, true_mastery + np.random.uniform(0, 0.08))
                p_correct = true_mastery * 0.9 + 0.1  # slip/guess noise
                is_correct = int(np.random.random() < p_correct)

                data.append({
                    'student_id': f'student_{student}',
                    'concept_id': f'concept_{concept}',
                    'attempt_number': attempt + 1,
                    'is_correct': is_correct,
                    'true_mastery': round(true_mastery, 4),
                    'dataset_type': 'SYNTHETIC',
                })

    df = pd.DataFrame(data)
    df.to_csv(os.path.join(OUTPUT_DIR, 'bkt_sequences.csv'), index=False)
    return df


if __name__ == '__main__':
    generate_all()
