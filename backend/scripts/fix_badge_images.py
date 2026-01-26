
import os
from PIL import Image
import sys

# Define path to badges directory
# .../backend/scripts/fix_badge_images.py -> .../backend/scripts -> .../backend -> .../
BADGES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "public", "badges")

def convert_to_png(filename):
    file_path = os.path.join(BADGES_DIR, filename)
    if not os.path.exists(file_path):
        print(f"❌ File not found: {filename}")
        return

    try:
        # Open the image
        with Image.open(file_path) as img:
            print(f"Checking {filename}...")
            print(f"  - Original format: {img.format}")
            
            if img.format != 'PNG':
                print(f"  - ⚠️ Format mismatch! Converting {img.format} -> PNG...")
                # Convert to RGBA to ensure transparency support if needed (though JPEGs won't have it)
                img = img.convert("RGBA")
                # Save it back to the same path as PNG
                img.save(file_path, "PNG")
                print(f"  - ✅ Converted and saved as valid PNG.")
            else:
                print(f"  - ✅ Already a valid PNG.")

    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")

if __name__ == "__main__":
    print(f"📂 Badges directory: {BADGES_DIR}")
    
if __name__ == "__main__":
    print(f"📂 Badges directory: {BADGES_DIR}")
    
    # Check ALL png files in the directory
    all_files = [f for f in os.listdir(BADGES_DIR) if f.endswith(".png")]
    print(f"🔍 Scanning {len(all_files)} files for format mismatch...")

    for f in all_files:
        convert_to_png(f)
