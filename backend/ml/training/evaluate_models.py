"""
Evaluate All Models

Runs all training scripts and compiles a summary report.
"""
from ml.data.generate_demo_dataset import generate_all
from ml.training.train_confusion_model import train as train_confusion
from ml.training.train_early_warning_model import train as train_early_warning
from ml.training.train_student_clusters import train as train_clusters
from ml.training.train_anomaly_detector import train as train_anomaly
from ml.training.train_confusion_classifier import train as train_nlp

def evaluate_all():
    print("="*50)
    print("COGNIVA ML - FULL EVALUATION PIPELINE")
    print("="*50)
    
    print("\n1. Generating complete synthetic dataset...")
    generate_all()
    
    print("\n2. Training models...")
    confusion_metrics = train_confusion()
    warning_metrics = train_early_warning()
    cluster_metrics = train_clusters()
    anomaly_metrics = train_anomaly()
    nlp_metrics = train_nlp()
    
    print("\n" + "="*50)
    print("EVALUATION SUMMARY")
    print("="*50)
    print(f"Confusion Risk Model (ROC-AUC):  {confusion_metrics.get('roc_auc', 0):.4f}")
    print(f"Early Warning Model  (ROC-AUC):  {warning_metrics.get('roc_auc', 0):.4f}")
    print(f"Student Clusters     (Silhouette): {cluster_metrics.get('silhouette_score', 0):.4f}")
    print(f"Anomaly Detector     (Contam.):  {anomaly_metrics.get('detected_anomaly_rate', 0):.4f}")
    print(f"NLP Classifier       (Accuracy): {nlp_metrics.get('accuracy', 0):.4f}")
    print("="*50)
    print("All models successfully trained and registered.")

if __name__ == '__main__':
    evaluate_all()
