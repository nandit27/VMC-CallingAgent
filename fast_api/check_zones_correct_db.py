
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Use the URI found in mongo.py
MONGO_URI = "mongodb+srv://yashmodi:hL4qxBrlZeLQZdyv@cluster0.vguyv.mongodb.net/municipal_db?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["municipal_db"]
complaints_col = db["complaints"]

print("--- Checking Location Field Structure (Remote DB) ---")
# Get 5 docs
docs = list(complaints_col.find({}, {"location": 1}).limit(5))

for i, doc in enumerate(docs):
    loc = doc.get('location')
    print(f"Doc {i+1}: Location = {loc}, Type = {type(loc)}")

print("\n--- Checking for Zone Field ---")
# Check if any doc has location.zone
count_with_zone = complaints_col.count_documents({"location.zone": {"$exists": True}})
print(f"Documents with location.zone: {count_with_zone}")

# Check raw values if it's a string
if docs and isinstance(docs[0].get('location'), str):
    print("\n--- Sample Location Strings ---")
    distinct_locs = complaints_col.distinct("location")
    print(f"First 10 Distinct Locations: {distinct_locs[:10]}")

total_docs = complaints_col.count_documents({})
print(f"Total Documents: {total_docs}")
