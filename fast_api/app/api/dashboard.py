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
        # Build query filter
        filter_query = {}
        if category:
            filter_query["category"] = category

        # Get total count (Global)
        total_complaints = complaints_col.count_documents({})
        
        # Get recent complaints (Filtered)
        # Get recent complaints (Filtered)
        # Fetch more to allow for custom sorting in Python
        recent_complaints_cursor = complaints_col.find(
            filter_query, 
            {"_id": 0}
        ).sort("created_at", -1).limit(100)
        
        recent_complaints = list(recent_complaints_cursor)
        
        # Custom Sort: High/Critical Priority First
        # Map urgency level to numeric score (Higher is more urgent)
        urgency_score = {
            "critical": 3,
            "high": 2,
            "medium": 1,
            "low": 0
        }
        
        def get_sort_key(complaint):
            level = complaint.get("urgency", {}).get("level", "medium").lower()
            return (urgency_score.get(level, 0), complaint.get("created_at", ""))

        # Sort descending (Higher score first, then newer date)
        recent_complaints.sort(key=get_sort_key, reverse=True)
        
        # Limit to 50 after sorting
        recent_complaints = recent_complaints[:50]
        
        # Calculate stats (Global)
        status_counts = {
            "Open": complaints_col.count_documents({"status": "Open"}),
            "Resolved": complaints_col.count_documents({"status": "Resolved"}),
            "Pending": complaints_col.count_documents({"status": "Pending"})
        }

        # Calculate Category Counts (Global Aggregation)
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_counts_cursor = complaints_col.aggregate(pipeline)
        
        # Map counts by code
        counts_map = {item["_id"]: item["count"] for item in category_counts_cursor if item["_id"]}

        # Fetch Reference Departments from DB
        from app.DB.mongo import db
        dept_col = db["departments"]
        all_departments = list(dept_col.find({}, {"_id": 0}))
        
        # If departments collection is empty (fallback), build from aggregation
        if not all_departments:
             category_stats = [{"code": k, "name": k.replace("_", " ").title(), "count": v} for k, v in counts_map.items()]
        else:
            # Build list with counts (0 if missing)
            category_stats = []
            for dept in all_departments:
                code = dept.get("code")
                category_stats.append({
                    "code": code,
                    "name": dept.get("name"),
                    "count": counts_map.get(code, 0)
                })
            
            # Optional: Append categories found in complaints butNOT in department list?
            # User requested specific list, so we might skip this or append as "Other"
            # For now, sticking strictly to the 18 departments as requested.

        # Calculate 7-Day Activity Trend
        from datetime import datetime, timedelta
        
        # Last 7 days counting today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        seven_days_ago = today - timedelta(days=6)
        
        trend_pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": seven_days_ago}
                }
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
        
        # Fill zero values for missing days
        activity_trend = []
        for i in range(7):
            date_obj = seven_days_ago + timedelta(days=i)
            date_str = date_obj.strftime("%Y-%m-%d")
            # Format day name (e.g., "Mon", "Tue")
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
                "by_category": category_stats,
                "activity_trend": activity_trend 
            },
            "recent_complaints": recent_complaints,
            "filter": {
                "category": category
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
