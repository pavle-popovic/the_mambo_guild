"""
Full Stack Integration Test
Tests both backend and frontend integration
"""
import requests
import json
import time
import subprocess
import sys
from typing import Optional

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

class FullStackTester:
    def __init__(self):
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.test_email = f"test_{int(time.time())}@example.com"
        self.test_password = "testpass123"
        self.results = []
        
    def print_test(self, name: str, status: str, details: str = ""):
        """Print test result."""
        status_symbol = "[OK]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[SKIP]"
        print(f"{status_symbol} {name}")
        if details:
            print(f"    {details}")
        self.results.append((name, status, details))
    
    def test_backend_health(self):
        """Test backend health endpoint."""
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=5)
            if response.status_code == 200:
                self.print_test("Backend Health Check", "PASS")
                return True
            else:
                self.print_test("Backend Health Check", "FAIL", f"Status: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.print_test("Backend Health Check", "FAIL", "Backend server not running on port 8000")
            return False
        except Exception as e:
            self.print_test("Backend Health Check", "FAIL", str(e))
            return False
    
    def test_backend_api_root(self):
        """Test backend API root."""
        try:
            response = requests.get(f"{BACKEND_URL}/", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.print_test("Backend API Root", "PASS", f"Message: {data.get('message')}")
                return True
            else:
                self.print_test("Backend API Root", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Backend API Root", "FAIL", str(e))
            return False
    
    def test_backend_cors(self):
        """Test CORS configuration."""
        try:
            response = requests.options(
                f"{BACKEND_URL}/api/courses/worlds",
                headers={
                    "Origin": FRONTEND_URL,
                    "Access-Control-Request-Method": "GET"
                },
                timeout=5
            )
            if response.status_code in [200, 204]:
                self.print_test("Backend CORS Configuration", "PASS")
                return True
            else:
                self.print_test("Backend CORS Configuration", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Backend CORS Configuration", "FAIL", str(e))
            return False
    
    def test_public_courses_endpoint(self):
        """Test public courses endpoint (no auth required)."""
        try:
            response = requests.get(f"{BACKEND_URL}/api/courses/worlds", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.print_test("Public Courses Endpoint", "PASS", f"Found {len(data)} worlds")
                return True
            else:
                self.print_test("Public Courses Endpoint", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Public Courses Endpoint", "FAIL", str(e))
            return False
    
    def test_user_registration(self):
        """Test user registration."""
        try:
            data = {
                "email": self.test_email,
                "password": self.test_password,
                "first_name": "Test",
                "last_name": "User",
                "current_level_tag": "Beginner"
            }
            response = requests.post(
                f"{BACKEND_URL}/api/auth/register",
                json=data,
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("access_token")
                self.print_test("User Registration", "PASS", f"Token received")
                return True
            else:
                self.print_test("User Registration", "FAIL", f"Status: {response.status_code}, {response.text}")
                return False
        except Exception as e:
            self.print_test("User Registration", "FAIL", str(e))
            return False
    
    def test_user_login(self):
        """Test user login."""
        try:
            data = {
                "email": self.test_email,
                "password": self.test_password
            }
            response = requests.post(
                f"{BACKEND_URL}/api/auth/token",
                json=data,
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("access_token")
                self.print_test("User Login", "PASS", "Token received")
                return True
            else:
                self.print_test("User Login", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("User Login", "FAIL", str(e))
            return False
    
    def test_authenticated_courses(self):
        """Test authenticated courses endpoint."""
        if not self.token:
            self.print_test("Authenticated Courses", "SKIP", "No token available")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(
                f"{BACKEND_URL}/api/courses/worlds",
                headers=headers,
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.print_test("Authenticated Courses", "PASS", f"Found {len(data)} worlds")
                return True
            else:
                self.print_test("Authenticated Courses", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Authenticated Courses", "FAIL", str(e))
            return False
    
    def test_user_profile(self):
        """Test user profile endpoint."""
        if not self.token:
            self.print_test("User Profile", "SKIP", "No token available")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(
                f"{BACKEND_URL}/api/auth/me",
                headers=headers,
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.user_id = data.get("id")
                self.print_test("User Profile", "PASS", f"User: {data.get('first_name')} {data.get('last_name')}")
                return True
            else:
                self.print_test("User Profile", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("User Profile", "FAIL", str(e))
            return False
    
    def test_frontend_accessible(self):
        """Test if frontend is accessible."""
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            if response.status_code == 200:
                self.print_test("Frontend Accessibility", "PASS")
                return True
            else:
                self.print_test("Frontend Accessibility", "FAIL", f"Status: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.print_test("Frontend Accessibility", "FAIL", "Frontend server not running on port 3000")
            return False
        except Exception as e:
            self.print_test("Frontend Accessibility", "FAIL", str(e))
            return False
    
    def test_database_connection(self):
        """Test database connection via backend."""
        try:
            # Try to access an endpoint that requires DB
            response = requests.get(f"{BACKEND_URL}/api/courses/worlds", timeout=5)
            if response.status_code in [200, 500]:
                # 200 = DB working, 500 might be DB issue but endpoint exists
                if response.status_code == 200:
                    self.print_test("Database Connection", "PASS")
                    return True
                else:
                    self.print_test("Database Connection", "FAIL", "Database error in response")
                    return False
            else:
                self.print_test("Database Connection", "FAIL", f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Database Connection", "FAIL", str(e))
            return False
    
    def run_all_tests(self):
        """Run all tests."""
        print("=" * 60)
        print("FULL STACK INTEGRATION TEST")
        print("=" * 60)
        print()
        
        print("Backend Tests:")
        print("-" * 60)
        self.test_backend_health()
        self.test_backend_api_root()
        self.test_backend_cors()
        self.test_database_connection()
        self.test_public_courses_endpoint()
        
        print()
        print("Authentication Tests:")
        print("-" * 60)
        self.test_user_registration()
        if self.token:
            self.test_user_login()
            self.test_user_profile()
            self.test_authenticated_courses()
        
        print()
        print("Frontend Tests:")
        print("-" * 60)
        self.test_frontend_accessible()
        
        print()
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for _, status, _ in self.results if status == "PASS")
        failed = sum(1 for _, status, _ in self.results if status == "FAIL")
        skipped = sum(1 for _, status, _ in self.results if status == "SKIP")
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Skipped: {skipped}")
        print()
        
        if failed == 0:
            print("[SUCCESS] All tests passed!")
            return 0
        else:
            print(f"[WARNING] {failed} test(s) failed")
            print("\nTo run the full stack:")
            print("1. Start database: docker-compose up -d")
            print("2. Start backend: cd backend && uvicorn main:app --reload")
            print("3. Start frontend: cd frontend && npm run dev")
            return 1

if __name__ == "__main__":
    tester = FullStackTester()
    sys.exit(tester.run_all_tests())

