import json

VALID_TAGS = {
    "B-COMP", "I-COMP",
    "B-LOC", "I-LOC",
    "O"
}

def validate_record(rec):
    tokens = rec["tokens"]
    tags = rec["tags"]

    assert len(tokens) == len(tags), "Token/tag length mismatch"

    for tag in tags:
        assert tag in VALID_TAGS, f"Invalid tag {tag}"

    for i, tag in enumerate(tags):
        if tag.startswith("I-"):
            prev = tags[i - 1] if i > 0 else None
            assert prev and (
                prev == tag or prev == tag.replace("I-", "B-")
            ), f"Invalid I-tag sequence at index {i}"

def main():
    with open("semantic_dataset.json") as f:
        data = json.load(f)

    for i, rec in enumerate(data):
        try:
            validate_record(rec)
        except AssertionError as e:
            print(f"❌ Error in record {i}: {e}")
            return

    print("✅ Dataset passed all checks")

if __name__ == "__main__":
    main()
