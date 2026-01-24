
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["vmc_complaints_db"]
complaints_col = db["complaints"]

print("--- Checking Location Field Structure ---")
# Get 5 docs
docs = list(complaints_col.find({}, {"location": 1}).limit(5))

for i, doc in enumerate(docs):
    print(f"Doc {i+1}: Location = {doc.get('location')}, Type = {type(doc.get('location'))}")

print("\n--- Checking for Zone Field ---")
# Check if any doc has location.zone
count_with_zone = complaints_col.count_documents({"location.zone": {"$exists": True}})
print(f"Documents with location.zone: {count_with_zone}")

total_docs = complaints_col.count_documents({})
print(f"Total Documents: {total_docs}")
