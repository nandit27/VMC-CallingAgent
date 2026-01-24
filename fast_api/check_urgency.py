
import sys
import os
import asyncio
from app.DB.mongo import complaints_col

# Add current directory to path
sys.path.append(os.getcwd())

async def check_urgency():
    print("Checking Urgency Field Structure...")
    
    # Get last 20 complaints
    cursor = complaints_col.find({}, {"urgency": 1, "created_at": 1}).sort("created_at", -1).limit(20)
    
    for c in cursor:
        urgency = c.get("urgency")
        print(f"ID: {c.get('_id')} | Urgency Type: {type(urgency)} | Value: {urgency}")

if __name__ == "__main__":
    asyncio.run(check_urgency())
