import joblib
import numpy as np

MODEL_PATH = "data/models/complaint_category_model.joblib"

model = joblib.load(MODEL_PATH)

def classify_category(text: str) -> dict:
    probs = model.predict_proba([text])[0]
    idx = probs.argmax()

    return {
        "category_id": int(model.classes_[idx]),
        "confidence": float(probs[idx])
    }
