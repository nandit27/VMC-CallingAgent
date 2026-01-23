"""
Test script to verify the hybrid architecture setup
Run this after starting both Node.js and Python servers
"""

import requests
import json
from datetime import datetime

# Configuration
NODE_API = "http://localhost:3000"
PYTHON_API = "http://localhost:8000"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def test_health_checks():
    """Test health endpoints for both servers"""
    print_section("HEALTH CHECKS")
    
    # Test Python API
    try:
        response = requests.get(f"{PYTHON_API}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Python API: {data['status']} (DB: {data['database']})")
        else:
            print(f"❌ Python API: Status code {response.status_code}")
    except Exception as e:
        print(f"❌ Python API: {str(e)}")
    
    # Test Node.js API
    try:
        response = requests.get(f"{NODE_API}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Node.js API: {data['status']}")
        else:
            print(f"❌ Node.js API: Status code {response.status_code}")
    except Exception as e:
        print(f"❌ Node.js API: {str(e)}")

def test_translation():
    """Test translation endpoint"""
    print_section("TRANSLATION TEST")
    
    payload = {
        "text": "Hello, this is a test complaint",
        "source_language": "en",
        "target_language": "en"
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API}/api/process/translate",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Translation successful")
            print(f"   Original: {data['original_text']}")
            print(f"   Translated: {data['translated_text']}")
            print(f"   Method: {data['method']}")
        else:
            print(f"❌ Translation failed: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Translation error: {str(e)}")

def test_classification():
    """Test complaint classification"""
    print_section("CLASSIFICATION TEST")
    
    payload = {
        "text": "Water supply is not working in my area since morning",
        "language": "en"
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API}/api/process/classify",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Classification successful")
            print(f"   Category: {data['category']['name']} ({data['category']['code']})")
            print(f"   Confidence: {data['confidence']:.2%}")
            print(f"   Urgency: {data['category']['urgency']}")
            print(f"   Method: {data['method']}")
        else:
            print(f"❌ Classification failed: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Classification error: {str(e)}")

def test_location_resolution():
    """Test location resolution"""
    print_section("LOCATION RESOLUTION TEST")
    
    payload = {
        "text": "There is garbage problem in Shivaji Nagar area near main road"
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API}/api/process/resolve-location",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Location resolution successful")
            print(f"   Found: {data['found']}")
            if data['found']:
                print(f"   Location: {data['location']}")
                print(f"   Ward: {data['wardNumber']} - {data['wardName']}")
                print(f"   Zone: {data['zone']}")
                print(f"   Confidence: {data['confidence']:.2%}")
            else:
                print(f"   No location found")
        else:
            print(f"❌ Location resolution failed: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Location error: {str(e)}")

def test_full_pipeline():
    """Test complete complaint processing pipeline"""
    print_section("FULL PIPELINE TEST")
    
    payload = {
        "text": "Water supply problem in Shivaji Nagar since yesterday morning",
        "language": "en",
        "phone_number": "+919876543210",
        "call_sid": f"TEST-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    }
    
    try:
        print(f"Testing complaint: {payload['text']}")
        print(f"Call SID: {payload['call_sid']}")
        
        response = requests.post(
            f"{PYTHON_API}/api/process/complaint",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Full pipeline successful!")
            
            # Translation
            if data.get('translation'):
                print(f"\n📝 Translation:")
                print(f"   Used: {data['translation']['translation_used']}")
                print(f"   Method: {data['translation']['method']}")
            
            # Classification
            if data.get('classification'):
                cls = data['classification']
                print(f"\n🏷️  Classification:")
                print(f"   Category: {cls['category']['name']}")
                print(f"   Confidence: {cls['confidence']:.2%}")
            
            # Location
            if data.get('location'):
                loc = data['location']
                print(f"\n📍 Location:")
                print(f"   Found: {loc['found']}")
                if loc['found']:
                    print(f"   Area: {loc.get('location', 'N/A')}")
                    print(f"   Ward: {loc.get('wardNumber', 'N/A')}")
                    print(f"   Zone: {loc.get('zone', 'N/A')}")
            
            # Urgency
            if data.get('urgency'):
                urg = data['urgency']
                print(f"\n⚡ Urgency:")
                print(f"   Level: {urg['urgency_level']}")
                print(f"   Score: {urg['urgency_score']:.2%}")
                print(f"   Method: {urg['method']}")
            
            # Duplicate
            if data.get('duplicate'):
                dup = data['duplicate']
                print(f"\n🔄 Duplicate Check:")
                print(f"   Is Duplicate: {dup['is_duplicate']}")
                print(f"   Method: {dup['method']}")
            
            print(f"\n📄 Complete Response:")
            print(json.dumps(data, indent=2))
            
        else:
            print(f"❌ Full pipeline failed: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Pipeline error: {str(e)}")

def test_duplicate_detection():
    """Test duplicate detection endpoint"""
    print_section("DUPLICATE DETECTION TEST (Placeholder)")
    
    payload = {
        "text": "Water supply issue",
        "category": "WATER_SUPPLY",
        "ward_number": 1
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API}/api/process/detect-duplicate",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Duplicate detection called (placeholder)")
            print(f"   Is Duplicate: {data['is_duplicate']}")
            print(f"   Method: {data['method']}")
            print(f"   Note: This is a placeholder - teammate will implement")
        else:
            print(f"❌ Duplicate detection failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Duplicate detection error: {str(e)}")

def test_urgency_classification():
    """Test urgency classification endpoint"""
    print_section("URGENCY CLASSIFICATION TEST (Placeholder)")
    
    payload = {
        "text": "Emergency water supply problem",
        "category": "WATER_SUPPLY",
        "category_base_urgency": "high"
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API}/api/process/classify-urgency",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Urgency classification called (placeholder)")
            print(f"   Level: {data['urgency_level']}")
            print(f"   Score: {data['urgency_score']:.2%}")
            print(f"   Method: {data['method']}")
            print(f"   Note: This is a placeholder - teammate will implement")
        else:
            print(f"❌ Urgency classification failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Urgency classification error: {str(e)}")

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  VMC CALLING AGENT - HYBRID ARCHITECTURE TEST SUITE")
    print("="*70)
    print(f"\nTesting at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Node.js API: {NODE_API}")
    print(f"Python API: {PYTHON_API}")
    
    # Run tests
    test_health_checks()
    test_translation()
    test_classification()
    test_location_resolution()
    test_duplicate_detection()
    test_urgency_classification()
    test_full_pipeline()
    
    # Summary
    print_section("TEST SUMMARY")
    print("✅ If all tests passed, your hybrid architecture is working!")
    print("⏳ Placeholder services (duplicate, urgency) need implementation")
    print("\nNext steps:")
    print("1. Ensure both servers are running")
    print("2. Test with actual Twilio phone call")
    print("3. Check MongoDB for saved complaints")
    print("4. Implement placeholder services")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()
