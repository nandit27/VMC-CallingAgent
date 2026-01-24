import json
import random

with open("semantic_dataset.json", "r", encoding="utf-8") as f:
    data = json.load(f)

random.shuffle(data)

split = int(0.8 * len(data))

train_data = data[:split]
val_data = data[split:]

with open("train.json", "w", encoding="utf-8") as f:
    json.dump(train_data, f, indent=2)

with open("val.json", "w", encoding="utf-8") as f:
    json.dump(val_data, f, indent=2)

print(f"Created train.json ({len(train_data)}) and val.json ({len(val_data)})")
