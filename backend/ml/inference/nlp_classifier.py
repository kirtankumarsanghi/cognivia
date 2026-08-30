"""
NLP Confusion Classifier — Model 7

Analyzes student confusion notes using TF-IDF and text classification.

Extracts: sentiment, topic, keywords, confusion category.

Categories:
  - Conceptual: "I don't understand what X means"
  - Procedural: "I don't know the steps to do X"
  - Prerequisite: "I need to understand Y first"
  - Application: "I understand the theory but not when to use it"
  - Terminology: "The technical terms are confusing"
  - Calculation: "I keep getting the math wrong"

Honestly labeled as TF-IDF-based classification — not claimed as
advanced semantic understanding.
"""
import os
import re
import numpy as np
import joblib
from collections import Counter

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'confusion_classifier_model.joblib')

_model = None
_vectorizer = None

# Keyword patterns for rule-based classification
CATEGORY_KEYWORDS = {
    'Conceptual': [
        'understand', 'meaning', 'concept', 'idea', 'theory', 'definition',
        'what is', 'what does', 'why does', 'how does', 'purpose',
        'difference between', 'relationship', 'abstract',
    ],
    'Procedural': [
        'steps', 'how to', 'procedure', 'process', 'method', 'algorithm',
        'implement', 'code', 'write', 'solve', 'approach', 'technique',
        'instruction', 'follow', 'sequence',
    ],
    'Prerequisite': [
        'prerequisite', 'before', 'need to know', 'background',
        'foundation', 'basic', 'previous', 'prior', 'first need',
        'don\'t remember', 'forgot',
    ],
    'Application': [
        'when to use', 'apply', 'application', 'real world', 'example',
        'practice', 'use case', 'scenario', 'situation', 'context',
        'practical', 'where to use',
    ],
    'Terminology': [
        'term', 'terminology', 'jargon', 'vocabulary', 'word',
        'name', 'notation', 'symbol', 'abbreviation', 'acronym',
    ],
    'Calculation': [
        'calculate', 'computation', 'math', 'formula', 'equation',
        'number', 'result', 'answer', 'arithmetic', 'derive',
        'wrong answer', 'incorrect result',
    ],
}

# Sentiment keywords
NEGATIVE_WORDS = [
    'confused', 'lost', 'stuck', 'frustrated', 'hard', 'difficult',
    'impossible', 'overwhelming', 'complicated', 'unclear', 'wrong',
    'error', 'mistake', 'fail', 'don\'t understand', 'no idea',
]

POSITIVE_WORDS = [
    'understand', 'clear', 'got it', 'makes sense', 'easy',
    'simple', 'straightforward', 'helpful', 'good', 'better',
]


def load_model():
    global _model, _vectorizer
    if os.path.exists(MODEL_PATH):
        saved = joblib.load(MODEL_PATH)
        _model = saved['model']
        _vectorizer = saved['vectorizer']
        return True
    return False


def classify(text, concept_name=None):
    """
    Classify a student's confusion note.

    Args:
        text: The student's confusion note text
        concept_name: Optional concept name for context

    Returns:
        dict with category, probability, sentiment, topic, keywords,
        issue_type, and common_phrases
    """
    if not text or not text.strip():
        return {
            'category': 'Conceptual',
            'probability': 0.5,
            'sentiment': 'neutral',
            'topic': concept_name or 'Unknown',
            'keywords': [],
            'issue_type': 'General confusion',
            'model': 'default',
        }

    text_lower = text.lower().strip()

    # Try ML model first
    if _model is None:
        load_model()

    if _model is not None and _vectorizer is not None:
        X = _vectorizer.transform([text_lower])
        predicted_category = _model.predict(X)[0]
        probabilities = _model.predict_proba(X)[0]
        max_prob = float(max(probabilities))
    else:
        # Rule-based classification
        predicted_category, max_prob = _rule_based_classify(text_lower)

    # Extract additional NLP features
    sentiment = _analyze_sentiment(text_lower)
    keywords = _extract_keywords(text_lower)
    topic = _extract_topic(text_lower, concept_name)
    issue_type = _determine_issue_type(predicted_category)

    return {
        'category': predicted_category,
        'probability': round(max_prob, 4),
        'sentiment': sentiment,
        'topic': topic,
        'keywords': keywords,
        'issue_type': issue_type,
        'model': 'tfidf_classifier' if _model is not None else 'keyword_classifier',
    }


def _rule_based_classify(text):
    """Classify using keyword matching."""
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[category] = score

    if max(scores.values()) == 0:
        return 'Conceptual', 0.5

    best_category = max(scores, key=scores.get)
    total = sum(scores.values())
    probability = scores[best_category] / total if total > 0 else 0.5

    return best_category, min(probability, 0.95)


def _analyze_sentiment(text):
    """Simple keyword-based sentiment analysis."""
    neg_count = sum(1 for w in NEGATIVE_WORDS if w in text)
    pos_count = sum(1 for w in POSITIVE_WORDS if w in text)

    if neg_count > pos_count:
        return 'negative'
    elif pos_count > neg_count:
        return 'positive'
    return 'neutral'


def _extract_keywords(text, max_keywords=5):
    """Extract key terms from the text."""
    # Remove common stop words
    stop_words = {
        'i', 'me', 'my', 'the', 'a', 'an', 'is', 'am', 'are', 'was',
        'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
        'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
        'can', 'could', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
        'from', 'it', 'its', 'this', 'that', 'these', 'those', 'and', 'or',
        'but', 'not', 'no', 'so', 'if', 'then', 'than', 'too', 'very',
        'just', 'about', 'also', 'what', 'when', 'where', 'how', 'why',
        'don\'t', 'know', 'really', 'think', 'get',
    }

    words = re.findall(r'\b[a-z]{3,}\b', text)
    filtered = [w for w in words if w not in stop_words]

    # Count and return top keywords
    counter = Counter(filtered)
    return [word for word, _ in counter.most_common(max_keywords)]


def _extract_topic(text, concept_name=None):
    """Extract the main topic from the text."""
    if concept_name:
        return concept_name

    # Look for common CS/learning topics
    topics = [
        'big-o', 'binary search', 'sorting', 'recursion', 'algorithm',
        'data structure', 'array', 'linked list', 'tree', 'graph',
        'hash', 'stack', 'queue', 'dynamic programming', 'normalization',
        'sql', 'database', 'pointer', 'memory', 'complexity',
        'logarithm', 'function', 'variable', 'loop', 'condition',
    ]
    for topic in topics:
        if topic in text:
            return topic.title()

    return 'General'


def _determine_issue_type(category):
    """Map category to a human-readable issue type."""
    issue_types = {
        'Conceptual': 'Conceptual understanding',
        'Procedural': 'Procedural / step-by-step confusion',
        'Prerequisite': 'Missing prerequisite knowledge',
        'Application': 'Application / when-to-use confusion',
        'Terminology': 'Terminology / notation confusion',
        'Calculation': 'Calculation / computation error',
    }
    return issue_types.get(category, 'General confusion')
