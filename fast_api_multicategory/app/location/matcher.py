from typing import List, Dict
from rapidfuzz import fuzz


def score_candidate_against_area(candidate: str, area: Dict) -> float:
    scores = [
        fuzz.token_set_ratio(candidate, area["area_name"].lower()),
        fuzz.partial_ratio(candidate, area["area_name"].lower()),
    ]

    for alias in area.get("aliases", []):
        scores.append(fuzz.token_set_ratio(candidate, alias))
        scores.append(fuzz.partial_ratio(candidate, alias))

    return max(scores)


def fuzzy_match_areas(
    candidates: List[str],
    area_docs: List[Dict],
    threshold: int = 70,
) -> List[Dict]:
    matches = []

    for cand in candidates:
        for area in area_docs:
            score = score_candidate_against_area(cand, area)
            if score >= threshold:
                matches.append(
                    {
                        "candidate": cand,
                        "area_name": area["area_name"],
                        "ward_id": area["ward_id"],
                        "zone_id": area["zone_id"],
                        "score": score,
                    }
                )

    return matches
