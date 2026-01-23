from typing import Dict


def resolve_location_decision(
    ranked_result: Dict,
    auto_threshold: float = 0.85,
    confirm_threshold: float = 0.65
) -> Dict:
    """
    Final authority for location resolution.
    Decides whether to AUTO-ACCEPT, CONFIRM, or ASK AGAIN.
    """

    status = ranked_result.get("resolution_status")
    confidence = ranked_result.get("confidence", 0.0)

    # No match at all
    if status == "NO_MATCH":
        return {
            "location": None,
            "confidence": 0.0,
            "resolution_status": "ASK",
            "action": "ASK_LOCATION"
        }

    # Ambiguous result (close competitors)
    if status == "AMBIGUOUS":
        return {
            "location": None,
            "confidence": confidence,
            "resolution_status": "CONFIRM",
            "action": "CONFIRM_OPTIONS",
            "candidates": ranked_result.get("candidates", [])
        }

    # Clear best candidate
    location = {
        "area_name": ranked_result["area_name"],
        "ward_id": ranked_result["ward_id"],
        "zone_id": ranked_result["zone_id"]
    }

    # Confidence gating
    if confidence >= auto_threshold:
        return {
            "location": location,
            "confidence": confidence,
            "resolution_status": "AUTO",
            "action": "PROCEED"
        }

    if confidence >= confirm_threshold:
        return {
            "location": location,
            "confidence": confidence,
            "resolution_status": "CONFIRM",
            "action": "CONFIRM_LOCATION"
        }

    # Low confidence → ask user again
    return {
        "location": None,
        "confidence": confidence,
        "resolution_status": "ASK",
        "action": "ASK_LOCATION"
    }
