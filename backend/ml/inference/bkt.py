"""
Bayesian Knowledge Tracing (BKT) — Model 1

Standard BKT implementation using the four canonical parameters:
  P(L0) — initial mastery probability
  P(T)  — probability of transitioning from unlearned to learned
  P(S)  — probability of slipping (incorrect despite knowing)
  P(G)  — probability of guessing (correct despite not knowing)

Each observation (correct/incorrect attempt) updates the posterior mastery
probability using Bayes' rule, then applies the learning transition.
"""


# Default BKT parameters (can be overridden per concept)
DEFAULT_PARAMS = {
    'p_init': 0.3,    # P(L0): Initial mastery probability
    'p_transit': 0.1, # P(T): Learning rate per opportunity
    'p_slip': 0.1,    # P(S): Slip probability
    'p_guess': 0.2,   # P(G): Guess probability
}


def update_mastery(prior, is_correct, params=None):
    """
    Single BKT update step.

    Given a prior mastery probability and an observation (correct/incorrect),
    compute the posterior mastery using Bayes' rule, then apply the
    learning transition.

    Args:
        prior: Current mastery probability P(L_n) in [0, 1]
        is_correct: Boolean — was the attempt correct?
        params: Optional dict of BKT parameters

    Returns:
        Updated mastery probability P(L_{n+1}) in [0, 1]
    """
    if params is None:
        params = DEFAULT_PARAMS

    p_t = params['p_transit']
    p_s = params['p_slip']
    p_g = params['p_guess']

    if is_correct:
        # P(correct) = P(L) * (1-P(S)) + (1-P(L)) * P(G)
        p_obs = prior * (1.0 - p_s) + (1.0 - prior) * p_g
        # P(L | correct) = P(L) * (1-P(S)) / P(correct)
        posterior = (prior * (1.0 - p_s)) / p_obs if p_obs > 0 else prior
    else:
        # P(incorrect) = P(L) * P(S) + (1-P(L)) * (1-P(G))
        p_obs = prior * p_s + (1.0 - prior) * (1.0 - p_g)
        # P(L | incorrect) = P(L) * P(S) / P(incorrect)
        posterior = (prior * p_s) / p_obs if p_obs > 0 else prior

    # Apply learning transition: P(L_{n+1}) = P(L_n|obs) + (1 - P(L_n|obs)) * P(T)
    new_mastery = posterior + (1.0 - posterior) * p_t

    # Clamp to valid probability range
    return max(0.0, min(1.0, new_mastery))


def calculate_mastery(attempts, params=None):
    """
    Calculate mastery from a full sequence of attempts.

    Args:
        attempts: List of dicts with 'correct' key, or list of booleans
        params: Optional BKT parameters

    Returns:
        dict with mastery_probability, mastery_score (0-100), status, trace
    """
    if params is None:
        params = DEFAULT_PARAMS

    mastery = params['p_init']
    trace = [mastery]  # Track mastery evolution

    for attempt in attempts:
        if isinstance(attempt, dict):
            is_correct = bool(attempt.get('correct', False))
        else:
            is_correct = bool(attempt)
        mastery = update_mastery(mastery, is_correct, params)
        trace.append(mastery)

    # Determine status label
    if mastery >= 0.85:
        status = 'mastered'
    elif mastery >= 0.65:
        status = 'proficient'
    elif mastery >= 0.45:
        status = 'developing'
    elif mastery >= 0.25:
        status = 'emerging'
    else:
        status = 'novice'

    return {
        'mastery_probability': round(mastery, 4),
        'mastery_score': round(mastery * 100, 2),
        'status': status,
        'model': 'BKT',
        'parameters': params,
        'trace': [round(t, 4) for t in trace],
        'total_attempts': len(attempts),
    }


def evaluate_bkt(test_sequences, params=None):
    """
    Evaluate BKT predictive accuracy on held-out sequences.

    Each sequence is a list of (is_correct) booleans. We predict each next
    observation based on current mastery and compare to actual.

    Returns accuracy metric.
    """
    if params is None:
        params = DEFAULT_PARAMS

    correct_predictions = 0
    total_predictions = 0

    for sequence in test_sequences:
        mastery = params['p_init']
        for i, is_correct in enumerate(sequence):
            if i > 0:  # Skip first — no prediction possible
                # Predict: if mastery > 0.5, predict correct
                predicted_correct = mastery > 0.5
                if predicted_correct == is_correct:
                    correct_predictions += 1
                total_predictions += 1
            mastery = update_mastery(mastery, is_correct, params)

    accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0.0
    return {
        'predictive_accuracy': round(accuracy, 4),
        'total_predictions': total_predictions,
        'correct_predictions': correct_predictions,
    }
