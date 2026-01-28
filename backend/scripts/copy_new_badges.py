"""
Copy generated badge images from artifacts directory to public/badges folder.
"""
import shutil
from pathlib import Path
import os

# Source: artifacts directory
artifacts_dir = Path(r"C:\Users\pavle\.gemini\antigravity\brain\09da0de8-4bd0-42c5-b446-459885c40ac7")

# Destination: frontend public badges
badges_dir = Path(r"c:\Users\pavle\Desktop\salsa_lab_v2\frontend\public\badges")

# List of generated badges to copy
badges_to_copy = [
    # Firestarter (complete)
    "firestarter_bronze",
    "firestarter_silver",
    "firestarter_gold", 
    "firestarter_diamond",
    # Human Metronome (complete)
    "human_metronome_bronze",
    "human_metronome_silver",
    "human_metronome_gold",
    "human_metronome_diamond",
    # Crowd Favorite (complete)
    "crowd_favorite_bronze",
    "crowd_favorite_silver",
    "crowd_favorite_gold",
    "crowd_favorite_diamond",
    # Talent Scout (complete)
    "talent_scout_bronze",
    "talent_scout_silver",
    "talent_scout_gold",
    "talent_scout_diamond",
    # The Professor (complete)
    "the_professor_bronze",
    "the_professor_silver",
    "the_professor_gold",
    "the_professor_diamond",
    # The Socialite (complete)
    "the_socialite_bronze",
    "the_socialite_silver",
    "the_socialite_gold",
    "the_socialite_diamond",
    # Center Stage (complete)
    "center_stage_bronze",
    "center_stage_silver",
    "center_stage_gold",
    "center_stage_diamond",
    # Curious Mind (complete)
    "curious_mind_bronze",
    "curious_mind_silver",
    "curious_mind_gold",
    "curious_mind_diamond",
    # Unstoppable (complete)
    "unstoppable_bronze",
    "unstoppable_silver",
    "unstoppable_gold",
    "unstoppable_diamond",
    # Special Badges (complete)
    "beta_tester",
    "founder_diamond",
]

print("Copying newly generated badges...")
print("=" * 60)

copied = 0
for badge_name in badges_to_copy:
    # Find the PNG file in artifacts (has timestamp in filename)
    pattern = f"{badge_name}_*.png"
    matches = list(artifacts_dir.glob(pattern))
    
    if matches:
        # Take the most recent one (last in list)
        source_file = matches[-1]
        dest_file = badges_dir / f"{badge_name}.png"
        
        # Copy the file
        shutil.copy2(source_file, dest_file)
        print(f"[OK] Copied {badge_name}.png")
        copied += 1
    else:
        print(f"[SKIP] {badge_name} not found in artifacts")

print("=" * 60)
print(f"Done! Copied {copied}/{len(badges_to_copy)} badges.")
print("\nRefresh your browser to see the new badges!")
