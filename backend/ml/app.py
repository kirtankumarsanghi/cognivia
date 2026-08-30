from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add parent directory to path so absolute imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.inference.bkt import calculate_mastery
from ml.inference.confusion_risk import predict as predict_confusion
from ml.inference.early_warning import predict as predict_warning
from ml.inference.concept_difficulty import calculate_difficulty
from ml.inference.student_profile import predict as predict_profile
from ml.inference.anomaly_detection import detect_anomaly
from ml.inference.nlp_classifier import classify as classify_confusion
from ml.inference.learning_risk import calculate_learning_risk
from ml.utils.model_registry import get_all_models, increment_prediction_count

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Service health and model status check."""
    return jsonify({
        'status': 'healthy',
        'service': 'cogniva-ml-engine',
        'version': '1.0'
    })

@app.route('/ml/metrics', methods=['GET'])
def metrics():
    """Return metrics for all registered models."""
    return jsonify({
        'success': True,
        'models': get_all_models()
    })

@app.route('/ml/mastery', methods=['POST'])
def bkt_mastery():
    data = request.json
    attempts = data.get('attempts', [])
    params = data.get('params', None)
    
    result = calculate_mastery(attempts, params)
    increment_prediction_count('bkt')
    return jsonify({'success': True, **result})

@app.route('/ml/predict-confusion', methods=['POST'])
def confusion_risk():
    data = request.json
    features = data.get('features', {})
    
    result = predict_confusion(features)
    increment_prediction_count('confusion_risk')
    return jsonify({'success': True, **result})

@app.route('/ml/early-warning', methods=['POST'])
def early_warning():
    data = request.json
    features = data.get('features', {})
    
    result = predict_warning(features)
    increment_prediction_count('early_warning')
    return jsonify({'success': True, **result})

@app.route('/ml/concept-difficulty', methods=['POST'])
def concept_difficulty():
    data = request.json
    stats = data.get('concept_stats', {})
    
    result = calculate_difficulty(stats)
    increment_prediction_count('concept_difficulty')
    return jsonify({'success': True, **result})

@app.route('/ml/student-profile', methods=['POST'])
def student_profile():
    data = request.json
    features = data.get('features', {})
    
    result = predict_profile(features)
    increment_prediction_count('student_clusters')
    return jsonify({'success': True, **result})

@app.route('/ml/detect-anomaly', methods=['POST'])
def check_anomaly():
    data = request.json
    counts = data.get('signal_counts', [])
    current = data.get('current_count', None)
    
    result = detect_anomaly(counts, current)
    increment_prediction_count('anomaly_detector')
    return jsonify({'success': True, **result})

@app.route('/ml/classify-confusion', methods=['POST'])
def nlp_classifier():
    data = request.json
    text = data.get('text', '')
    concept = data.get('concept_name', None)
    
    result = classify_confusion(text, concept)
    increment_prediction_count('confusion_classifier')
    return jsonify({'success': True, **result})

@app.route('/ml/learning-risk', methods=['POST'])
def learning_risk():
    data = request.json
    outputs = data.get('model_outputs', {})
    
    result = calculate_learning_risk(outputs)
    increment_prediction_count('learning_risk')
    return jsonify({'success': True, **result})

if __name__ == '__main__':
    # Default port 5001 so it doesn't conflict with Express on 5000
    app.run(host='0.0.0.0', port=5001, debug=True)
