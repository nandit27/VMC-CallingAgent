
import sys
import os
import asyncio
from app.api.dashboard import get_dashboard_data

# Add current directory to path
sys.path.append(os.getcwd())

async def verify():
    print("Verifying Dashboard API for Urgency Stats...")
    try:
        data = await get_dashboard_data(period="weekly")
        stats = data.get("stats", {})
        
        priority_breakdown = stats.get("priority_breakdown")
        print(f"Priority Breakdown: {priority_breakdown}")
        
        if priority_breakdown:
            crit = priority_breakdown.get("critical", 0)
            high = priority_breakdown.get("high", 0)
            total_high_priority = stats.get("high_priority")
            
            print(f"Critical: {crit}, High: {high}")
            print(f"Total High Priority (Crit+High): {crit + high}")
            print(f"Stats High Priority Field: {total_high_priority}")
            
            if (crit + high) == total_high_priority:
                print("✅ High Priority Calculation Matches!")
            else:
                print("❌ High Priority Mismatch!")
        else:
            print("❌ 'priority_breakdown' missing in response")
            
    except Exception as e:
        print(f"❌ API Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify())
