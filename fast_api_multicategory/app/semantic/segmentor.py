import os
from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers.pipelines import TokenClassificationPipeline

MODEL_DIR = r"D:\fast_api\seg_model\checkpoint-95"   # 🔥 REAL PATH

assert os.path.isdir(MODEL_DIR), f"MODEL DIR NOT FOUND: {MODEL_DIR}"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_DIR,
    local_files_only=True,
)

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_DIR,
    local_files_only=True,
)

segmenter = TokenClassificationPipeline(
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="simple",
)

def segment_semantically(text: str):
    return segmenter(text)
