from transformers import pipeline

segmenter = pipeline(
    "token-classification",
    model="./seg_model",
    tokenizer=MODEL_NAME,
    aggregation_strategy="simple",
)

text = "street lights are off in makarpura bus district and drainage problem near khodiyar nagar"

print(segmenter(text))
