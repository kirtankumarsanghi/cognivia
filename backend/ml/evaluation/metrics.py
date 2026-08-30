"""
Evaluation Metrics — Computes classification, clustering, and regression metrics.
"""
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, silhouette_score, mean_absolute_error,
    mean_squared_error
)


def classification_metrics(y_true, y_pred, y_proba=None):
    """Compute full classification metrics."""
    metrics = {
        'accuracy': round(float(accuracy_score(y_true, y_pred)), 4),
        'precision': round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        'f1_score': round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }
    if y_proba is not None:
        try:
            metrics['roc_auc'] = round(float(roc_auc_score(y_true, y_proba)), 4)
        except ValueError:
            metrics['roc_auc'] = None
    return metrics


def clustering_metrics(X, labels):
    """Compute clustering metrics."""
    n_unique = len(set(labels))
    if n_unique < 2 or n_unique >= len(X):
        return {'silhouette_score': None, 'n_clusters': n_unique}
    return {
        'silhouette_score': round(float(silhouette_score(X, labels)), 4),
        'n_clusters': n_unique
    }


def regression_metrics(y_true, y_pred):
    """Compute regression metrics."""
    return {
        'mae': round(float(mean_absolute_error(y_true, y_pred)), 4),
        'rmse': round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 4),
    }
