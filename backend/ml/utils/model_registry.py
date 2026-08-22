"""
Model Registry — Tracks model versions, training dates, features, and evaluation metrics.
"""
import json
import os
from datetime import datetime

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'model_registry.json')


def _load_registry():
    if os.path.exists(REGISTRY_PATH):
        with open(REGISTRY_PATH, 'r') as f:
            return json.load(f)
    return {}


def _save_registry(registry):
    os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
    with open(REGISTRY_PATH, 'w') as f:
        json.dump(registry, f, indent=2, default=str)


def register_model(model_name, version, features, metrics, dataset_type='synthetic'):
    """Register or update a model entry in the registry."""
    registry = _load_registry()
    registry[model_name] = {
        'model_name': model_name,
        'version': version,
        'training_date': datetime.utcnow().isoformat(),
        'features': features,
        'metrics': metrics,
        'dataset_type': dataset_type,
        'prediction_count': registry.get(model_name, {}).get('prediction_count', 0)
    }
    _save_registry(registry)
    return registry[model_name]


def increment_prediction_count(model_name):
    """Increment the prediction counter for a model."""
    registry = _load_registry()
    if model_name in registry:
        registry[model_name]['prediction_count'] = registry[model_name].get('prediction_count', 0) + 1
        _save_registry(registry)


def get_model_info(model_name):
    """Get info for a specific model."""
    registry = _load_registry()
    return registry.get(model_name, None)


def get_all_models():
    """Return the full model registry."""
    return _load_registry()
