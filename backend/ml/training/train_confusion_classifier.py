"""
Train NLP Confusion Classifier

Trains a TF-IDF text classification model on synthetic confusion notes.
"""
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

from ml.utils.model_registry import register_model
from ml.data.generate_demo_dataset import generate_confusion_text_dataset

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic')
DATA_PATH = os.path.join(DATA_DIR, 'confusion_texts.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'confusion_classifier_model.joblib')

def train():
    print("[TRAIN] Starting NLP Confusion Classifier training...")

    if not os.path.exists(DATA_PATH):
        print("Dataset not found. Generating synthetic data...")
        df = generate_confusion_text_dataset()
    else:
        df = pd.read_csv(DATA_PATH)

    texts = df['text'].values
    labels = df['category'].values

    print("  Vectorizing text (TF-IDF)...")
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X = vectorizer.fit_transform(texts)

    X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.2, random_state=46)

    print("  Training RandomForest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=46)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"  Evaluation - Accuracy: {accuracy:.4f}")

    metrics = {
        'accuracy': round(accuracy, 4),
        'vocab_size': len(vectorizer.vocabulary_)
    }

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({
        'model': model,
        'vectorizer': vectorizer,
        'classes': list(model.classes_)
    }, MODEL_PATH)

    dataset_type = df['dataset_type'].iloc[0] if 'dataset_type' in df.columns else 'synthetic'
    register_model('confusion_classifier', 'v1.0', ['text_tfidf'], metrics, dataset_type)
    
    print(f"[TRAIN] Model saved to {MODEL_PATH}")
    return metrics

if __name__ == '__main__':
    train()
