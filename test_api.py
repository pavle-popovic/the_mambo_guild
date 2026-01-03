"""Quick test script for API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing API endpoints...\n")

# Test courses endpoint
print("1. Testing GET /api/courses/worlds")
try:
    r = requests.get(f"{BASE_URL}/api/courses/worlds")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"   Courses found: {len(data)}")
        for course in data:
            print(f"   - {course['title']} (Difficulty: {course['difficulty']}, Locked: {course['is_locked']})")
    else:
        print(f"   Error: {r.text[:200]}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n2. Testing POST /api/auth/token")
try:
    r = requests.post(
        f"{BASE_URL}/api/auth/token",
        json={"email": "admin@themamboinn.com", "password": "admin123"}
    )
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"   Login successful! Token: {data.get('access_token', '')[:20]}...")
    else:
        print(f"   Error: {r.text[:500]}")
except Exception as e:
    print(f"   Exception: {e}")

