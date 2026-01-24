from typing import Dict


def resolve_location_decision(ranked: Dict) -> Dict:
    status = ranked.get("resolution_status")
    confidence = ranked.get("confidence", 0.0)

    if status == "NO_MATCH":
        return {
            "location": None,
            "confidence": 0.0,
            "resolution_status": "ASK",
            "action": "ASK_LOCATION",
        }

    location = {
        "area_name": ranked["area_name"],
        "ward_id": ranked["ward_id"],
        "zone_id": ranked["zone_id"],
    }

    if confidence >= 0.8:
        return {
            "location": location,
            "confidence": confidence,
            "resolution_status": "AUTO",
            "action": "PROCEED",
        }

    return {
        "location": location,
        "confidence": confidence,
        "resolution_status": "CONFIRM",
        "action": "CONFIRM_LOCATION",
    }
