import sys
import os
import asyncio
from datetime import datetime
from app.DB.mongo import complaints_col

# Add current directory to path
sys.path.append(os.getcwd())

async def fix_dates():
    print("Fixing dates for recent complaints...")
    
    # 1. Update entries with missing dates to have valid dates
    # specific target: 2026-01-23 (Fri) and 2026-01-24 (Sat)
    
    date_fri = datetime(2026, 1, 23, 14, 30)
    date_sat = datetime(2026, 1, 24, 10, 15)
    
    # Find complaints with created_at = null
    query = {"created_at": None}
    
    # Update first 5 to Fri
    cursor = complaints_col.find(query).limit(5)
    ids_fri = [doc["_id"] for doc in cursor]
    if ids_fri:
        complaints_col.update_many(
            {"_id": {"$in": ids_fri}},
            {"$set": {"created_at": date_fri}}
        )
        print(f"Updated {len(ids_fri)} complaints to {date_fri} (Friday)")
        
    # Update next 5 to Sat
    cursor = complaints_col.find(query).limit(5) # Find remaining
    ids_sat = [doc["_id"] for doc in cursor]
    if ids_sat:
        complaints_col.update_many(
            {"_id": {"$in": ids_sat}},
            {"$set": {"created_at": date_sat}}
        )
        print(f"Updated {len(ids_sat)} complaints to {date_sat} (Saturday)")

    # Just in case, insert one new one for Sat if none were found
    if not ids_fri and not ids_sat:
        print("No null-date complaints found. Inserting fresh sample for Sat...")
        complaints_col.insert_one({
             "title": "Manual Test Entry Sat",
             "status": "Open",
             "created_at": date_sat,
             "category": "Water Supply",
             "urgency": {"level": "high"}
        })

if __name__ == "__main__":
    asyncio.run(fix_dates())
