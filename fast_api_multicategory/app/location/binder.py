def bind_locations_to_complaints(complaints, resolved_locations):
    """
    complaints: [{text, start_token, end_token}]
    resolved_locations: [{area_name, start_token, end_token, confidence}]
    """

    bindings = []

    for comp in complaints:
        bound = None

        # Rule 1: inside span
        for loc in resolved_locations:
            if (
                loc["start_token"] >= comp["start_token"]
                and loc["end_token"] <= comp["end_token"]
            ):
                bound = loc
                break

        # Rule 2: nearest previous
        if not bound:
            prev = [
                loc
                for loc in resolved_locations
                if loc["end_token"] <= comp["start_token"]
            ]
            if prev:
                bound = max(prev, key=lambda x: x["end_token"])

        bindings.append(
            {
                "complaint": comp,
                "location": bound,
            }
        )

    return bindings
