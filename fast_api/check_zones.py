
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["vmc_complaints_db"]
complaints_col = db["complaints"]

# Check unique zones
zones = complaints_col.distinct("location.zone")
print("Distinct Zones in DB:", zones)

# Check sample documents structure for location
print("\nSample Location Data:")
for doc in complaints_col.find({}, {"location": 1}).limit(10):
    print(doc)

# Check aggregation logic manually
print("\nTesting Aggregation Logic:")
zone_pipeline = [
    {"$group": {"_id": "$location.zone", "count": {"$sum": 1}}}
]
zone_cursor = list(complaints_col.aggregate(zone_pipeline))
print("Raw Aggregation Result:", zone_cursor)

zone_stats = {
    "Zone North": 0,
    "Zone South": 0,
    "Zone East": 0,
    "Zone West": 0
}

for item in zone_cursor:
    raw_zone = str(item.get("_id", "")).lower()
    count = item.get("count", 0)
    
    if "north" in raw_zone:
        zone_stats["Zone North"] += count
    elif "south" in raw_zone:
        zone_stats["Zone South"] += count
    elif "east" in raw_zone:
        zone_stats["Zone East"] += count
    elif "west" in raw_zone:
        zone_stats["Zone West"] += count

print("\nComputed Zone Stats:", zone_stats)
