from fastapi import APIRouter
from pydantic import BaseModel

from app.services.category_service import classify_category
from app.services.location_service import resolve_location_from_text

router = APIRouter(prefix="/complaint", tags=["Complaint"])


class ComplaintRequest(BaseModel):
    voice_text: str


@router.post("/analyze")
def analyze_complaint(req: ComplaintRequest):
    text = req.voice_text.strip()

    category_result = classify_category(text)
    location_result = resolve_location_from_text(text)

    response = {
        "category": category_result,
        "location": location_result.get("location"),
        "location_confidence": location_result.get("confidence"),
        "location_status": location_result.get("resolution_status"),
        "action": location_result.get("action")
    }

    # If location needs confirmation or asking again
    if "candidates" in location_result:
        response["candidates"] = location_result["candidates"]

    return response
    