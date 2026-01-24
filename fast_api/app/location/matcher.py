from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

try:
    from rapidfuzz import fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    logger.warning("rapidfuzz not found. Location matching will use basic string matching.")
    RAPIDFUZZ_AVAILABLE = False
    fuzz = None


def score_candidate_against_area(candidate: str, area_doc: Dict) -> float:
    """
    Compute similarity score between a candidate string
    and an area document (name + aliases).
    """
    scores = []

    if not RAPIDFUZZ_AVAILABLE:
        # Basic fallback: exact match or substring
        candidate_lower = candidate.lower()
        name_lower = area_doc["area_name"].lower()
        
        if candidate_lower == name_lower:
            return 100.0
            
        # Check aliases exact match
        for alias in area_doc.get("aliases", []):
            if candidate_lower == alias.lower():
                return 100.0
                
        # Partial match
        if name_lower in candidate_lower or candidate_lower in name_lower:
            return 80.0
            
        return 0.0

    # Compare with canonical area name
    scores.append(fuzz.token_set_ratio(candidate, area_doc["area_name"].lower()))
    scores.append(fuzz.partial_ratio(candidate, area_doc["area_name"].lower()))

    # Compare with aliases
    for alias in area_doc.get("aliases", []):
        scores.append(fuzz.token_set_ratio(candidate, alias))
        scores.append(fuzz.partial_ratio(candidate, alias))

    return max(scores)


def fuzzy_match_areas(
    candidates: List[str], area_docs: List[Dict], threshold: int = 70
) -> List[Dict]:
    """
    Match candidate strings against area documents.
    Returns scored matches above threshold.
    """
    matches = []

    for candidate in candidates:
        for area in area_docs:
            score = score_candidate_against_area(candidate, area)

            if score >= threshold:
                matches.append(
                    {
                        "candidate": candidate,
                        "area_name": area["area_name"],
                        "ward_id": area["ward_id"],
                        "zone_id": area["zone_id"],
                        "score": score,
                    }
                )

    return matches
