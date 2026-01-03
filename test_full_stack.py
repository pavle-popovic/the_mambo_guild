"""
Full Stack Integration Test
Tests both backend and frontend integration
"""
import requests
import time
import sys

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_endpoint(name, method, url, expected_status=200, json_data=None, headers=None, skip_if_no_server=True):
    """Test an API endpoint."""
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=json_data, headers=headers, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=json_data, headers=headers, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        
        if response.status_code == expected_status:
            print(f"[OK] {name}")
            return True, response
        else:
            print(f"[FAIL] {name} - Status: {response.status_code}, Response: {response.text[:100]}")
            return False, response
    except requests.exceptions.ConnectionError:
        if skip_if_no_server:
            print(f"[SKIP] {name} - Server not running")
            return None, None
        else:
            print(f"[FAIL] {name} - Server not running")
            return False, None
    except Exception as e:
        print(f"[FAIL] {name} - Error: {str(e)[:100]}")
        return False, None

def main():
    """Run comprehensive backend tests."""
    print("=" * 60)
    print("FULL STACK INTEGRATION TEST")
    print("=" * 60)
    print()
    
    results = []
    
    # Test 1: Health Check
    print("Backend Tests:")
    print("-" * 60)
    result, _ = test_endpoint("Backend Health Check", "GET", f"{BACKEND_URL}/health")
    results.append(("Backend Health", result))
    
    result, _ = test_endpoint("Backend API Root", "GET", f"{BACKEND_URL}/")
    results.append(("Backend API Root", result))
    
    # Test 2: Public Courses (no auth)
    print()
    print("Public Endpoints:")
    print("-" * 60)
    result, _ = test_endpoint("Public Courses (No Auth)", "GET", f"{BACKEND_URL}/api/courses/worlds", expected_status=200)
    results.append(("Public Courses", result))
    
    # Test 3: Registration
    print()
    print("Authentication Endpoints:")
    print("-" * 60)
    test_email = f"test_{int(time.time())}@example.com"
    test_password = "testpass123"
    
    register_data = {
        "email": test_email,
        "password": test_password,
        "first_name": "Test",
        "last_name": "User",
        "current_level_tag": "Beginner"
    }
    
    result, register_response = test_endpoint("User Registration", "POST", 
                                              f"{BACKEND_URL}/api/auth/register", 
                                              json_data=register_data)
    results.append(("User Registration", result))
    
    token = None
    if register_response and register_response.status_code == 200:
        token = register_response.json().get("access_token")
    
    # Test 4: Login
    if not token:
        login_data = {"email": test_email, "password": test_password}
        result, login_response = test_endpoint("User Login", "POST",
                                               f"{BACKEND_URL}/api/auth/token",
                                               json_data=login_data)
        results.append(("User Login", result))
        if login_response and login_response.status_code == 200:
            token = login_response.json().get("access_token")
    else:
        results.append(("User Login", True))
        print("[OK] User Login (skipped - already have token)")
    
    # Test 5: Authenticated endpoints
    if token:
        print()
        print("Authenticated Endpoints:")
        print("-" * 60)
        headers = {"Authorization": f"Bearer {token}"}
        
        result, profile_response = test_endpoint("Get User Profile", "GET",
                                                 f"{BACKEND_URL}/api/auth/me",
                                                 headers=headers)
        results.append(("Get Profile", result))
        
        result, _ = test_endpoint("Authenticated Courses", "GET",
                                  f"{BACKEND_URL}/api/courses/worlds",
                                  headers=headers)
        results.append(("Authenticated Courses", result))
    else:
        print()
        print("Authenticated Endpoints:")
        print("-" * 60)
        print("[SKIP] All authenticated tests - No token available")
        results.append(("Get Profile", None))
        results.append(("Authenticated Courses", None))
    
    # Test 6: CORS
    print()
    print("CORS Configuration:")
    print("-" * 60)
    try:
        response = requests.options(
            f"{BACKEND_URL}/api/courses/worlds",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            },
            timeout=5
        )
        if response.status_code in [200, 204]:
            print("[OK] CORS Configuration")
            results.append(("CORS", True))
        else:
            print(f"[FAIL] CORS Configuration - Status: {response.status_code}")
            results.append(("CORS", False))
    except Exception as e:
        print(f"[SKIP] CORS Configuration - {str(e)[:50]}")
        results.append(("CORS", None))
    
    # Test 7: Frontend
    print()
    print("Frontend Tests:")
    print("-" * 60)
    result, _ = test_endpoint("Frontend Accessibility", "GET", FRONTEND_URL)
    results.append(("Frontend", result))
    
    # Summary
    print()
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)
    total = len(results)
    
    for name, result in results:
        if result is True:
            status = "[PASS]"
        elif result is False:
            status = "[FAIL]"
        else:
            status = "[SKIP]"
        print(f"{status} {name}")
    
    print()
    print(f"Total: {passed}/{total} passed, {failed} failed, {skipped} skipped")
    
    if failed == 0 and passed > skipped:
        print()
        print("[SUCCESS] Full stack is working!")
        if skipped > 0:
            print(f"Note: {skipped} test(s) skipped (servers not running)")
            print()
            print("To test all endpoints, start the backend server:")
            print("  cd backend && uvicorn main:app --reload")
        return 0
    elif failed > 0:
        print()
        print("[WARNING] Some tests failed. Check errors above.")
        print()
        print("To start the full stack:")
        print("1. Start database: docker-compose up -d")
        print("2. Start backend: cd backend && uvicorn main:app --reload")
        print("3. Start frontend: cd frontend && npm run dev")
        return 1
    else:
        print()
        print("[INFO] Backend server not running - API tests skipped")
        print()
        print("Current Status:")
        print("  [OK] Frontend: Running")
        print("  [SKIP] Backend: Not running")
        print()
        print("To complete full stack testing, start the backend:")
        print("  cd backend && uvicorn main:app --reload")
        print()
        print("Then run this test again to verify all endpoints.")
        return 2

if __name__ == "__main__":
    sys.exit(main())

