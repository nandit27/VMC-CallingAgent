from typing import List, Dict
from DB.mongo import areas_col


def find_areas_by_exact_or_alias(candidates: List[str]) -> List[Dict]:
    """
    Fetch area documents that match candidates
    by exact name or alias.
    """
    if not candidates:
        return []

    query = {
        "$or": [{"area_name": {"$in": candidates}}, {"aliases": {"$in": candidates}}]
    }

    cursor = areas_col.find(
        query, {"_id": 0, "area_name": 1, "ward_id": 1, "zone_id": 1, "aliases": 1}
    )

    return list(cursor)
