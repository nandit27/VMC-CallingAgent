from fastapi import APIRouter, HTTPException
from app.DB.mongo import complaints_col
from typing import List, Dict, Any

router = APIRouter()

@router.get("/admin/dashboard")
async def get_dashboard_data(category: str = None):
    """
    Fetch dashboard data: stats and recent complaints.
    Optional 'category' query param filters the complaint list.
    """
    try:
        from app.data.department_mapping import DEPARTMENT_MAPPING, CATEGORY_TO_DEPARTMENT
        
        # Determine categories filter
        # 'category' param is now treated as 'Department Name' or 'Category Name'
        # If it matches a Department, we include ALL its categories.
        # If it matches a specific Category, we include just that.
        
        target_categories = []
        is_department_filter = False
        
        if category:
            if category in DEPARTMENT_MAPPING:
                target_categories = DEPARTMENT_MAPPING[category]
                is_department_filter = True
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
        
        # Custom Sort: High/Critical Priority First
        urgency_score = {
            "critical": 3,
            "high": 2,
            "medium": 1,
            "low": 0
        }
        
        def get_sort_key(complaint):
            level = complaint.get("urgency", {}).get("level", "medium").lower()
            return (urgency_score.get(level, 0), complaint.get("created_at", ""))

        recent_complaints.sort(key=get_sort_key, reverse=True)
        recent_complaints = recent_complaints[:50]
        
        # Calculate stats (Filtered)
        def count_with_filter(status_val):
            q = filter_query.copy()
            q["status"] = status_val
            return complaints_col.count_documents(q)

        status_counts = {
            "Open": count_with_filter("Open"),
            "Resolved": count_with_filter("Resolved"),
            "Pending": count_with_filter("Pending")
        }

        # Calculate Department Counts (Aggregation)
        # 1. Get raw category counts
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_counts_cursor = complaints_col.aggregate(pipeline)
        category_counts_map = {item["_id"]: item["count"] for item in category_counts_cursor if item["_id"]}
        
        # 2. Aggregate into Departments
        department_stats = []
        for dept_name, cats in DEPARTMENT_MAPPING.items():
            count = 0
            for cat in cats:
                count += category_counts_map.get(cat, 0)
            
            department_stats.append({
                "code": dept_name, # Using Name as Code for frontend compatibility
                "name": dept_name,
                "count": count,
                "categories": cats # Optional: send child categories if needed
            })
            
        # Sort departments by count desc
        department_stats.sort(key=lambda x: x["count"], reverse=True)

        # Calculate 7-Day Activity Trend (Filtered)
        from datetime import datetime, timedelta
        
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
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        trend_cursor = complaints_col.aggregate(trend_pipeline)
        trend_data_map = {item["_id"]: item["count"] for item in trend_cursor}
        
        activity_trend = []
        for i in range(7):
            date_obj = seven_days_ago + timedelta(days=i)
            date_str = date_obj.strftime("%Y-%m-%d")
            day_name = date_obj.strftime("%a")
            
            activity_trend.append({
                "date": date_str,
                "name": day_name,
                "count": trend_data_map.get(date_str, 0)
            })

        return {
            "stats": {
                "total": total_complaints,
                "by_status": status_counts,
                "by_category": department_stats, # Renaming in frontend might be needed, but 'by_category' is what frontend expects
                "activity_trend": activity_trend 
            },
            "recent_complaints": recent_complaints,
            "filter": {
                "category": category, # Echo back the input
                "is_department": is_department_filter
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

from bson import ObjectId

@router.put("/admin/complaint/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str):
    """
    Mark a complaint as Resolved
    """
    try:
        # Determine if ID is ObjectId or String
        query = {}
        if ObjectId.is_valid(complaint_id):
            query = {"_id": ObjectId(complaint_id)}
        else:
            # Fallback for custom string IDs
            # Try matching _id first, then complaintId if needed
            query = {"$or": [{"_id": complaint_id}, {"complaintId": complaint_id}]}

        # Update status to Resolved
        result = complaints_col.update_one(
            query,
            {"$set": {"status": "Resolved", "urgency.level": "resolved"}}
        )
        
        if result.matched_count == 0:
             # Try one more time treating it purely as a string ID
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
