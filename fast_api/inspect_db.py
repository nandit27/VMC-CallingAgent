from app.DB.mongo import complaints_col
import sys
import pprint

with open("db_dump.txt", "w", encoding="utf-8") as f:
    try:
        doc = complaints_col.find_one()
        if doc:
            f.write("Sample Document Keys:\n")
            for key in doc:
                f.write(f"- {key}: {type(doc[key])}\n")
            f.write("\nFull Document:\n")
            pprint.pprint(doc, stream=f)
        else:
            f.write("Collection is empty\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
