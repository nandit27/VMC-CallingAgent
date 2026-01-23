from location.matcher import fuzzy_match_areas

candidates = [
    "shivaji nagr",
    "shivaji nagr road",
    "nagr"
]

area_docs = [
    {
        "area_name": "Shivaji Nagar",
        "ward_id": 1,
        "zone_id": "E",
        "aliases": ["shivaji nagar", "shivaji ngr"]
    }
]

matches = fuzzy_match_areas(candidates, area_docs)

from location.ranker import rank_area_candidates
result = rank_area_candidates(matches)

from location.resolver import resolve_location_decision
print(resolve_location_decision(result))