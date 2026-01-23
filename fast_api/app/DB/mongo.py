"""
MongoDB Connection Management
Provides database and collection references for the application
"""

from pymongo import MongoClient
import os

# Get MongoDB URI from environment variable
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://yashmodi:hL4qxBrlZeLQZdyv@cluster0.vguyv.mongodb.net/municipal_db?retryWrites=true&w=majority",
)

# Initialize MongoDB client and database
client = MongoClient(MONGO_URI)
db = client["municipal_db"]

# Collection references
zones_col = db["zones"]
wards_col = db["wards"]
areas_col = db["areas"]
complaints_col = db["complaints"]

