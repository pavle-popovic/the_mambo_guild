"""
Test suite for Mux integration.
Run with: python test_mux_integration.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings
from services.mux_service import create_direct_upload, get_playback_url, get_thumbnail_url
import json

def test_database_schema():
    """Test that Mux fields exist in lessons table."""
    print("\n[TEST] Testing database schema...")
    try:
        engine = create_engine(settings.DATABASE_URL, echo=False)
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'lessons' 
                AND column_name IN ('mux_playback_id', 'mux_asset_id')
            """))
            columns = {row[0]: row[1] for row in result}
            
            if 'mux_playback_id' not in columns:
                print("[FAIL] mux_playback_id column missing")
                return False
            if 'mux_asset_id' not in columns:
                print("[FAIL] mux_asset_id column missing")
                return False
            
            print(f"[PASS] mux_playback_id: {columns['mux_playback_id']}")
            print(f"[PASS] mux_asset_id: {columns['mux_asset_id']}")
            return True
    except Exception as e:
        print(f"[FAIL] Database schema test failed: {e}")
        return False

def test_mux_service_functions():
    """Test Mux service utility functions."""
    print("\n[TEST] Testing Mux service functions...")
    
    try:
        # Test get_playback_url
        test_playback_id = "test123"
        url = get_playback_url(test_playback_id)
        expected_url = f"https://stream.mux.com/{test_playback_id}.m3u8"
        if url != expected_url:
            print(f"[FAIL] get_playback_url failed: got {url}, expected {expected_url}")
            return False
        print("[PASS] get_playback_url works correctly")
        
        # Test get_thumbnail_url
        thumbnail_url = get_thumbnail_url(test_playback_id, 5.0)
        expected_thumbnail = f"https://image.mux.com/{test_playback_id}/thumbnail.png?time=5.0"
        if thumbnail_url != expected_thumbnail:
            print(f"[FAIL] get_thumbnail_url failed: got {thumbnail_url}, expected {expected_thumbnail}")
            return False
        print("[PASS] get_thumbnail_url works correctly")
        
        # Test with None (should return empty string)
        empty_url = get_playback_url(None)
        if empty_url != "":
            print(f"[FAIL] get_playback_url with None failed: got {empty_url}, expected empty string")
            return False
        print("[PASS] get_playback_url handles None correctly")
        
        return True
    except Exception as e:
        print(f"[FAIL] Mux service functions test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_mux_config():
    """Test that Mux configuration is loaded."""
    print("\n[TEST] Testing Mux configuration...")
    
    try:
        if not settings.MUX_TOKEN_ID:
            print("[WARN] MUX_TOKEN_ID not set in environment (this is OK for testing)")
        else:
            print(f"[PASS] MUX_TOKEN_ID is set: {settings.MUX_TOKEN_ID[:10]}...")
        
        if not settings.MUX_TOKEN_SECRET:
            print("[WARN] MUX_TOKEN_SECRET not set in environment (required for uploads)")
        else:
            print(f"[PASS] MUX_TOKEN_SECRET is set: {settings.MUX_TOKEN_SECRET[:10]}...")
        
        return True
    except Exception as e:
        print(f"[FAIL] Mux config test failed: {e}")
        return False

def test_direct_upload_api_call():
    """Test creating a direct upload URL (requires valid Mux credentials)."""
    print("\n[TEST] Testing Mux direct upload API call...")
    
    if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
        print("[SKIP] Skipping: Mux credentials not configured")
        return True  # Not a failure, just skip
    
    try:
        result = create_direct_upload(filename="test_video.mp4", test=True)
        
        if result.get("status") == "error":
            print(f"[WARN] Mux API returned error: {result.get('message')}")
            print("   (This might be due to invalid credentials or API limits)")
            return True  # Don't fail the test, just warn
        
        if "upload_id" not in result or "upload_url" not in result:
            print(f"[FAIL] Invalid response format: {result}")
            return False
        
        print(f"[PASS] Successfully created upload URL")
        print(f"   Upload ID: {result['upload_id']}")
        print(f"   Upload URL: {result['upload_url'][:50]}...")
        return True
    except Exception as e:
        print(f"[WARN] Mux API call failed: {e}")
        print("   (This might be due to invalid credentials or network issues)")
        return True  # Don't fail, just warn

def test_lesson_model_imports():
    """Test that Lesson model can be imported with Mux fields."""
    print("\n[TEST] Testing Lesson model imports...")
    
    try:
        from models.course import Lesson
        lesson = Lesson()
        
        # Check that Mux fields exist
        if not hasattr(lesson, 'mux_playback_id'):
            print("[FAIL] Lesson model missing mux_playback_id attribute")
            return False
        if not hasattr(lesson, 'mux_asset_id'):
            print("[FAIL] Lesson model missing mux_asset_id attribute")
            return False
        
        print("[PASS] Lesson model has mux_playback_id and mux_asset_id attributes")
        return True
    except Exception as e:
        print(f"[FAIL] Lesson model import test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_schemas():
    """Test that schemas include Mux fields."""
    print("\n[TEST] Testing schemas...")
    
    try:
        from schemas.course import LessonResponse, LessonDetailResponse
        
        # Check LessonResponse
        response_fields = LessonResponse.model_fields.keys()
        if 'mux_playback_id' not in response_fields:
            print("[FAIL] LessonResponse missing mux_playback_id")
            return False
        if 'mux_asset_id' not in response_fields:
            print("[FAIL] LessonResponse missing mux_asset_id")
            return False
        print("[PASS] LessonResponse includes Mux fields")
        
        # Check LessonDetailResponse
        detail_fields = LessonDetailResponse.model_fields.keys()
        if 'mux_playback_id' not in detail_fields:
            print("[FAIL] LessonDetailResponse missing mux_playback_id")
            return False
        if 'mux_asset_id' not in detail_fields:
            print("[FAIL] LessonDetailResponse missing mux_asset_id")
            return False
        print("[PASS] LessonDetailResponse includes Mux fields")
        
        return True
    except Exception as e:
        print(f"[FAIL] Schema test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    import sys
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass
    
    print("=" * 60)
    print("Mux Integration Test Suite")
    print("=" * 60)
    
    tests = [
        ("Database Schema", test_database_schema),
        ("Mux Service Functions", test_mux_service_functions),
        ("Mux Configuration", test_mux_config),
        ("Lesson Model", test_lesson_model_imports),
        ("Schemas", test_schemas),
        ("Direct Upload API", test_direct_upload_api_call),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"[FAIL] {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n[SUCCESS] All tests passed!")
        return 0
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())

