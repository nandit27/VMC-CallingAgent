from fastapi import APIRouter, HTTPException
from app.DB.mongo import complaints_col
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/admin/dashboard")
async def get_dashboard_data(category: str = None, period: str = "weekly"):
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
            created_at = complaint.get("created_at", "")
            # Ensure created_at is comparable (convert to string if datetime)
            if hasattr(created_at, 'isoformat'):
                created_at = created_at.isoformat()
            return (urgency_score.get(level, 0), str(created_at))

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

        # Calculate Activity Trend based on Period
        # Default to 'weekly' if not specified
        period = period.lower() if period else 'weekly'
        
        activity_trend = []
        
        if period == 'monthly':
            # Last 12 Months
            # We want to group by Year-Month (YYYY-MM)
            today = datetime.now()
            # Start from 11 months ago to cover a full 12-month window including current month
            # Or simplier: just get dates > 1 year ago
            one_year_ago = today - timedelta(days=365)
            
            trend_match = {
                 "created_at": {"$gte": one_year_ago}
            }
            if target_categories:
                trend_match["category"] = {"$in": target_categories}

            trend_pipeline = [
                { "$match": trend_match },
                {
                    "$group": {
                        "_id": { "$dateToString": { "format": "%Y-%m", "date": "$created_at" } },
                        "count": { "$sum": 1 }
                    }
                },
                { "$sort": { "_id": 1 } }
            ]
            
            trend_cursor = complaints_col.aggregate(trend_pipeline)
            trend_data_map = {item["_id"]: item["count"] for item in trend_cursor}
            
            # Generate last 12 months list for filling gaps
            # Logic: Iterate from 11 months ago to now
            current_month = today.replace(day=1)
            for i in range(11, -1, -1):
                # Calculate past month
                # safe logic: subtracting days is tricky for months. 
                # Better: (Year, Month) tuples
                # Simple approx: today - i * 30 days usually works for 'recent' logic, 
                # but exact months are better. 
                
                # Using relativedelta is best but standard lib fix:
                # Construct date:
                d = today
                total_months = d.month - 1 - i
                
                # math to handle year rollback
                y = d.year + (total_months // 12)
                m = (total_months % 12) + 1
                
                month_str = f"{y}-{m:02d}"
                # Display name: "Jan", "Feb"
                month_obj = datetime(y, m, 1)
                month_name = month_obj.strftime("%b")
                
                activity_trend.append({
                    "date": month_str,
                    "name": month_name, 
                    "count": trend_data_map.get(month_str, 0)
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
                "by_category": department_stats, 
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
