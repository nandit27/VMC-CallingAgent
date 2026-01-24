import os
import logging

logger = logging.getLogger(__name__)

# Optional imports for ML
try:
    import joblib
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    logger.warning("ML libraries (joblib, numpy) not found. Category classification will use placeholders.")
    ML_AVAILABLE = False
    joblib = None
    np = None

MODEL_PATH = "data/models/complaint_category_model.joblib"

# Lazy load model - only load if file exists
_model = None

def _get_model():
    global _model
    if not ML_AVAILABLE:
        return None
        
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            _model = None
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
