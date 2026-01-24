
from pymongo import MongoClient
import os

MONGO_URI = "mongodb+srv://yashmodi:hL4qxBrlZeLQZdyv@cluster0.vguyv.mongodb.net/municipal_db?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["municipal_db"]
complaints_col = db["complaints"]

print("--- Distinct Zones ---")
zones = complaints_col.distinct("location.zone")
print(zones)

print("\n--- Raw Aggregation ---")
pipeline = [
    {"$group": {"_id": "$location.zone", "count": {"$sum": 1}}}
]
results = list(complaints_col.aggregate(pipeline))
print(results)
