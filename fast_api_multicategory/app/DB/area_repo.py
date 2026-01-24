from typing import List, Dict
from app.DB.mongo import areas_col


def fetch_all_active_areas() -> List[Dict]:
    """
    Fetch all active area documents.
    MongoDB does NOT decide matches.
    """
    cursor = areas_col.find(
        {"is_active": True},
        {"_id": 0, "area_name": 1, "ward_id": 1, "zone_id": 1, "aliases": 1},
    )

    return list(cursor)
