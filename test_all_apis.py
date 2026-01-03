"""
Comprehensive API Test Suite
Tests all API endpoints with proper authentication and data flow
"""
import requests
import json
import time
from typing import Optional

BASE_URL = "http://localhost:8000"

class APITester:
    def __init__(self):
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.test_email = f"test_{int(time.time())}@example.com"
        self.test_password = "testpass123"
        self.world_id: Optional[str] = None
        self.lesson_id: Optional[str] = None
        
    def print_test(self, name: str, status: str, details: str = ""):
        """Print test result."""
        status_symbol = "[OK]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[SKIP]"
        print(f"{status_symbol} {name}")
        if details:
            print(f"    {details}")
    
    def test_health(self):
        """Test health endpoint."""
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                self.print_test("Health Check", "PASS")
                return True
            else:
                self.print_test("Health Check", "FAIL", f"Status: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.print_test("Health Check", "SKIP", "Server not running")
            return None
        except Exception as e:
            self.print_test("Health Check", "FAIL", str(e))
            return False
    
    def test_register(self):
        """Test user registration."""
        try:
            data = {
                "email": self.test_email,
                "password": self.test_password,
                "first_name": "Test",
                "last_name": "User",
                "current_level_tag": "Beginner"
            }
            response = requests.post(f"{BASE_URL}/api/auth/register", json=data, timeout=5)
            if response.status_code == 200:
                token_data = response.json()
                self.token = token_data.get("access_token")
                self.print_test("User Registration", "PASS", f"Token received")
                return True
            else:
                self.print_test("User Registration", "FAIL", 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("User Registration", "FAIL", str(e))
            return False
    
    def test_login(self):
        """Test user login."""
        try:
            data = {
                "email": self.test_email,
                "password": self.test_password
            }
            response = requests.post(f"{BASE_URL}/api/auth/token", json=data, timeout=5)
            if response.status_code == 200:
                token_data = response.json()
                self.token = token_data.get("access_token")
                self.print_test("User Login", "PASS", "Token received")
                return True
            else:
                self.print_test("User Login", "FAIL", 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("User Login", "FAIL", str(e))
            return False
    
    def test_get_profile(self):
        """Test getting user profile."""
        if not self.token:
            self.print_test("Get Profile", "SKIP", "No token available")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
            if response.status_code == 200:
                profile = response.json()
                self.user_id = profile.get("id")
                self.print_test("Get Profile", "PASS", 
                              f"User: {profile.get('first_name')} {profile.get('last_name')}, "
                              f"XP: {profile.get('xp')}, Level: {profile.get('level')}")
                return True
            else:
                self.print_test("Get Profile", "FAIL", 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Get Profile", "FAIL", str(e))
            return False
    
    def test_get_worlds(self):
        """Test getting worlds list."""
        if not self.token:
            self.print_test("Get Worlds", "SKIP", "No token available")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{BASE_URL}/api/courses/worlds", headers=headers, timeout=5)
            if response.status_code == 200:
                worlds = response.json()
                self.print_test("Get Worlds", "PASS", f"Found {len(worlds)} worlds")
                if worlds:
                    self.world_id = worlds[0].get("id")
                    self.print_test("  - First World", "INFO", 
                                  f"Title: {worlds[0].get('title')}, "
                                  f"Locked: {worlds[0].get('is_locked')}")
                return True
            else:
                self.print_test("Get Worlds", "FAIL", 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Get Worlds", "FAIL", str(e))
            return False
    
    def test_get_world_lessons(self):
        """Test getting lessons for a world."""
        if not self.token or not self.world_id:
            self.print_test("Get World Lessons", "SKIP", "No token or world_id")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(
                f"{BASE_URL}/api/courses/worlds/{self.world_id}/lessons",
                headers=headers,
                timeout=5
            )
            if response.status_code == 200:
                lessons = response.json()
                self.print_test("Get World Lessons", "PASS", f"Found {len(lessons)} lessons")
                if lessons:
                    self.lesson_id = lessons[0].get("id")
                    self.print_test("  - First Lesson", "INFO",
                                  f"Title: {lessons[0].get('title')}, "
                                  f"Locked: {lessons[0].get('is_locked')}, "
                                  f"Completed: {lessons[0].get('is_completed')}")
                return True
            elif response.status_code == 404:
                self.print_test("Get World Lessons", "SKIP", "No lessons found (expected if no data)")
                return None
            else:
                self.print_test("Get World Lessons", "FAIL",
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Get World Lessons", "FAIL", str(e))
            return False
    
    def test_complete_lesson(self):
        """Test completing a lesson."""
        if not self.token or not self.lesson_id:
            self.print_test("Complete Lesson", "SKIP", "No token or lesson_id")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(
                f"{BASE_URL}/api/progress/lessons/{self.lesson_id}/complete",
                headers=headers,
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                self.print_test("Complete Lesson", "PASS",
                              f"XP Gained: {result.get('xp_gained')}, "
                              f"New Total: {result.get('new_total_xp')}, "
                              f"Leveled Up: {result.get('leveled_up')}")
                return True
            elif response.status_code == 403:
                self.print_test("Complete Lesson", "SKIP", 
                              "Lesson locked (expected if prerequisites not met)")
                return None
            elif response.status_code == 404:
                self.print_test("Complete Lesson", "SKIP", "Lesson not found")
                return None
            else:
                self.print_test("Complete Lesson", "FAIL",
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Complete Lesson", "FAIL", str(e))
            return False
    
    def test_submit_boss_battle(self):
        """Test submitting a boss battle."""
        if not self.token or not self.lesson_id:
            self.print_test("Submit Boss Battle", "SKIP", "No token or lesson_id")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            data = {
                "lesson_id": self.lesson_id,
                "video_url": "https://example.com/video.mp4"
            }
            response = requests.post(
                f"{BASE_URL}/api/submissions/submit",
                headers=headers,
                json=data,
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                self.print_test("Submit Boss Battle", "PASS",
                              f"Submission ID: {result.get('id')}, Status: {result.get('status')}")
                return True
            elif response.status_code == 400:
                self.print_test("Submit Boss Battle", "SKIP",
                              "Not a boss battle or already submitted")
                return None
            else:
                self.print_test("Submit Boss Battle", "FAIL",
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Submit Boss Battle", "FAIL", str(e))
            return False
    
    def test_get_my_submissions(self):
        """Test getting user's submissions."""
        if not self.token:
            self.print_test("Get My Submissions", "SKIP", "No token")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(
                f"{BASE_URL}/api/submissions/my-submissions",
                headers=headers,
                timeout=5
            )
            if response.status_code == 200:
                submissions = response.json()
                self.print_test("Get My Submissions", "PASS", 
                              f"Found {len(submissions)} submissions")
                return True
            else:
                self.print_test("Get My Submissions", "FAIL",
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Get My Submissions", "FAIL", str(e))
            return False
    
    def run_all_tests(self):
        """Run all API tests."""
        print("=" * 60)
        print("COMPREHENSIVE API TEST SUITE")
        print("=" * 60)
        print(f"\nTest User: {self.test_email}")
        print(f"Base URL: {BASE_URL}\n")
        
        results = []
        
        # Basic endpoints
        results.append(("Health Check", self.test_health()))
        if results[-1][1] is None:
            print("\n[ERROR] Server is not running!")
            print("Please start the server with: uvicorn main:app --reload")
            return
        
        # Auth endpoints
        print("\n--- AUTHENTICATION ENDPOINTS ---")
        results.append(("User Registration", self.test_register()))
        if not results[-1][1]:
            # Try login if registration failed (user might already exist)
            results.append(("User Login", self.test_login()))
        results.append(("Get Profile", self.test_get_profile()))
        
        # Course endpoints
        print("\n--- COURSE ENDPOINTS ---")
        results.append(("Get Worlds", self.test_get_worlds()))
        results.append(("Get World Lessons", self.test_get_world_lessons()))
        
        # Progress endpoints
        print("\n--- PROGRESS ENDPOINTS ---")
        results.append(("Complete Lesson", self.test_complete_lesson()))
        
        # Submission endpoints
        print("\n--- SUBMISSION ENDPOINTS ---")
        results.append(("Submit Boss Battle", self.test_submit_boss_battle()))
        results.append(("Get My Submissions", self.test_get_my_submissions()))
        
        # Summary
        print("\n" + "=" * 60)
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
        
        print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped out of {total} tests")
        
        if failed == 0:
            print("\n[SUCCESS] All critical tests passed!")
        else:
            print(f"\n[WARNING] {failed} test(s) failed. Check the details above.")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()

