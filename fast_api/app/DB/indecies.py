from pymongo import MongoClient
import os

# -----------------------------
# MongoDB Connection
# -----------------------------
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://yashmodi:hL4qxBrlZeLQZdyv@cluster0.vguyv.mongodb.net/municipal_db?retryWrites=true&w=majority",
)
DB_NAME = "municipal_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

indexes = db.wards.list_indexes()
for index in indexes:
    print(index)
