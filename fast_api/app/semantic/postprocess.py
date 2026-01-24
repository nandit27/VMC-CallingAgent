def build_complaints_from_spans(spans):
    complaints = []
    current = None

    for span in spans:
        label = span["entity_group"]
        text = span["word"].strip()

        if label == "COMP":
            # 🔹 close previous complaint
            if current:
                complaints.append(current)

            # 🔹 start new complaint
            current = {
                "complaint_text": text,
                "location_text": None,
            }

        elif label == "LOC":
            if current:
                # 🔹 attach location
                current["location_text"] = text
            else:
                # 🔹 orphan location (rare but possible)
                complaints.append(
                    {
                        "complaint_text": None,
                        "location_text": text,
                    }
                )

    # 🔹 add last complaint
    if current:
        complaints.append(current)

    return complaints
