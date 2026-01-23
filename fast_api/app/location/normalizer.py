import re
import unicodedata

FILLER_WORDS = [
    "brother", "bhai", "sir", "madam",
    "please", "kindly", "help me",
    "do something", "i request",
    "i am requesting", "i am telling you"
]

CONTRACTIONS = {
    "don't": "do not",
    "doesn't": "does not",
    "can't": "cannot",
    "won't": "will not",
    "it's": "it is",
    "i'm": "i am",
    "they're": "they are",
    "we're": "we are"
}

NUMBER_MAP = {
    "one": "1", "two": "2", "three": "3",
    "four": "4", "five": "5", "six": "6",
    "seven": "7", "eight": "8", "nine": "9",
    "ten": "10"
}

def normalize_text(text: str) -> str:
    if not text:
        return ""

    # Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # Lowercase
    text = text.lower()

    # Expand contractions
    for c, e in CONTRACTIONS.items():
        text = text.replace(c, e)

    # Remove filler words
    for fw in FILLER_WORDS:
        text = text.replace(fw, " ")

    # Normalize numbers (spoken → digits)
    for word, num in NUMBER_MAP.items():
        text = re.sub(rf"\b{word}\b", num, text)

    # Remove punctuation / special characters
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text
