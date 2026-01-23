from typing import List, Dict
from rapidfuzz import fuzz


def score_candidate_against_area(candidate: str, area_doc: Dict) -> float:
    """
    Compute similarity score between a candidate string
    and an area document (name + aliases).
    """
    scores = []

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
