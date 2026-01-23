from app.DB.mongo import db
import pymongo

# List from user request
departments = [
    {"code": "ENGINEERING", "name": "Engineering / Infrastructure Department"},
    {"code": "WATER_SUPPLY", "name": "Water Supply Department"},
    {"code": "STREETLIGHT", "name": "Electrical / Lighting Department"},
    {"code": "GARBAGE", "name": "Solid Waste Management Department"},
    {"code": "ANIMAL", "name": "Animal Control / Veterinary Department"},
    {"code": "HEALTH", "name": "Public Health Department"},
    {"code": "SANITATION", "name": "Sanitation & Public Convenience Department"},
    {"code": "GARDEN", "name": "Garden & Recreation Department"},
    {"code": "ENCROACHMENT", "name": "Town Planning / Encroachment Department"},
    {"code": "DISASTER", "name": "Emergency & Disaster Management Department"},
    {"code": "MEDICAL", "name": "Medical Services Department"},
    {"code": "HOUSING", "name": "Housing & Urban Development Department"},
    {"code": "GAS", "name": "Gas & Utility Services Department"},
    {"code": "TRANSPORT", "name": "Transport Department"},
    {"code": "CIVIC", "name": "Civic Services / Administration Department"},
    {"code": "IT", "name": "Smart City / IT Department"},
    {"code": "FINANCE", "name": "Finance & Budget Department"},
    {"code": "WELFARE", "name": "Social Welfare / Health Schemes Department"}
]

def seed_departments():
    col = db["departments"]
    # clear existing to ensure exact list
    col.delete_many({})
    
    result = col.insert_many(departments)
    print(f"Inserted {len(result.inserted_ids)} departments.")

if __name__ == "__main__":
    seed_departments()
