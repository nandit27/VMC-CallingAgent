from app.semantic.segmentor import segment_semantically
from app.semantic.postprocess import build_complaints_from_spans
from app.services.category_service import classify_category
from app.services.location_service import resolve_location_from_text


def analyze_complaint(raw_text: str):
    spans = segment_semantically(raw_text)
    print(spans)

    complaints = build_complaints_from_spans(spans)

    results = []

    for idx, c in enumerate(complaints, start=1):
        category = classify_category(c["complaint_text"])

        location_result = (
            resolve_location_from_text(c["location_text"])
            if c["location_text"]
            else {
                "location": None,
                "confidence": 0.0,
                "resolution_status": "ASK",
                "action": "ASK_LOCATION",
            }
        )

        results.append(
            {
                "complaint_index": idx,
                "complaint_text": c["complaint_text"],
                "category": category,
                "location": location_result.get("location"),
                "location_confidence": location_result.get("confidence"),
                "location_status": location_result.get("resolution_status"),
                "action": location_result.get("action"),
            }
        )

    return {
        "total_complaints_detected": len(results),
        "complaints": results,
    }

print(analyze_complaint("bus not stopping near khodiyar nagar and road is full of pote holes "))