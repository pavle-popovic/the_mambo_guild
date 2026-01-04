"""
Quick test script to verify webhook endpoint is accessible.
Run this to test your webhook endpoint locally.
"""
import requests
import json

def test_webhook_endpoint():
    """Test the Mux webhook endpoint with a sample payload."""
    webhook_url = "http://localhost:8000/api/mux/webhook"
    
    # Sample webhook payload (what Mux would send)
    test_payload = {
        "type": "video.asset.ready",
        "data": {
            "id": "test-asset-id-12345",
            "playback_ids": [
                {
                    "id": "test-playback-id-12345",
                    "policy": "public"
                }
            ],
            "passthrough": json.dumps({"lesson_id": "test-lesson-id"})
        }
    }
    
    print("Testing webhook endpoint...")
    print(f"URL: {webhook_url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    print("-" * 60)
    
    try:
        response = requests.post(
            webhook_url,
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS: Webhook endpoint is working!")
            return True
        else:
            print(f"\n❌ FAILED: Unexpected status code {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend!")
        print("   Make sure your backend is running:")
        print("   - Docker: docker-compose up -d backend")
        print("   - Manual: uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_webhook_endpoint()

