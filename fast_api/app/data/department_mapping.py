
# Department to Category Mapping
DEPARTMENT_MAPPING = {
    "Engineering / Infrastructure Department": [
        "Traffic Signal", "Storm Water Drainage Project", "Road Project Above 18 Meter",
        "Road And Footpath", "Monsoon Complaints", "Drainage Project", "Drainage And Storm Drain",
        "ROAD", "DRAINAGE" 
    ],
    "Water Supply Department": ["Water Supply"],
    "Electrical / Lighting Department": ["Street Light"],
    "Solid Waste Management Department": [
        "RRR Collection Van", "Garbage And Cleanliness", "E Waste", "Door To Door Garbage",
        "GARBAGE"
    ],
    "Animal Control / Veterinary Department": [
        "Stray Dog", "Stray Cattle", "Dead Animals"
    ],
    "Public Health Department": ["Public Health", "Open Defecation", "Air Quality Management"],
    "Sanitation & Public Convenience Department": ["Public Toilet"],
    "Garden & Recreation Department": ["Swimming Pool", "Parks And Garden"],
    "Town Planning / Encroachment Department": ["Encroachment"],
    "Emergency & Disaster Management Department": ["QRT", "Emergency"],
    "Medical Services Department": ["Hospital And Dispensary"],
    "Housing & Urban Development Department": ["Housing Scheme"],
    "Gas & Utility Services Department": ["Gas Line"],
    "Transport Department": ["Mall Parking Fee", "City Bus Ser  vice"],
    "Civic Services / Administration Department": [
        "Crematorium", "Birth And Death", "Auditorium", "Atithi Gruh", "Assessment Tax Rebate"
    ],
    "Smart City / IT Department": ["Smart City Complaint"],
    "Finance & Budget Department": ["Budget Suggestion"],
    "Social Welfare / Health Schemes Department": ["Arogyam"]
}

# Reverse mapping for easy lookup: Category -> Department
CATEGORY_TO_DEPARTMENT = {}
for dept, categories in DEPARTMENT_MAPPING.items():
    for cat in categories:
        CATEGORY_TO_DEPARTMENT[cat] = dept
