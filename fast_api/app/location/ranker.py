from typing import List, Dict
from collections import defaultdict


def rank_area_candidates(
    matches: List[Dict],
    auto_threshold: float = 0.85,
    confirm_threshold: float = 0.65
) -> Dict:
    """
    Rank fuzzy-matched area candidates and decide best area safely.
    """

    if not matches:
        return {
            "resolution_status": "NO_MATCH",
            "confidence": 0.0
        }

    # Group matches by area_name
    grouped = defaultdict(list)
    for m in matches:
        grouped[m["area_name"]].append(m)

    scored_areas = []

    for area_name, area_matches in grouped.items():
        best_match = max(area_matches, key=lambda x: x["score"])

        # 1️⃣ Normalize fuzzy score
        fuzzy_score = best_match["score"] / 100.0

        # 2️⃣ Candidate length score (cap at 5 words)
        candidate_len = len(best_match["candidate"].split())
        length_score = min(candidate_len / 5.0, 1.0)

        # 3️⃣ Consistency score (same area matched multiple times)
        consistency_score = min(len(area_matches) / 3.0, 1.0)

        final_score = (
            0.6 * fuzzy_score +
            0.2 * length_score +
            0.2 * consistency_score
        )

        scored_areas.append({
            "area_name": area_name,
            "ward_id": best_match["ward_id"],
            "zone_id": best_match["zone_id"],
            "final_score": round(final_score, 3),
            "best_fuzzy_score": best_match["score"]
        })

    # Sort by final score
    scored_areas.sort(key=lambda x: x["final_score"], reverse=True)

    top = scored_areas[0]
    second = scored_areas[1] if len(scored_areas) > 1 else None

    # Score gap check (avoid close ties)
    if second and (top["final_score"] - second["final_score"]) < 0.05:
        return {
            "resolution_status": "AMBIGUOUS",
            "confidence": top["final_score"],
            "candidates": scored_areas[:2]
        }

    # Decision thresholds
    if top["final_score"] >= auto_threshold:
        status = "AUTO"
    elif top["final_score"] >= confirm_threshold:
        status = "CONFIRM"
    else:
        status = "LOW_CONFIDENCE"

    return {
        "resolution_status": status,
        "area_name": top["area_name"],
        "ward_id": top["ward_id"],
        "zone_id": top["zone_id"],
        "confidence": top["final_score"]
    }
