import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# 1. BKT Model (Bayesian Knowledge Tracing)
# ---------------------------------------------------------
# Standard BKT parameters (simplified for demo)
# P(init) = initial probability of knowing the skill
# P(transit) = probability of learning the skill after an attempt
# P(slip) = probability of making a mistake despite knowing the skill
# P(guess) = probability of guessing correctly despite not knowing the skill
BKT_PARAMS = {
    'p_init': 0.3,
    'p_transit': 0.1,
    'p_slip': 0.1,
    'p_guess': 0.2
}

def update_bkt(prior_mastery, is_correct):
    """
    Updates the mastery probability using Bayesian Knowledge Tracing.
    """
    p_t = BKT_PARAMS['p_transit']
    p_s = BKT_PARAMS['p_slip']
    p_g = BKT_PARAMS['p_guess']
    
    # P(L_n | Obs) = (P(Obs | L_n) * P(L_n)) / P(Obs)
    if is_correct:
        # P(correct) = P(L_n) * (1 - P(slip)) + (1 - P(L_n)) * P(guess)
        p_correct = prior_mastery * (1 - p_s) + (1 - prior_mastery) * p_g
        # P(L_n | correct) = P(L_n) * (1 - P(slip)) / P(correct)
        posterior = (prior_mastery * (1 - p_s)) / p_correct
    else:
        # P(incorrect) = P(L_n) * P(slip) + (1 - P(L_n)) * (1 - P(guess))
        p_incorrect = prior_mastery * p_s + (1 - prior_mastery) * (1 - p_g)
        # P(L_n | incorrect) = P(L_n) * P(slip) / P(incorrect)
        posterior = (prior_mastery * p_s) / p_incorrect

    # Add the probability of learning (transition)
    # P(L_n+1) = P(L_n | Obs) + (1 - P(L_n | Obs)) * P(transit)
    new_mastery = posterior + (1 - posterior) * p_t
    
    return new_mastery

@app.route('/ml/mastery', methods=['POST'])
def calculate_mastery():
    data = request.json
    student_id = data.get('student_id')
    concept_id = data.get('concept_id')
    attempts = data.get('attempts', []) # List of booleans: [True, False, True...]

    if not student_id or not concept_id:
        return jsonify({"error": "student_id and concept_id are required"}), 400

    # Calculate mastery iteratively through attempts
    mastery = BKT_PARAMS['p_init']
    for is_correct in attempts:
        mastery = update_bkt(mastery, is_correct)
    
    # Scale to 0-100 for frontend display
    mastery_score = round(mastery * 100, 2)
    
    return jsonify({
        "student_id": student_id,
        "concept_id": concept_id,
        "mastery_probability": mastery,
        "mastery_score": mastery_score
    })


# ---------------------------------------------------------
# 2. Confusion Risk Prediction (Logistic Regression)
# ---------------------------------------------------------
# We will train a simple model on startup using synthetic data
print("Training Confusion Risk Model...")

# Generate synthetic training data
# Feature: avg_prerequisite_mastery (0-100)
# Label: confused_later (0 or 1)
np.random.seed(42)
num_samples = 500

# Generate random mastery scores (mostly 0-100)
X_synthetic = np.random.uniform(0, 100, num_samples)

# The lower the mastery, the higher the chance of confusion
# Let's create a probability curve
prob_confusion = 1 / (1 + np.exp((X_synthetic - 50) / 10))

# Generate labels based on probabilities
y_synthetic = np.random.binomial(1, prob_confusion)

# Reshape X for sklearn
X = X_synthetic.reshape(-1, 1)
y = y_synthetic

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
risk_model = LogisticRegression()
risk_model.fit(X_train, y_train)

# Evaluate model
y_pred = risk_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model trained! Accuracy on held-out test set: {accuracy * 100:.2f}%")


@app.route('/ml/predict-confusion', methods=['POST'])
def predict_confusion():
    data = request.json
    student_id = data.get('student_id')
    concept_id = data.get('concept_id')
    prereq_mastery = data.get('prerequisite_mastery_scores', []) # List of scores 0-100

    if not prereq_mastery:
        # If no prerequisites or unknown, return a default moderate risk
        return jsonify({"risk_probability": 0.5, "risk_percentage": 50})

    # Average prerequisite mastery
    avg_mastery = sum(prereq_mastery) / len(prereq_mastery)
    
    # Predict probability (returns [prob_class_0, prob_class_1])
    # We want prob_class_1 (probability of being confused)
    prob_confused = risk_model.predict_proba([[avg_mastery]])[0][1]
    
    return jsonify({
        "student_id": student_id,
        "concept_id": concept_id,
        "avg_prerequisite_mastery": avg_mastery,
        "risk_probability": prob_confused,
        "risk_percentage": round(prob_confused * 100)
    })

if __name__ == '__main__':
    print("Starting ML Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
