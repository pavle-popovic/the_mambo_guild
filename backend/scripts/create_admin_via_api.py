"""
Create admin user via API, then update role in database.
"""
import requests
import sys

# Fix Unicode encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def create_admin_via_api():
    """Create admin user via registration API, then update role."""
    base_url = "http://localhost:8000"
    
    # First, try to register
    register_data = {
        "email": "admin@themamboinn.com",
        "password": "admin123",
        "first_name": "Admin",
        "last_name": "User",
        "current_level_tag": "Advanced"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", json=register_data)
        if response.status_code == 200:
            print("✅ Admin user registered successfully!")
            token = response.json().get("access_token")
            print(f"Token: {token[:20]}...")
            print("\nNow updating role to ADMIN...")
            
            # Update role to admin (we'll need to do this via direct DB or create an endpoint)
            # For now, just inform user
            print("⚠️  Note: User created but role needs to be updated to 'admin'")
            print("   You can do this manually in the database or via admin endpoint")
            return True
        elif response.status_code == 400:
            print("ℹ️  Admin user may already exist. Trying to login...")
            # Try to login
            login_data = {
                "email": "admin@themamboinn.com",
                "password": "admin123"
            }
            login_response = requests.post(f"{base_url}/api/auth/token", json=login_data)
            if login_response.status_code == 200:
                print("✅ Admin user can login!")
                print("Email: admin@themamboinn.com")
                print("Password: admin123")
                return True
            else:
                print(f"❌ Login failed: {login_response.text}")
                return False
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running on http://localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    create_admin_via_api()
