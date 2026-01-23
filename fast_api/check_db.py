import sys
import os
import asyncio
from datetime import datetime
from app.DB.mongo import complaints_col

# Add current directory to path
sys.path.append(os.getcwd())

async def check_data():
    print("Checking total complaints...")
    total = complaints_col.count_documents({})
    print(f"Total: {total}")
    
    print("\nChecking recent dates (last 10):")
    cursor = complaints_col.find({}, {"created_at": 1}).sort("created_at", -1).limit(10)
    for doc in cursor:
        print(doc.get("created_at"))

if __name__ == "__main__":
    asyncio.run(check_data())
