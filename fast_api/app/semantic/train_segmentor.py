import json
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
)

# ---------------- CONFIG ----------------

MODEL_NAME = "distilbert-base-uncased"

LABELS = ["O", "B-COMP", "I-COMP", "B-LOC", "I-LOC"]
label2id = {l: i for i, l in enumerate(LABELS)}
id2label = {i: l for l, i in label2id.items()}

# ---------------- LOAD DATA ----------------

def load_data(path):
    with open(path) as f:
        return json.load(f)

train_data = load_data("train.json")
val_data = load_data("val.json")

train_ds = Dataset.from_list(train_data)
val_ds = Dataset.from_list(val_data)

# ---------------- TOKENIZER ----------------

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize_and_align_labels(batch):
    tokenized = tokenizer(
        batch["tokens"],
        is_split_into_words=True,
        truncation=True,
        padding="max_length",
        max_length=64,
    )

    labels = []
    for i, word_labels in enumerate(batch["tags"]):
        word_ids = tokenized.word_ids(batch_index=i)
        prev_word_id = None
        label_ids = []

        for word_id in word_ids:
            if word_id is None:
                label_ids.append(-100)
            elif word_id != prev_word_id:
                label_ids.append(label2id[word_labels[word_id]])
            else:
                label = word_labels[word_id]
                if label.startswith("B-"):
                    label = label.replace("B-", "I-")
                label_ids.append(label2id[label])

            prev_word_id = word_id

        labels.append(label_ids)

    tokenized["labels"] = labels
    return tokenized

train_ds = train_ds.map(tokenize_and_align_labels, batched=True)
val_ds = val_ds.map(tokenize_and_align_labels, batched=True)

# ---------------- MODEL ----------------

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(LABELS),
    id2label=id2label,
    label2id=label2id,
)

# ---------------- TRAINING ARGS ----------------

args = TrainingArguments(
    output_dir="./seg_model",
    eval_strategy="epoch",          # ✅ RENAMED
    learning_rate=5e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=5,
    weight_decay=0.01,
    logging_steps=50,
    save_strategy="epoch",
    load_best_model_at_end=True,
)


# ---------------- TRAINER ----------------

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_ds,
    eval_dataset=val_ds,
    tokenizer=tokenizer,
)

trainer.train()
