import re
import unicodedata

SEG_TOKEN = "__SEG__"

FILLER_WORDS = [
    "brother", "bhai", "sir", "madam", "please", "kindly",
    "help me", "do something", "i request", "i am requesting",
    "you know", "actually", "basically", "uh", "um",
]

CONTRACTIONS = {
    "don't": "do not",
    "doesn't": "does not",
    "can't": "cannot",
    "won't": "will not",
    "it's": "it is",
    "i'm": "i am",
}

NUMBER_MAP = {
    "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7",
    "eight": "8", "nine": "9", "ten": "10",
}

SEGMENT_CUES = [
    "and", "but", "also", "then", "after that", "another",
]

CUE_PATTERN = "|".join(
    re.escape(cue) for cue in sorted(SEGMENT_CUES, key=len, reverse=True)
)

CLAUSE_START = r"""
(?=
    there\s+(is|are) |
    [a-z]+\s+(is|are|was|were)
)
"""


def normalize_text(text: str) -> str:
    if not text:
        return ""

    text = unicodedata.normalize("NFKC", text).lower()

    for c, e in CONTRACTIONS.items():
        text = re.sub(rf"\b{c}\b", e, text)

    for word, num in NUMBER_MAP.items():
        text = re.sub(rf"\b{word}\b", num, text)

    for fw in FILLER_WORDS:
        text = re.sub(rf"\b{fw}\b", "", text)

    text = re.sub(
        rf"\b({CUE_PATTERN})\b\s*{CLAUSE_START}",
        rf"\1 {SEG_TOKEN} ",
        text,
        flags=re.VERBOSE,
    )

    text = re.sub(r"[^a-z0-9_\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def segment_text(normalized_text: str) -> list[str]:
    parts = re.split(rf"\s*{re.escape(SEG_TOKEN)}\s*", normalized_text)

    segments = []
    for part in parts:
        clean = re.sub(r"_+", " ", part)
        clean = re.sub(r"\s+", " ", clean).strip()

        assert SEG_TOKEN not in clean
        assert "_" not in clean

        if len(clean.split()) >= 4:
            segments.append(clean)

    return segments
