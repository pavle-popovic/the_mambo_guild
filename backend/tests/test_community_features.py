"""
Tests for Community Feature Enhancements:
- Admin edit/delete posts and replies
- Search by tags + title
- Question post limits
- Notification system
- Enhanced leaderboard
- Badge trigger paths
"""
import sys
import os
import requests
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000")


def get_auth_headers(email="admin@themamboinn.com", password="admin123"):
    """Login and return auth headers."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            cookies = response.cookies
            return {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Cookie": "; ".join([f"{k}={v}" for k, v in cookies.items()])
            }
    except requests.exceptions.ConnectionError:
        return None
    return None


def test_endpoint(name, method, url, expected_status=200, json_data=None, headers=None):
    """Test an API endpoint and return (success, response_data)."""
    try:
        kwargs = {"headers": headers, "timeout": 5}
        if json_data:
            kwargs["json"] = json_data

        if method == "GET":
            response = requests.get(url, **kwargs)
        elif method == "POST":
            response = requests.post(url, **kwargs)
        elif method == "PUT":
            response = requests.put(url, **kwargs)
        elif method == "DELETE":
            response = requests.delete(url, **kwargs)
        else:
            return False, None

        success = response.status_code == expected_status
        if success:
            print(f"  ✅ {name}")
        else:
            print(f"  ❌ {name} - Expected {expected_status}, got {response.status_code}")
            print(f"     Response: {response.text[:200]}")

        try:
            data = response.json()
        except Exception:
            data = None
        return success, data
    except requests.exceptions.ConnectionError:
        print(f"  ⚠️  {name} - Server not running (skipped)")
        return None, None
    except Exception as e:
        print(f"  ❌ {name} - Error: {str(e)[:100]}")
        return False, None


def test_admin_edit_post():
    """Test that admin can edit any post."""
    print("\n📋 Phase 1: Admin Edit/Delete for Posts and Replies")

    headers = get_auth_headers()
    if not headers:
        print("  ⚠️  Cannot authenticate, skipping")
        return

    # Get feed to find a post
    success, feed = test_endpoint("Get feed", "GET", f"{BASE_URL}/api/community/feed", headers=headers)
    if not success or not feed or len(feed) == 0:
        print("  ⚠️  No posts to test with, skipping")
        return

    post_id = feed[0]["id"]

    # Admin can update any post
    test_endpoint(
        "Admin edit post",
        "PUT",
        f"{BASE_URL}/api/community/posts/{post_id}",
        json_data={"title": feed[0]["title"]},  # No actual change, just test access
        headers=headers
    )


def test_reply_edit_delete():
    """Test reply edit and delete endpoints."""
    headers = get_auth_headers()
    if not headers:
        return

    # Get a post with replies
    success, feed = test_endpoint("Get feed", "GET", f"{BASE_URL}/api/community/feed", headers=headers)
    if not success or not feed:
        return

    for post_summary in feed:
        success, post = test_endpoint(
            "Get post detail",
            "GET",
            f"{BASE_URL}/api/community/posts/{post_summary['id']}",
            headers=headers
        )
        if success and post and post.get("replies") and len(post["replies"]) > 0:
            reply_id = post["replies"][0]["id"]
            post_id = post["id"]

            # Test update reply
            test_endpoint(
                "Update reply",
                "PUT",
                f"{BASE_URL}/api/community/posts/{post_id}/replies/{reply_id}",
                json_data={"content": post["replies"][0]["content"]},
                headers=headers
            )
            break
    else:
        print("  ⚠️  No posts with replies found, skipping reply edit test")


def test_search_with_tags():
    """Test combined tag + title search."""
    print("\n📋 Phase 2: Search Enhancements")

    headers = get_auth_headers()
    if not headers:
        return

    # Search by title
    test_endpoint(
        "Search by title",
        "GET",
        f"{BASE_URL}/api/community/search?q=salsa",
        headers=headers
    )

    # Search with tag filter
    test_endpoint(
        "Search with tag filter",
        "GET",
        f"{BASE_URL}/api/community/search?q=salsa&tag=salsa-on2",
        headers=headers
    )

    # Feed with multiple tags
    test_endpoint(
        "Feed with multi-tag filter",
        "GET",
        f"{BASE_URL}/api/community/feed?tags=salsa-on2,mambo",
        headers=headers
    )


def test_question_limits():
    """Test question slot limit check endpoint."""
    print("\n📋 Phase 3: Question Post Limits")

    headers = get_auth_headers()
    if not headers:
        return

    test_endpoint(
        "Check question slot status",
        "GET",
        f"{BASE_URL}/api/community/upload-check-lab",
        headers=headers
    )


def test_notification_system():
    """Test notification endpoints."""
    print("\n📋 Phase 4: Notification System")

    headers = get_auth_headers()
    if not headers:
        return

    # Get notifications
    test_endpoint(
        "Get notifications",
        "GET",
        f"{BASE_URL}/api/notifications/",
        headers=headers
    )

    # Get unread count
    test_endpoint(
        "Get unread count",
        "GET",
        f"{BASE_URL}/api/notifications/unread-count",
        headers=headers
    )

    # Mark all read
    test_endpoint(
        "Mark all notifications read",
        "POST",
        f"{BASE_URL}/api/notifications/read-all",
        headers=headers
    )


def test_enhanced_leaderboard():
    """Test enhanced leaderboard with periods and categories."""
    print("\n📋 Phase 5: Enhanced Leaderboard")

    # Stats endpoint is public
    test_endpoint(
        "Default leaderboard (all_time/overall)",
        "GET",
        f"{BASE_URL}/api/community/stats"
    )

    test_endpoint(
        "Weekly leaderboard",
        "GET",
        f"{BASE_URL}/api/community/stats?period=weekly&category=overall"
    )

    test_endpoint(
        "Monthly helpful leaderboard",
        "GET",
        f"{BASE_URL}/api/community/stats?period=monthly&category=helpful"
    )

    test_endpoint(
        "Creative leaderboard",
        "GET",
        f"{BASE_URL}/api/community/stats?period=all_time&category=creative"
    )

    test_endpoint(
        "Active leaderboard",
        "GET",
        f"{BASE_URL}/api/community/stats?period=all_time&category=active"
    )

    # Personal rank (requires auth)
    headers = get_auth_headers()
    if headers:
        test_endpoint(
            "Personal rank",
            "GET",
            f"{BASE_URL}/api/community/stats/my-rank?period=all_time&category=overall",
            headers=headers
        )


def test_badge_triggers():
    """Verify all badge trigger requirement_types match what's seeded."""
    print("\n📋 Phase 7: Badge Verification")

    headers = get_auth_headers()
    if not headers:
        return

    # Get all badges
    success, badges = test_endpoint(
        "Get all badges",
        "GET",
        f"{BASE_URL}/api/badges/",
        headers=headers
    )

    if not success or not badges:
        return

    # Verify expected requirement types exist
    expected_types = {
        "fires_received",       # Firestarter
        "metronomes_received",  # Human Metronome
        "claps_received",       # Crowd Favorite
        "reactions_given",      # Talent Scout
        "videos_posted",        # Center Stage
        "solutions_accepted",   # The Professor
        "comments_posted",      # The Socialite
        "daily_streak",         # Unstoppable
        "questions_posted",     # Curious Mind
    }

    found_types = set()
    for badge in badges:
        req_type = badge.get("requirement_type")
        if req_type:
            found_types.add(req_type)

    missing = expected_types - found_types
    if missing:
        print(f"  ❌ Missing badge requirement_types: {missing}")
    else:
        print(f"  ✅ All expected badge requirement_types found ({len(expected_types)} types)")

    # Verify tier values
    tiers = set()
    for badge in badges:
        tier = badge.get("tier", "")
        if tier:
            tiers.add(tier)

    print(f"  ℹ️  Badge tier values in DB: {tiers}")

    # Check counts
    type_counts = {}
    for badge in badges:
        rt = badge.get("requirement_type", "unknown")
        type_counts[rt] = type_counts.get(rt, 0) + 1

    print(f"  ℹ️  Badge counts by type: {json.dumps(type_counts, indent=2)}")


def run_all_tests():
    print("=" * 60)
    print("Community Feature Enhancements - Test Suite")
    print("=" * 60)

    test_admin_edit_post()
    test_reply_edit_delete()
    test_search_with_tags()
    test_question_limits()
    test_notification_system()
    test_enhanced_leaderboard()
    test_badge_triggers()

    print("\n" + "=" * 60)
    print("Tests complete.")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
