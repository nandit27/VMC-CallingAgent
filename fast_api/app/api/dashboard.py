from fastapi import APIRouter, HTTPException
from app.DB.mongo import complaints_col, db
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

# Define priority map globally
CATEGORY_PRIORITIES = {
    # Critical (1) - Life Safety & Basic Necessities
    'EMERGENCY_DISASTER': 1,        
    'MEDICAL_SERVICES': 1,          
    'WATER_SUPPLY': 1,              
    'GAS_UTILITY': 1,
    'DISASTER': 1,
    'MEDICAL': 1,
    'GAS_LINE': 1, # Tag for Gas Line

    # High (2) - Health & Sanitation
    'ELECTRICAL_LIGHTING': 2,       
    'SOLID_WASTE': 2,               
    'SANITATION': 2,                
    'PUBLIC_HEALTH': 2,
    'STREETLIGHT': 2,
    'GARBAGE': 2,
    'HEALTH': 2,             

    # Medium (3) - Infrastructure & Mobility
    'ENGINEERING_INFRASTRUCTURE': 3, 
    'TRANSPORT': 3,                 
    'ANIMAL_CONTROL': 3,
    'ENGINEERING': 3,
    'ANIMAL': 3,            

    # Low (4) - Administration & Planning
    'TOWN_PLANNING': 4,             
    'HOUSING_URBAN': 4,             
    'GARDEN_RECREATION': 4,         
    'CIVIC_ADMINISTRATION': 4,      
    'SMART_CITY_IT': 4,             
    'FINANCE_BUDGET': 4,            
    'SOCIAL_WELFARE': 4,
    'ENCROACHMENT': 4,
    'HOUSING': 4,
    'GARDEN': 4,
    'CIVIC': 4,
    'IT': 4,
    'FINANCE': 4,
    'WELFARE': 4,

    # General Fallbacks for Tags
    'GAS': 1,
    'GARBAGE_CLEANLINESS': 2,
    'DRAINAGE_STORM_DRAIN': 3,
    'ROAD_FOOTPATH': 3,
    'STREET_LIGHT': 2,
    'DEAD_ANIMALS': 3
}

def get_complaint_tag(category_name: str) -> str:
    """
    Normalizes a Category Name (e.g. 'Water Supply') to a Complaint Tag (e.g. 'WATER_SUPPLY')
    Rule: Replace ' And ' with ' ', then space to underscore, then upper.
    """
    if not category_name:
        return ""
    return category_name.replace(" And ", " ").replace(" ", "_").upper()

@router.get("/admin/dashboard")
async def get_dashboard_data(category: str = None, period: str = "weekly"):
    """
    Fetch dashboard data: stats and recent complaints.
    Optional 'category' query param filters the complaint list.
    """
    try:
        # Dynamic Department Mapping
        # 1. Fetch Categories (ID -> Name)
        categories_cursor = db["categories"].find()
        category_id_map = {}
        for cat in categories_cursor:
            if "category_id" in cat and "category_name" in cat:
                category_id_map[cat["category_id"]] = cat["category_name"]
        
        # 2. Fetch Departments
        departments_cursor = db["departments"].find()
        # dept_len removed
        department_map = {} # Code -> List[Tags]
        department_names = {} # Code -> Name
        department_categories = {} # Code -> List[Category Names]
        
        for dept in departments_cursor:
            d_code = dept.get("code")
            d_name = dept.get("name")
            d_cat_ids = dept.get("category_ids", [])
            
            department_names[d_code] = d_name
            
            # Map IDs to Tags
            tags = []
            cat_objects = []
            for cid in d_cat_ids:
                c_name = category_id_map.get(cid)
                if c_name:
                    tag = get_complaint_tag(c_name)
                    tags.append(tag)
                    cat_objects.append({"name": c_name, "tag": tag})
                    
            department_map[d_code] = tags
            department_categories[d_code] = cat_objects

        # Determine categories filter
        target_categories = []
        is_department_filter = False
        
        if category:
            # Check if 'category' param matches a Department Name or Code
            # We need to find the code if Name is passed
            found_code = None
            for code, name in department_names.items():
                if category == name or category == code:
                    found_code = code
                    break
            
            if found_code and found_code in department_map:
                target_categories = department_map[found_code]
                is_department_filter = True
            else:
                # Assume it's a specific Category Tag or Name
                # If it's a Name (e.g. "Traffic Signal"), convert to Tag
                # But best to rely on Tag being passed now
                if " " in category and category.isupper() == False:
                     # Attempt reverse lookup or just legacy conversion
                     target_categories = [get_complaint_tag(category)]
                else:
                     target_categories = [category]
                
        # Build query filter
        filter_query = {}
        if target_categories:
            filter_query["category"] = {"$in": target_categories}

        # Get total count (Filtered)
        total_complaints = complaints_col.count_documents(filter_query)
        
        # Get recent complaints (Filtered)
        recent_complaints_cursor = complaints_col.find(
            filter_query, 
            {"_id": 0}
        ).sort("created_at", -1).limit(100)
        
        recent_complaints = list(recent_complaints_cursor)
        
        # Custom Sort: Priority First (using hardcoded map)
        
        def get_priority_val(category):
            if not category: return 4
            cat_upper = str(category).upper().replace(" ", "_").replace("AND_", "")
            
            if category in CATEGORY_PRIORITIES:
                return CATEGORY_PRIORITIES[category]
            if cat_upper in CATEGORY_PRIORITIES:
                return CATEGORY_PRIORITIES[cat_upper]
            if get_complaint_tag(category) in CATEGORY_PRIORITIES:
                return CATEGORY_PRIORITIES[get_complaint_tag(category)]
            return 4 # Default Low

        def get_sort_key(complaint):
            # Sort by Priority (Ascending 1..4) then Date (Desc)
            # Python sort entries: (Priority, -Timestamp)
            # Timestamp needs to be float/int for negation, or reverse tuple logic
            
            p_val = get_priority_val(complaint.get("category"))
            
            created_at = complaint.get("created_at", "")
            ts = 0
            if hasattr(created_at, 'timestamp'):
                ts = created_at.timestamp()
            
            # We want Lowest Priority Number First (1=Critical), then Newest Date (Highest TS)
            return (p_val, -ts)

        recent_complaints.sort(key=get_sort_key) # Default Ascending for p_val (1..4), Descending for TS (-ts)
        recent_complaints = recent_complaints[:50]
        
        # Inject computed urgency into the recent_complaints response for Frontend
        PRIORITY_LEVEL_MAP = {1: "critical", 2: "high", 3: "medium", 4: "low"}
        for c in recent_complaints:
            pv = get_priority_val(c.get("category"))
            c["urgency"] = {"level": PRIORITY_LEVEL_MAP.get(pv, "low")}
        
        # Calculate stats (Filtered)
        def count_with_filter(status_val):
            q = filter_query.copy()
            q["status"] = status_val
            return complaints_col.count_documents(q)
            
        def count_pending():
             q = filter_query.copy()
             q["status"] = {"$ne": "Resolved"}
             return complaints_col.count_documents(q)

        status_counts = {
            "Open": count_with_filter("Open"),
            "Resolved": count_with_filter("Resolved"),
            "Pending": count_pending()
        }

        # Define priority map
        # Using Global CATEGORY_PRIORITIES

        PRIORITY_LEVEL_MAP = {
            1: "critical",
            2: "high",
            3: "medium",
            4: "low"
        }

        # Calculate Priority Counts by aggregating on Category first
        # This allows us to use the map
        priority_group_pipeline = [
             {"$match": filter_query},
             {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        
        priority_group_cursor = complaints_col.aggregate(priority_group_pipeline)
        
        priority_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        for item in priority_group_cursor:
            cat = item.get("_id")
            count = item.get("count", 0)
            if not cat: continue
            
            # Normalize cat to uppercase for matching
            norm_cat = str(cat).upper().replace(" ", "_").replace("AND_", "") # Attempt to match tags
             
            # Direct match or fuzzy match
            if cat in CATEGORY_PRIORITIES:
                p_val = CATEGORY_PRIORITIES[cat]
            elif norm_cat in CATEGORY_PRIORITIES:
                p_val = CATEGORY_PRIORITIES[norm_cat]
            elif get_complaint_tag(cat) in CATEGORY_PRIORITIES:
                p_val = CATEGORY_PRIORITIES[get_complaint_tag(cat)]
            else:
                p_val = 4 # Default to Low
                
            level_name = PRIORITY_LEVEL_MAP.get(p_val, "low")
            priority_counts[level_name] += count
            
        high_priority_count = priority_counts["critical"] + priority_counts["high"]

        # Calculate Department Counts (Aggregation)
        # 1. Get raw category counts
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_counts_cursor = complaints_col.aggregate(pipeline)
        category_counts_map = {item["_id"]: item["count"] for item in category_counts_cursor if item["_id"]}
        
        # 2. Aggregate into Departments using Dynamic Map
        department_stats = []
        for code, tags in department_map.items():
            count = 0
            for tag in tags:
                count += category_counts_map.get(tag, 0)
            
            department_stats.append({
                "code": code,
                "name": department_names[code],
                "count": count,
                "categories": department_categories[code] # List of readable names
            })
            
        # Sort departments by count desc
        department_stats.sort(key=lambda x: x["count"], reverse=True)

        # Calculate Zone Counts (Dynamic from DB)
        # Group by location.zone (assuming schema stores it there)
        # We need to map DB values (e.g. "East", "east", "Zone East") to standardized keys
        zone_pipeline = [
            {"$match": filter_query},
            {"$group": {"_id": "$location.zone", "count": {"$sum": 1}}}
        ]
        zone_cursor = complaints_col.aggregate(zone_pipeline)
        
        # Standardize to 4 main zones
        zone_stats = {
            "Zone North": 0,
            "Zone South": 0,
            "Zone East": 0,
            "Zone West": 0
        }
        
        for item in zone_cursor:
            raw_zone = str(item.get("_id", "")).lower()
            count = item.get("count", 0)
            
            if "north" in raw_zone or raw_zone == "n":
                zone_stats["Zone North"] += count
            elif "south" in raw_zone or raw_zone == "s":
                zone_stats["Zone South"] += count
            elif "east" in raw_zone or raw_zone == "e":
                zone_stats["Zone East"] += count
            elif "west" in raw_zone or raw_zone == "w":
                zone_stats["Zone West"] += count
            # Ignore others/unknowns for the chart per requirement

        # Calculate Activity Trend based on Period
        period = period.lower() if period else 'weekly'
        
        activity_trend = []
        
        if period == 'monthly':
            # Last 30 Days (Daily)
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            thirty_days_ago = today - timedelta(days=29)
            
            trend_match = {
                 "created_at": {"$gte": thirty_days_ago}
            }
            if target_categories:
                trend_match["category"] = {"$in": target_categories}

            trend_pipeline = [
                { "$match": trend_match },
                {
                    "$group": {
                        "_id": { "$dateToString": { "format": "%Y-%m-%d", "date": "$created_at" } },
                        "count": { "$sum": 1 },
                        # "pending": { "$sum": { "$cond": [{ "$ne": ["$status", "Resolved"] }, 1, 0] } }, # Complex, maybe simple count first
                        # For simple usage, we just use total count per day. 
                        # To support stacked (pending vs resolved), we need conditional sum
                        "resolved": { "$sum": { "$cond": [{ "$eq": ["$status", "Resolved"] }, 1, 0] } },
                        "pending": { "$sum": { "$cond": [{ "$ne": ["$status", "Resolved"] }, 1, 0] } }
                    }
                },
                { "$sort": { "_id": 1 } }
            ]
            
            trend_cursor = complaints_col.aggregate(trend_pipeline)
            trend_data_map = {item["_id"]: item for item in trend_cursor}
            
            activity_trend = []
            for i in range(30):
                date_obj = thirty_days_ago + timedelta(days=i)
                date_str = date_obj.strftime("%Y-%m-%d")
                day_name = date_obj.strftime("%b %d")
                
                data = trend_data_map.get(date_str, {"count": 0, "pending": 0, "resolved": 0})
                
                activity_trend.append({
                    "date": date_str,
                    "name": day_name, 
                    "count": data.get("count", 0),
                    "pending": data.get("pending", 0),
                    "resolved": data.get("resolved", 0)
                })

        else:
            # Default: Weekly (Last 7 Days)
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            seven_days_ago = today - timedelta(days=6)
            
            trend_match = {
                "created_at": {"$gte": seven_days_ago}
            }
            if target_categories:
                trend_match["category"] = {"$in": target_categories}

            trend_pipeline = [
                {
                    "$match": trend_match
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                        },
                        "count": {"$sum": 1},
                        "resolved": { "$sum": { "$cond": [{ "$eq": ["$status", "Resolved"] }, 1, 0] } },
                        "pending": { "$sum": { "$cond": [{ "$ne": ["$status", "Resolved"] }, 1, 0] } }
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            
            trend_cursor = complaints_col.aggregate(trend_pipeline)
            trend_data_map = {item["_id"]: item for item in trend_cursor}
            
            activity_trend = []
            for i in range(7):
                date_obj = seven_days_ago + timedelta(days=i)
                date_str = date_obj.strftime("%Y-%m-%d")
                day_name = date_obj.strftime("%a")
                
                data = trend_data_map.get(date_str, {"count": 0, "pending": 0, "resolved": 0})
                
                activity_trend.append({
                    "date": date_str,
                    "name": day_name,
                    "count": data.get("count", 0),
                    "pending": data.get("pending", 0),
                    "resolved": data.get("resolved", 0)
                })

        return {
            "stats": {
                "total": total_complaints,
                "by_status": status_counts,
                "by_status": status_counts,
                "high_priority": high_priority_count,
                "priority_breakdown": priority_counts,
                "by_category": department_stats, 
                "by_zone": zone_stats,
                "activity_trend": activity_trend 
            },
            "recent_complaints": recent_complaints,
            "filter": {
                "category": category, 
                "is_department": is_department_filter,
                "period": period
            }
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

from bson import ObjectId

@router.put("/admin/complaint/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str):
    """
    Mark a complaint as Resolved
    """
    try:
        query = {}
        if ObjectId.is_valid(complaint_id):
            query = {"_id": ObjectId(complaint_id)}
        else:
            query = {"$or": [{"_id": complaint_id}, {"complaintId": complaint_id}]}

        result = complaints_col.update_one(
            query,
            {"$set": {"status": "Resolved", "urgency.level": "resolved"}}
        )
        
        if result.matched_count == 0:
             result = complaints_col.update_one(
                {"_id": complaint_id},
                 {"$set": {"status": "Resolved", "urgency.level": "resolved"}}
             )
             if result.matched_count == 0:
                raise HTTPException(status_code=404, detail=f"Complaint not found: {complaint_id}")
             
        return {"message": "Complaint resolved successfully", "complaint_id": complaint_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resolving complaint: {str(e)}")

@router.get("/admin/complaints")
async def get_all_complaints():
    """
    Fetch ALL complaints for the detailed list view.
    Sorted by newest first.
    """
    try:
        cursor = complaints_col.find({}, {"_id": 0}).sort("created_at", -1)
        complaints = list(cursor)
        return {"complaints": complaints}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching complaints: {str(e)}")

