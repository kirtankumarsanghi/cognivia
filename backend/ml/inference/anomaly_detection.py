"""
Confusion Signal Anomaly Detection — Model 6

Detects sudden abnormal increases in confusion signals.
Uses Isolation Forest and a rolling statistical baseline.

Example: Normal = 20-30 signals → Sudden spike = 83 signals → ANOMALY
"""
import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'anomaly_detector_model.joblib')

_model = None


def load_model():
    global _model
    if os.path.exists(MODEL_PATH):
        saved = joblib.load(MODEL_PATH)
        _model = saved['model']
        return True
    return False


def detect_anomaly(signal_counts, current_count=None):
    """
    Detect anomalous confusion signal spikes.

    Args:
        signal_counts: list of recent signal counts (e.g., hourly or per-session)
        current_count: the latest count to evaluate (if None, uses last in list)

    Returns:
        dict with anomaly (bool), severity, message, statistics
    """
    global _model

    if not signal_counts or len(signal_counts) < 3:
        return {
            'anomaly': False,
            'severity': 'none',
            'message': 'Insufficient data for anomaly detection',
            'model': 'insufficient_data',
        }

    if current_count is None:
        current_count = signal_counts[-1]

    counts = np.array(signal_counts, dtype=float)

    # Statistical baseline
    mean_count = float(np.mean(counts))
    std_count = float(np.std(counts))
    baseline = mean_count + 2.0 * std_count if std_count > 0 else mean_count * 1.5

    # Z-score of current count
    z_score = (current_count - mean_count) / std_count if std_count > 0 else 0.0

    # Ratio: how many times above the mean
    ratio = current_count / mean_count if mean_count > 0 else 1.0

    # Try Isolation Forest if model is available
    if _model is None:
        load_model()

    is_anomaly_ml = False
    if _model is not None:
        X = np.array([[current_count]])
        prediction = _model.predict(X)[0]
        is_anomaly_ml = (prediction == -1)

    # Statistical anomaly: z-score > 2.5 or ratio > 2.0
    is_anomaly_stat = z_score > 2.5 or ratio > 2.0

    is_anomaly = is_anomaly_ml or is_anomaly_stat

    # Determine severity
    if is_anomaly:
        if z_score > 4.0 or ratio > 3.0:
            severity = 'critical'
        elif z_score > 3.0 or ratio > 2.5:
            severity = 'high'
        else:
            severity = 'moderate'
    else:
        severity = 'none'

    # Generate message
    if is_anomaly:
        message = f'Unusual confusion spike detected: {ratio:.1f}× above normal ({current_count} vs avg {mean_count:.0f})'
    else:
        message = 'Confusion levels within normal range'

    return {
        'anomaly': is_anomaly,
        'severity': severity,
        'message': message,
        'model': 'isolation_forest' if is_anomaly_ml else 'statistical_baseline',
        'statistics': {
            'current_count': int(current_count),
            'mean': round(mean_count, 2),
            'std': round(std_count, 2),
            'z_score': round(z_score, 2),
            'ratio': round(ratio, 2),
            'baseline_threshold': round(baseline, 2),
        }
    }
