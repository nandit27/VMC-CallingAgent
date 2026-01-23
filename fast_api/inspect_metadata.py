from app.DB.mongo import db, complaints_col
import sys

print("Collections:", db.list_collection_names())

print("\nDistinct Categories:", complaints_col.distinct("category"))
print("Distinct Urgency Levels:", complaints_col.distinct("urgency.level"))
