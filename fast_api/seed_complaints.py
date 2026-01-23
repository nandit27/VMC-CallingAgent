# import sys
# import os
# import asyncio
# from datetime import datetime, timedelta
# import random
# from app.DB.mongo import complaints_col

# # Add current directory to path
# sys.path.append(os.getcwd())

# async def seed_data():
#     print("Seeding dummy data for visualization...")
    
#     today = datetime.now()
#     categories = ["Traffic Signal", "Water Supply", "Street Light", "Garbage"]
    
#     new_complaints = []
    
#     # Generate 50 complaints over the last 7 days
#     for _ in range(50):
#         days_ago = random.randint(0, 7)
#         created_at = today - timedelta(days=days_ago)
        
#         # Add some randomness to hours
#         created_at = created_at.replace(hour=random.randint(8, 20), minute=random.randint(0, 59))
        
#         complaint = {
#             "title": "Test Complaint for Visualization",
#             "category": random.choice(categories),
#             "status": random.choice(["Open", "Pending", "Resolved"]),
#             "urgency": {"level": random.choice(["low", "medium", "high"])},
#             "created_at": created_at,
#             "location": {"wardNumber": "1", "zone": "East"},
#             "phoneNumber": "9999999999"
#         }
#         new_complaints.append(complaint)
        
#     if new_complaints:
#         complaints_col.insert_many(new_complaints)
#         print(f"Successfully inserted {len(new_complaints)} complaints.")
#     else:
#         print("No complaints generated.")

# if __name__ == "__main__":
#     asyncio.run(seed_data())
