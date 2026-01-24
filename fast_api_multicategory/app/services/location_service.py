from app.location.extractor import extract_location_candidates
from app.location.matcher import fuzzy_match_areas
from app.location.ranker import rank_area_candidates
from app.location.resolver import resolve_location_decision
from app.DB.area_repo import fetch_all_active_areas


def resolve_location_from_text(text: str) -> dict:
    candidates = extract_location_candidates(text)
    area_docs = fetch_all_active_areas()
    matches = fuzzy_match_areas(candidates, area_docs)
    ranked = rank_area_candidates(matches)
    return resolve_location_decision(ranked)
