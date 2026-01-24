from collections import defaultdict
from typing import List, Dict


def rank_area_candidates(matches: List[Dict]) -> Dict:
    if not matches:
        return {"resolution_status": "NO_MATCH", "confidence": 0.0}

    grouped = defaultdict(list)
    for m in matches:
        grouped[m["area_name"]].append(m)

    scored = []

    for area, items in grouped.items():
        best = max(items, key=lambda x: x["score"])
        consistency = 1.0 if len(items) >= 2 else 0.5

        final = (
            0.6 * (best["score"] / 100.0)
            + 0.2 * consistency
            + 0.2 * min(len(best["candidate"].split()) / 5.0, 1.0)
        )

        scored.append(
            {
                "area_name": area,
                "ward_id": best["ward_id"],
                "zone_id": best["zone_id"],
                "final_score": round(final, 3),
            }
        )

    scored.sort(key=lambda x: x["final_score"], reverse=True)

    top = scored[0]
    return {
        "resolution_status": "AUTO" if top["final_score"] >= 0.8 else "CONFIRM",
        **top,
        "confidence": top["final_score"],
    }
