from location.normalizer import normalize_text
from location.extractor import extract_location_candidates
from db.area_repo import find_areas_by_exact_or_alias
from location.matcher import fuzzy_match_areas
from location.ranker import rank_area_candidates
from location.resolver import resolve_location_decision


def resolve_location_from_text(raw_text: str) -> dict:
    # Step 1: normalize
    clean_text = normalize_text(raw_text)

    # Step 2: extract candidates
    candidates = extract_location_candidates(clean_text)

    # Step 3: fetch area docs
    area_docs = find_areas_by_exact_or_alias(candidates)

    # Step 4: fuzzy match
    matches = fuzzy_match_areas(candidates, area_docs)

    # Step 5: rank
    ranked = rank_area_candidates(matches)

    # Step 6: final decision
    return resolve_location_decision(ranked)
