import json
from typing import List


LABELS = {
    "C": "COMP",
    "L": "LOC",
    "O": "O",
}


def tokenize(text: str) -> List[str]:
    return text.lower().strip().split()


def apply_bio(tokens: List[str], spans: List[dict]) -> List[str]:
    tags = ["O"] * len(tokens)

    for span in spans:
        start = span["start"]
        end = span["end"]
        label = span["label"]

        tags[start] = f"B-{label}"
        for i in range(start + 1, end):
            tags[i] = f"I-{label}"

    return tags


def annotate_text(text: str):
    tokens = tokenize(text)

    print("\nTOKENS:")
    for i, t in enumerate(tokens):
        print(f"{i:>2}: {t}")

    print(
        """
INSTRUCTIONS:
- Mark spans using token indices
- Format: start_index end_index label
- label = C (complaint), L (location)
- Example: 0 3 C
- Type 'done' when finished
"""
    )

    spans = []

    while True:
        user_input = input("Span > ").strip()

        if user_input.lower() == "done":
            break

        try:
            start, end, label = user_input.split()
            start = int(start)
            end = int(end)
            label = LABELS[label.upper()]

            spans.append(
                {
                    "start": start,
                    "end": end,
                    "label": label,
                }
            )
        except Exception:
            print("❌ Invalid input. Try again.")

    tags = apply_bio(tokens, spans)

    return {
        "tokens": tokens,
        "tags": tags,
    }


def main():
    dataset = []

    print("\nSemantic Annotation Tool (Phase 1)")
    print("----------------------------------")

    while True:
        text = input("\nEnter ASR text (or 'exit'): ").strip()
        if text.lower() == "exit":
            break

        record = annotate_text(text)
        dataset.append(record)

        print("\nAnnotated Record:")
        print(json.dumps(record, indent=2))

    with open("semantic_dataset.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

    print("\n✅ Saved annotations to semantic_dataset.json")


if __name__ == "__main__":
    main()
    