"""
API Endpoint Test Script
Tests the FastAPI endpoints using HTTP requests
Requires the server to be running: uvicorn main:app --reload
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint."""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("[OK] Health endpoint working")
        return True
    except requests.exceptions.ConnectionError:
        print("[SKIP] Server not running. Start with: uvicorn main:app --reload")
        return None
    except Exception as e:
        print(f"[ERROR] Health endpoint error: {e}")
        return False

def test_register_endpoint():
    """Test user registration."""
    print("\nTesting /api/auth/register endpoint...")
    try:
        data = {
            "email": "test@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
            "current_level_tag": "Beginner"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
        if response.status_code == 200:
            token_data = response.json()
            assert "access_token" in token_data
            print("[OK] Registration endpoint working")
            return token_data.get("access_token")
        elif response.status_code == 400:
            print("[INFO] User already exists (expected if test was run before)")
            return None
        else:
            print(f"[ERROR] Unexpected status: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("[SKIP] Server not running")
        return None
    except Exception as e:
        print(f"[ERROR] Registration error: {e}")
        return None

def test_login_endpoint():
    """Test user login."""
    print("\nTesting /api/auth/token endpoint...")
    try:
        data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/token", json=data)
        if response.status_code == 200:
            token_data = response.json()
            assert "access_token" in token_data
            print("[OK] Login endpoint working")
            return token_data.get("access_token")
        else:
            print(f"[ERROR] Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("[SKIP] Server not running")
        return None
    except Exception as e:
        print(f"[ERROR] Login error: {e}")
        return None

def test_protected_endpoint(token):
    """Test a protected endpoint."""
    print("\nTesting /api/auth/me endpoint (protected)...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            assert "id" in user_data
            assert "first_name" in user_data
            print("[OK] Protected endpoint working")
            print(f"  User: {user_data.get('first_name')} {user_data.get('last_name')}")
            return True
        else:
            print(f"[ERROR] Protected endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("[SKIP] Server not running")
        return None
    except Exception as e:
        print(f"[ERROR] Protected endpoint error: {e}")
        return False

def main():
    """Run API endpoint tests."""
    print("=" * 50)
    print("API ENDPOINT TEST SUITE")
    print("=" * 50)
    print("\nNote: Make sure the server is running:")
    print("  cd backend")
    print("  uvicorn main:app --reload")
    print()
    
    results = []
    
    # Test health
    health_ok = test_health_endpoint()
    if health_ok is None:
        print("\n[SKIP] All API tests skipped - server not running")
        return
    results.append(("Health Endpoint", health_ok))
    
    # Test registration
    token = test_register_endpoint()
    if token:
        results.append(("Registration", True))
    else:
        # Try login instead
        token = test_login_endpoint()
        results.append(("Registration/Login", token is not None))
    
    # Test protected endpoint
    if token:
        protected_ok = test_protected_endpoint(token)
        results.append(("Protected Endpoint", protected_ok if protected_ok is not None else False))
    
    print("\n" + "=" * 50)
    print("API TEST RESULTS")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")

if __name__ == "__main__":
    main()

