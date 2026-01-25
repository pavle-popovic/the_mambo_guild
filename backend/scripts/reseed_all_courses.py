
import sys
import os
import uuid
import logging
from sqlalchemy import create_engine, text

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from models.course import Difficulty

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_full_courses():
    engine = create_engine(settings.DATABASE_URL, echo=False)

    # -------------------------------------------------------------------------
    # DATA DEFINITIONS
    # -------------------------------------------------------------------------

    # 1. MAMBO 101
    mambo_101_nodes = [
        # WEEK 1
        {"id": "m101_basic_timing", "title": "Basic Timing", "week": 1, "x": 50, "y": 90, "type": "skill"},
        {"id": "m101_basic_steps_1", "title": "Basic Steps 1", "week": 1, "x": 50, "y": 85, "type": "skill"},
        {"id": "m101_turns_1", "title": "Turns 1", "week": 1, "x": 40, "y": 80, "type": "skill"},
        {"id": "m101_suzy_q_1", "title": "Suzy Q 1", "week": 1, "x": 60, "y": 80, "type": "skill_track"}, # skillTrack
        {"id": "m101_turns_2", "title": "Turns 2", "week": 1, "x": 40, "y": 75, "type": "skill"},
        {"id": "m101_combo_1", "title": "COMBO 1", "week": 1, "x": 50, "y": 70, "type": "combo"},

        # WEEK 2
        {"id": "m101_taps_1", "title": "Taps 1", "week": 2, "x": 30, "y": 60, "type": "skill_track"},
        {"id": "m101_son_step", "title": "Son Step", "week": 2, "x": 45, "y": 60, "type": "skill"},
        {"id": "m101_arm_styling_1", "title": "Arm Styling 1", "week": 2, "x": 55, "y": 60, "type": "skill"},
        {"id": "m101_braid", "title": "Braid", "week": 2, "x": 70, "y": 60, "type": "skill"},
        {"id": "m101_suzy_q_2", "title": "Suzy Q 2", "week": 2, "x": 85, "y": 60, "type": "skill_track"},
        {"id": "m101_combo_2", "title": "COMBO 2", "week": 2, "x": 50, "y": 50, "type": "combo"},

        # WEEK 3
        {"id": "m101_flares_1", "title": "Flares 1", "week": 3, "x": 30, "y": 40, "type": "skill"},
        {"id": "m101_twist_1", "title": "Twist 1", "week": 3, "x": 45, "y": 40, "type": "skill"},
        {"id": "m101_basic_2", "title": "Basic 2", "week": 3, "x": 55, "y": 40, "type": "skill"},
        {"id": "m101_suzy_q_3", "title": "Suzy Q 3", "week": 3, "x": 70, "y": 40, "type": "skill_track"},
        {"id": "m101_taps_2", "title": "Taps 2", "week": 3, "x": 85, "y": 40, "type": "skill_track"},
        {"id": "m101_combo_3", "title": "COMBO 3", "week": 3, "x": 50, "y": 30, "type": "combo"},

        # WEEK 4
        {"id": "m101_swing_1", "title": "Swing Step 1", "week": 4, "x": 40, "y": 20, "type": "skill"},
        {"id": "m101_synco_1", "title": "Syncopation 1", "week": 4, "x": 60, "y": 20, "type": "skill"},
        {"id": "m101_swing_2", "title": "Swing Step 2", "week": 4, "x": 40, "y": 15, "type": "skill"},
        {"id": "m101_synco_2", "title": "Syncopation 2", "week": 4, "x": 60, "y": 15, "type": "skill"},
        {"id": "m101_combo_4", "title": "COMBO 4: BOSS BATTLE", "week": 4, "x": 50, "y": 5, "type": "combo"},
    ]

    mambo_101_edges = [
        # W1
        ("m101_basic_timing", "m101_basic_steps_1"),
        ("m101_basic_steps_1", "m101_turns_1"),
        ("m101_basic_steps_1", "m101_suzy_q_1"),
        ("m101_turns_1", "m101_turns_2"),
        ("m101_turns_2", "m101_combo_1"),
        ("m101_suzy_q_1", "m101_combo_1"),

        # W2
        ("m101_combo_1", "m101_taps_1"),
        ("m101_combo_1", "m101_son_step"),
        ("m101_combo_1", "m101_arm_styling_1"),
        ("m101_combo_1", "m101_braid"),
        ("m101_suzy_q_1", "m101_suzy_q_2"), # Bypass combo
        ("m101_taps_1", "m101_combo_2"),
        ("m101_son_step", "m101_combo_2"),
        ("m101_arm_styling_1", "m101_combo_2"),
        ("m101_braid", "m101_combo_2"),
        ("m101_suzy_q_2", "m101_combo_2"),

        # W3
        ("m101_combo_2", "m101_flares_1"),
        ("m101_combo_2", "m101_twist_1"),
        ("m101_combo_2", "m101_basic_2"),
        ("m101_suzy_q_2", "m101_suzy_q_3"), # Bypass
        ("m101_taps_1", "m101_taps_2"), # Bypass
        ("m101_flares_1", "m101_combo_3"),
        ("m101_twist_1", "m101_combo_3"),
        ("m101_basic_2", "m101_combo_3"),
        ("m101_suzy_q_3", "m101_combo_3"),
        ("m101_taps_2", "m101_combo_3"),

        # W4
        ("m101_combo_3", "m101_swing_1"),
        ("m101_combo_3", "m101_synco_1"),
        ("m101_swing_1", "m101_swing_2"),
        ("m101_synco_1", "m101_synco_2"),
        ("m101_swing_2", "m101_combo_4"),
        ("m101_synco_2", "m101_combo_4"),
    ]

    # 2. MAMBO 201
    mambo_201_nodes = [
        # W1
        {"id": "m201_recap_1", "title": "Recap Mambo 101", "week": 1, "x": 50, "y": 90, "type": "skill"},
        {"id": "m201_flares_2", "title": "Flares 2", "week": 1, "x": 30, "y": 80, "type": "skill"},
        {"id": "m201_jumps_1", "title": "Jumps 1", "week": 1, "x": 50, "y": 80, "type": "skill"},
        {"id": "m201_suzy_q_4", "title": "Suzy Q 4", "week": 1, "x": 70, "y": 80, "type": "skill_track"},
        {"id": "m201_combo_5", "title": "COMBO 5", "week": 1, "x": 50, "y": 70, "type": "combo"},

        # W2
        {"id": "m201_turns_3", "title": "Turns 3: Double", "week": 2, "x": 30, "y": 60, "type": "skill_track"},
        {"id": "m201_angles_1", "title": "Angles 1: Diagonals", "week": 2, "x": 70, "y": 60, "type": "skill"},
        {"id": "m201_combo_6", "title": "COMBO 6", "week": 2, "x": 50, "y": 50, "type": "combo"},
        {"id": "m201_angles_2", "title": "Angles 2: Slides", "week": 2, "x": 40, "y": 45, "type": "skill"},
        {"id": "m201_body_3", "title": "Bodymovement 3", "week": 2, "x": 60, "y": 45, "type": "skill"},
        {"id": "m201_combo_7", "title": "COMBO 7", "week": 2, "x": 50, "y": 40, "type": "combo"},

        # W3
        {"id": "m201_level_1", "title": "Level 1: Suzy Q/Heel", "week": 3, "x": 20, "y": 30, "type": "skill_track"},
        {"id": "m201_ronde_1", "title": "Ronde 1", "week": 3, "x": 40, "y": 30, "type": "skill"},
        {"id": "m201_sync_3", "title": "Syncopations 3", "week": 3, "x": 60, "y": 30, "type": "skill"},
        {"id": "m201_patterns_1", "title": "Patterns 1", "week": 3, "x": 80, "y": 30, "type": "skill"},
        {"id": "m201_combo_8", "title": "COMBO 8", "week": 3, "x": 30, "y": 25, "type": "combo"},
        {"id": "m201_combo_9", "title": "COMBO 9", "week": 3, "x": 70, "y": 25, "type": "combo"},

        # W4
        {"id": "m201_turns_4", "title": "Turns 4: Spin Practice", "week": 4, "x": 20, "y": 15, "type": "skill_track"},
        {"id": "m201_style_2", "title": "Styling 2: Combs", "week": 4, "x": 40, "y": 15, "type": "skill"},
        {"id": "m201_style_3", "title": "Styling 3: Legs", "week": 4, "x": 60, "y": 15, "type": "skill"},
        {"id": "m201_pose_1", "title": "Pose 1", "week": 4, "x": 80, "y": 15, "type": "skill"},
        {"id": "m201_combo_10", "title": "COMBO 10", "week": 4, "x": 50, "y": 10, "type": "combo"},
        {"id": "m201_combo_11", "title": "COMBO 11: GRADUATION", "week": 4, "x": 50, "y": 5, "type": "combo"},
    ]

    mambo_201_edges = [
        # W1
        ("m201_recap_1", "m201_flares_2"),
        ("m201_recap_1", "m201_jumps_1"),
        ("m201_recap_1", "m201_suzy_q_4"),
        ("m201_flares_2", "m201_combo_5"),
        ("m201_jumps_1", "m201_combo_5"),
        ("m201_suzy_q_4", "m201_combo_5"),

        # W2
        ("m201_combo_5", "m201_turns_3"),
        ("m201_combo_5", "m201_angles_1"),
        ("m201_turns_3", "m201_combo_6"),
        ("m201_angles_1", "m201_combo_6"),
        ("m201_combo_6", "m201_angles_2"),
        ("m201_combo_6", "m201_body_3"),
        ("m201_angles_2", "m201_combo_7"),
        ("m201_body_3", "m201_combo_7"),

        # W3
        ("m201_suzy_q_4", "m201_level_1"), # Bypass
        ("m201_combo_7", "m201_ronde_1"),
        ("m201_combo_7", "m201_sync_3"),
        ("m201_combo_7", "m201_patterns_1"),
        ("m201_ronde_1", "m201_combo_8"),
        ("m201_level_1", "m201_combo_8"),
        ("m201_sync_3", "m201_combo_9"),
        ("m201_patterns_1", "m201_combo_9"),

        # W4
        ("m201_turns_3", "m201_turns_4"), # Bypass from W2
        ("m201_combo_9", "m201_style_2"),
        ("m201_combo_9", "m201_style_3"),
        ("m201_combo_9", "m201_pose_1"),
        ("m201_style_2", "m201_combo_10"),
        ("m201_style_3", "m201_combo_10"),
        ("m201_pose_1", "m201_combo_11"),
        ("m201_turns_4", "m201_combo_11"),
    ]

    # 3. MAMBO 301
    mambo_301_nodes = [
        # S1
        {"id": "m301_recap_2", "title": "Recap 201", "week": 1, "x": 50, "y": 90, "type": "skill"},
        {"id": "m301_style_4", "title": "Styling 4: Arms", "week": 1, "x": 30, "y": 80, "type": "skill"},
        {"id": "m301_timing_2", "title": "Timing 2: Son", "week": 1, "x": 45, "y": 80, "type": "skill_track"},
        {"id": "m301_swing_3", "title": "Swing Step 3", "week": 1, "x": 55, "y": 80, "type": "skill"},
        {"id": "m301_taps_3", "title": "Taps 3: Technique", "week": 1, "x": 70, "y": 80, "type": "skill_track"},
        {"id": "m301_combo_12", "title": "COMBO 12", "week": 1, "x": 50, "y": 70, "type": "combo"},

        # S2
        {"id": "m301_timing_3", "title": "Timing 3: Syncopation", "week": 2, "x": 40, "y": 60, "type": "skill_track"},
        {"id": "m301_sync_5", "title": "Syncopation 5", "week": 2, "x": 40, "y": 55, "type": "skill_track"},
        {"id": "m301_sync_6", "title": "Syncopation 6", "week": 2, "x": 40, "y": 50, "type": "skill_track"},
        {"id": "m301_suzy_q_5", "title": "Suzy Q 5", "week": 2, "x": 60, "y": 55, "type": "skill"},
        {"id": "m301_combo_13", "title": "COMBO 13", "week": 2, "x": 50, "y": 45, "type": "combo"},

        # S3
        {"id": "m301_flare_3", "title": "Flare 3", "week": 3, "x": 20, "y": 35, "type": "skill"},
        {"id": "m301_body_4", "title": "Bodymovement 4", "week": 3, "x": 35, "y": 35, "type": "skill"},
        {"id": "m301_twists_3", "title": "Twists 3", "week": 3, "x": 50, "y": 35, "type": "skill"},
        {"id": "m301_angles_3", "title": "Angles 3", "week": 3, "x": 65, "y": 35, "type": "skill"},
        {"id": "m301_level_2", "title": "Level 2", "week": 3, "x": 80, "y": 35, "type": "skill"},
        {"id": "m301_combo_14", "title": "COMBO 14", "week": 3, "x": 50, "y": 25, "type": "combo"},

        # S4
        {"id": "m301_hook_1", "title": "Hook Step 1", "week": 4, "x": 20, "y": 15, "type": "skill_track"},
        {"id": "m301_hook_2", "title": "Hook Step 2", "week": 4, "x": 20, "y": 10, "type": "skill_track"},
        {"id": "m301_hook_3", "title": "Hook Step 3", "week": 4, "x": 20, "y": 5, "type": "skill_track"},
        {"id": "m301_taps_4", "title": "Taps 4: Real Tap", "week": 4, "x": 80, "y": 15, "type": "skill_track"}, # From Taps 3
        {"id": "m301_jumps_2", "title": "Jumps 2", "week": 4, "x": 40, "y": 15, "type": "skill"},
        {"id": "m301_pose_2", "title": "Pose 2", "week": 4, "x": 60, "y": 15, "type": "skill"},
        {"id": "m301_combo_15", "title": "COMBO 15: CRAZY COMBO", "week": 4, "x": 50, "y": 0, "type": "combo"},
    ]

    mambo_301_edges = [
        # S1
        ("m301_recap_2", "m301_style_4"),
        ("m301_recap_2", "m301_timing_2"),
        ("m301_recap_2", "m301_swing_3"),
        ("m301_recap_2", "m301_taps_3"),
        ("m301_style_4", "m301_combo_12"),
        ("m301_swing_3", "m301_combo_12"),
        ("m301_taps_3", "m301_combo_12"),

        # S2
        ("m301_timing_2", "m301_timing_3"), # Bypass from S1
        ("m301_timing_3", "m301_sync_5"),
        ("m301_sync_5", "m301_sync_6"),
        ("m301_combo_12", "m301_suzy_q_5"),
        ("m301_sync_6", "m301_combo_13"),
        ("m301_suzy_q_5", "m301_combo_13"),

        # S3
        ("m301_combo_13", "m301_flare_3"),
        ("m301_combo_13", "m301_body_4"),
        ("m301_combo_13", "m301_twists_3"),
        ("m301_combo_13", "m301_angles_3"),
        ("m301_combo_13", "m301_level_2"),
        ("m301_flare_3", "m301_combo_14"),
        ("m301_body_4", "m301_combo_14"),
        ("m301_twists_3", "m301_combo_14"),
        ("m301_angles_3", "m301_combo_14"),
        ("m301_level_2", "m301_combo_14"),

        # S4
        ("m301_combo_14", "m301_hook_1"),
        ("m301_hook_1", "m301_hook_2"),
        ("m301_hook_2", "m301_hook_3"),
        ("m301_taps_3", "m301_taps_4"), # Bypass from S1
        ("m301_combo_14", "m301_jumps_2"),
        ("m301_combo_14", "m301_pose_2"),
        ("m301_hook_3", "m301_combo_15"),
        ("m301_taps_4", "m301_combo_15"),
        ("m301_jumps_2", "m301_combo_15"),
        ("m301_pose_2", "m301_combo_15"),
    ]

    # 4. PACHANGA (OPEN LEVEL)
    pachanga_nodes = [
        # P1
        {"id": "p_intro", "title": "History & Intro", "week": 1, "x": 50, "y": 90, "type": "skill"},
        {"id": "p_bounce", "title": "Bounce & Timing", "week": 1, "x": 50, "y": 80, "type": "skill_track"},
        {"id": "p_angles", "title": "Angles", "week": 1, "x": 50, "y": 70, "type": "skill"},
        {"id": "p_basic", "title": "Basic Pachanga 1", "week": 1, "x": 50, "y": 60, "type": "skill"},
        {"id": "p_ssd", "title": "Single Single Double", "week": 1, "x": 50, "y": 50, "type": "skill_track"},
        {"id": "p_walking", "title": "Walking Pachanga", "week": 1, "x": 50, "y": 40, "type": "skill"},
        {"id": "p_checkpoint1", "title": "MINI COMBO: CHARLESTON", "week": 1, "x": 50, "y": 30, "type": "combo"},

        # P2
        {"id": "p_style", "title": "Styling", "week": 2, "x": 20, "y": 30, "type": "skill_track"},
        {"id": "p_kicks", "title": "Pachanga Kicks", "week": 2, "x": 40, "y": 20, "type": "skill"},
        {"id": "p_taps", "title": "Pachanga Taps", "week": 2, "x": 60, "y": 20, "type": "skill"},
        {"id": "p_jumps", "title": "Pachanga Jumps 1 & 2", "week": 2, "x": 40, "y": 10, "type": "skill"},
        {"id": "p_sync", "title": "Syncopated Pachanga", "week": 2, "x": 60, "y": 10, "type": "skill"},
        {"id": "p_glides", "title": "Glides & Shuffles", "week": 2, "x": 50, "y": 5, "type": "skill"},
        {"id": "p_final_combo", "title": "FINAL PACHANGA COMBO", "week": 2, "x": 50, "y": 0, "type": "combo"},
    ]

    pachanga_edges = [
        # P1
        ("p_intro", "p_bounce"),
        ("p_bounce", "p_angles"),
        ("p_angles", "p_basic"),
        ("p_basic", "p_ssd"),
        ("p_ssd", "p_walking"),
        ("p_walking", "p_checkpoint1"),

        # P2
        ("p_ssd", "p_style"), # Bypass
        ("p_checkpoint1", "p_kicks"),
        ("p_checkpoint1", "p_taps"),
        ("p_kicks", "p_jumps"),
        ("p_taps", "p_sync"),
        ("p_jumps", "p_glides"),
        ("p_sync", "p_glides"),
        ("p_glides", "p_final_combo"),
        ("p_style", "p_final_combo"),
    ]

    # 5. BODYMOVEMENT (OPEN LEVEL)
    bm_nodes = [
        # B1
        {"id": "bm_recap", "title": "Intro", "week": 1, "x": 50, "y": 90, "type": "skill"},
        {"id": "bm_head", "title": "Head", "week": 1, "x": 50, "y": 80, "type": "skill_track"},
        {"id": "bm_shoulders", "title": "Shoulders", "week": 1, "x": 50, "y": 70, "type": "skill_track"},
        {"id": "bm_ribs", "title": "Ribcage", "week": 1, "x": 50, "y": 60, "type": "skill_track"},
        {"id": "bm_hips", "title": "Hips", "week": 1, "x": 50, "y": 50, "type": "skill_track"},
        {"id": "bm_knees", "title": "Knees", "week": 1, "x": 50, "y": 40, "type": "skill_track"},
        {"id": "bm_basic_bm", "title": "Basic Bodymovement 1", "week": 1, "x": 50, "y": 30, "type": "skill"},

        # B2
        {"id": "bm_arm_waves", "title": "Arm Waves", "week": 2, "x": 30, "y": 20, "type": "skill"},
        {"id": "bm_body_waves", "title": "Body Waves", "week": 2, "x": 30, "y": 10, "type": "skill"},
        {"id": "bm_side_waves", "title": "Side Waves", "week": 2, "x": 30, "y": 5, "type": "skill"},
        {"id": "bm_glides", "title": "Glides", "week": 2, "x": 70, "y": 20, "type": "skill"},
        {"id": "bm_shimmy", "title": "Shimmy", "week": 2, "x": 70, "y": 10, "type": "skill"},
        {"id": "bm_despelote", "title": "Despelote", "week": 2, "x": 50, "y": 0, "type": "skill"},
        {"id": "bm_final", "title": "FINAL BODY COMBO", "week": 2, "x": 50, "y": -10, "type": "combo"},
    ]

    bm_edges = [
        # B1
        ("bm_recap", "bm_head"),
        ("bm_head", "bm_shoulders"),
        ("bm_shoulders", "bm_ribs"),
        ("bm_ribs", "bm_hips"),
        ("bm_hips", "bm_knees"),
        ("bm_knees", "bm_basic_bm"),

        # B2
        ("bm_basic_bm", "bm_arm_waves"),
        ("bm_basic_bm", "bm_glides"),
        ("bm_basic_bm", "bm_shimmy"),
        ("bm_arm_waves", "bm_body_waves"),
        ("bm_body_waves", "bm_side_waves"),
        ("bm_side_waves", "bm_despelote"),
        ("bm_glides", "bm_despelote"),
        ("bm_shimmy", "bm_despelote"),
        ("bm_despelote", "bm_final"),
    ]

    courses_data = [
        {
            "slug": "mambo-101",
            "title": "Mambo 101",
            "description": "The foundation of Mambo. Learn timing, basic steps, turns, and your first partnerwork combinations.",
            "difficulty": "BEGINNER",
            "course_type": "course",
            "nodes": mambo_101_nodes,
            "edges": mambo_101_edges,
            "order": 1
        },
        {
            "slug": "mambo-201",
            "title": "Mambo 201",
            "description": "Intermediate techniques. Spins, hammerlocks, complex cross-body variations, and enhanced musicality.",
            "difficulty": "INTERMEDIATE",
            "course_type": "course",
            "nodes": mambo_201_nodes,
            "edges": mambo_201_edges,
            "order": 2
        },
        {
            "slug": "mambo-301",
            "title": "Mambo 301",
            "description": "Advanced complexity. Syncopations, advanced styling, 3D dancing, and professional performance techniques.",
            "difficulty": "ADVANCED",
            "course_type": "course",
            "nodes": mambo_301_nodes,
            "edges": mambo_301_edges,
            "order": 3
        },
        {
            "slug": "pachanga-foundations",
            "title": "Pachanga Foundations",
            "description": "Master the groove of Pachanga. From the basic bounce to fancy footwork, kicks, and glides.",
            "difficulty": "OPEN", # OPEN LEVEL
            "course_type": "course", # or choreo? Keeping as course for now
            "nodes": pachanga_nodes,
            "edges": pachanga_edges,
            "order": 4
        },
        {
            "slug": "bodymovement-mastery",
            "title": "Bodymovement Mastery",
            "description": "Unlock total body control. Isolations, waves, and fluid integration for a polished dance style.",
            "difficulty": "OPEN", # OPEN LEVEL
            "course_type": "course", # or topic?
            "nodes": bm_nodes,
            "edges": bm_edges,
            "order": 5
        }
    ]

    # -------------------------------------------------------------------------
    # DB OPERATIONS
    # -------------------------------------------------------------------------
    
    try:
        with engine.begin() as conn:
            # 1. DELETE EXISTING DATA
            slugs = [c["slug"] for c in courses_data]
            quoted_slugs = ", ".join([f"'{s}'" for s in slugs])
            
            # Find world IDs to delete dependent data safely (though cascade might handle it)
            logger.info("Cleaning up existing courses...")
            conn.execute(text(f"DELETE FROM worlds WHERE slug IN ({quoted_slugs})"))
            
            # 2. INSERT NEW DATA
            for course in courses_data:
                logger.info(f"Creating course: {course['title']}")
                world_id = str(uuid.uuid4())
                
                # Create World
                conn.execute(text("""
                    INSERT INTO worlds (id, title, description, slug, order_index, is_free, difficulty, is_published, course_type, total_duration_minutes, objectives)
                    VALUES (:id, :title, :description, :slug, :order_index, :is_free, :difficulty, :is_published, :course_type, 60, '[]')
                """), {
                    "id": world_id,
                    "title": course["title"],
                    "description": course["description"],
                    "slug": course["slug"],
                    "order_index": course["order"],
                    "is_free": False,
                    "difficulty": course["difficulty"],
                    "is_published": True,
                    "course_type": course["course_type"]
                })

                # Create Nodes (Level) & Lessons (1 per node for simplicity)
                node_id_map = {} # map custom id -> uuid
                
                for i, node in enumerate(course["nodes"]):
                    level_id = str(uuid.uuid4())
                    node_id_map[node["id"]] = level_id
                    
                    conn.execute(text("""
                        INSERT INTO levels (id, world_id, title, order_index, x_position, y_position, duration_minutes, total_xp, status)
                        VALUES (:id, :world_id, :title, :order_index, :x_position, :y_position, 0, 100, 'active')
                    """), {
                        "id": level_id,
                        "world_id": world_id,
                        "title": node["title"],
                        "order_index": i + 1,
                        "x_position": float(node["x"]),
                        "y_position": float(node["y"])
                    })
                    
                    # Create a dummy lesson for this node to make it clickable/functional
                    lesson_id = str(uuid.uuid4())
                    conn.execute(text("""
                        INSERT INTO lessons (id, level_id, title, description, video_url, xp_value, order_index, is_boss_battle, duration_minutes, lesson_type)
                        VALUES (:id, :level_id, :title, :description, 'https://example.com/placeholder', 50, 1, :is_boss, 10, 'video')
                    """), {
                        "id": lesson_id,
                        "level_id": level_id,
                        "title": f"Lesson: {node['title']}",
                        "description": f"Content for {node['title']}",
                        "is_boss": "COMBO" in node["title"] or "BOSS" in node["title"]
                    })
                
                # Create Edges
                for from_id, to_id in course["edges"]:
                    if from_id in node_id_map and to_id in node_id_map:
                        conn.execute(text("""
                            INSERT INTO level_edges (id, world_id, from_level_id, to_level_id)
                            VALUES (:id, :world_id, :from_id, :to_id)
                        """), {
                            "id": str(uuid.uuid4()),
                            "world_id": world_id,
                            "from_id": node_id_map[from_id],
                            "to_id": node_id_map[to_id]
                        })
                    else:
                        logger.warning(f"Skipping edge {from_id} -> {to_id} because node missing.")

        logger.info("Reseed complete!")

    except Exception as e:
        logger.error(f"Error seeding: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    seed_full_courses()
