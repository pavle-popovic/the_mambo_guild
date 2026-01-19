import os

directory = r"c:\Users\pavle\Desktop\salsa_lab_v2\frontend\public\assets\hero-frames"

print(f"Renaming files in {directory}...")

count = 0
for filename in os.listdir(directory):
    if filename.startswith("frame_") and filename.endswith(".jpg"):
        # Extract the number part
        parts = filename.split("_")
        if len(parts) >= 2:
            number_part = parts[1] # "000" from "frame_000_delay..."
            
            new_name = f"frame_{number_part}.jpg"
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)
            
            if old_path != new_path:
                os.rename(old_path, new_path)
                count += 1

print(f"Renamed {count} files.")
