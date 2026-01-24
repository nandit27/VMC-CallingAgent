import re
from typing import List, Set

# Location anchors commonly used in speech
LOCATION_ANCHORS = [
    "near",
    "at",
    "in",
    "outside",
    "beside",
    "opposite",
    "behind",
    "around",
    "on",
]

# Words that usually do NOT belong to location names
STOPWORDS = {
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "not",
    "working",
    "problem",
    "issue",
    "very",
    "too",
    "much",
    "it",
    "this",
    "that",
    "do",
    "does",
    "did",
    "from",
    "since",
}


def extract_anchor_candidates(text: str, window: int = 5) -> List[str]:
    """
    Extract candidate phrases appearing after location anchors.
    """
    candidates = []

    tokens = text.split()
    for i, token in enumerate(tokens):
        if token in LOCATION_ANCHORS:
            phrase_tokens = tokens[i + 1 : i + 1 + window]
            phrase = " ".join(phrase_tokens)
            if phrase:
                candidates.append(phrase)

    return candidates


def extract_ngram_candidates(text: str, max_n: int = 5) -> List[str]:
    """
    Extract n-gram candidates (1 to max_n words).
    """
    tokens = text.split()
    candidates = []

    for n in range(1, max_n + 1):
        for i in range(len(tokens) - n + 1):
            chunk = tokens[i : i + n]

            # Skip chunks starting with stopwords
            if chunk[0] in STOPWORDS:
                continue

            phrase = " ".join(chunk)
            candidates.append(phrase)

    return candidates


def extract_location_candidates(text: str) -> List[str]:
    """
    Main function: combines anchor-based and n-gram extraction.
    Returns unique, cleaned candidate strings.
    """
    anchor_based = extract_anchor_candidates(text)
    ngram_based = extract_ngram_candidates(text)

    all_candidates: Set[str] = set(anchor_based + ngram_based)

    # Clean candidates: remove very short / noisy phrases
    cleaned = [c.strip() for c in all_candidates if len(c.split()) >= 1 and len(c) >= 3]
    print(cleaned)
    return cleaned
