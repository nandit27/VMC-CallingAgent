
import requests
import json
import sys

# API URL (assuming default port 8000)
API_URL = "http://localhost:8000/api/dashboard?period=weekly"

try:
    print(f"Fetching dashboard data from {API_URL}...")
    response = requests.get(API_URL)
    
    if response.status_code == 200:
        data = response.json()
        stats = data.get("stats", {})
        by_zone = stats.get("by_zone", {})
        
        print("\n--- Zone Stats ---")
        print(json.dumps(by_zone, indent=2))
        
        total_zone_count = sum(by_zone.values())
        print(f"\nTotal Zone Count: {total_zone_count}")
        
        if total_zone_count > 0:
            print("✅ Zone data found!")
            sys.exit(0)
        else:
            print("❌ Zone data is still empty (all zeros).")
            sys.exit(1)
            
    else:
        print(f"❌ API Error: {response.status_code}")
        print(response.text)
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Script Error: {str(e)}")
    sys.exit(1)
