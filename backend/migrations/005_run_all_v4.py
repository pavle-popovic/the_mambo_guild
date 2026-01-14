"""
Master Migration Runner for Mambo Inn v4.0
Runs all migrations in order for the new ecosystem features.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_all():
    """Run all v4.0 migrations in sequence."""
    print("=" * 60)
    print("🎺 MAMBO INN v4.0 - DATABASE MIGRATIONS")
    print("=" * 60)
    print()
    
    # Import and run each migration
    print("📦 Migration 001: Clave Economy Tables")
    print("-" * 40)
    from migrations.migration_001_create_clave_tables import run_migration as m1
    m1()
    print()
    
    print("📦 Migration 002: Community Posts Tables")
    print("-" * 40)
    from migrations.migration_002_create_posts_tables import run_migration as m2
    m2()
    print()
    
    print("📦 Migration 003: Badge System Tables")
    print("-" * 40)
    from migrations.migration_003_create_badges_tables import run_migration as m3
    m3()
    print()
    
    print("📦 Migration 004: Community Tags Table")
    print("-" * 40)
    from migrations.migration_004_create_tags_table import run_migration as m4
    m4()
    print()
    
    print("=" * 60)
    print("✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print()
    print("New tables created:")
    print("  • clave_transactions")
    print("  • posts")
    print("  • post_replies")
    print("  • post_reactions")
    print("  • badge_definitions")
    print("  • user_badges")
    print("  • community_tags")
    print()
    print("Modified tables:")
    print("  • user_profiles (added: current_claves, last_daily_claim)")
    print()


if __name__ == "__main__":
    run_all()
