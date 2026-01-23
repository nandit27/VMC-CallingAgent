from pymongo import MongoClient
import os

MONGO_URI = os.getenv(
    "MONGO_URI",
    # "mongodb+srv://yashmodi:hL4qxBrlZeLQZdyv@cluster0.vguyv.mongodb.net/?appName=Cluster0",
    "mongodb+srv://yashmodi:hL4qxBrlZeLQZdyv@cluster0.vguyv.mongodb.net/municipal_db?retryWrites=true&w=majority",
)

client = MongoClient(MONGO_URI)
db = client["municipal_db"]

zones_col = db["zones"]
wards_col = db["wards"]
areas_col = db["areas"]
print(client.server_info())
zones_col.insert_one({"name": "test_zone", "status": "connected"})

print("Inserted test document")
