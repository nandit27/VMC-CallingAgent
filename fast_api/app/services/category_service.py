import joblib
import numpy as np
import os

MODEL_PATH = "data/models/complaint_category_model.joblib"

# Lazy load model - only load if file exists
_model = None

def _get_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
    return _model

def classify_category(text: str) -> dict:
    """
    Classify complaint category using ML model.
    
    TODO: Train and save model to data/models/complaint_category_model.joblib
    Currently returns placeholder data.
    """
    model = _get_model()
    
    # If model doesn't exist, return placeholder
    if model is None:
        # Placeholder implementation - replace with actual model
        return {
            "category_id": 1,  # Default to first category
            "confidence": 0.5
        }
    
    probs = model.predict_proba([text])[0]
    idx = probs.argmax()

    return {
        "category_id": int(model.classes_[idx]),
        "confidence": float(probs[idx])
    }
