
import cv2
import numpy as np
import os
import glob

# Configuration
INPUT_START = r"c:\Users\pavle\Desktop\salsa_lab_v2\Ressources\Hero_Start.png"
INPUT_END = r"c:\Users\pavle\Desktop\salsa_lab_v2\Ressources\Hero_End.png"
OUTPUT_DIR = r"c:\Users\pavle\Desktop\salsa_lab_v2\frontend\public\assets\hero-frames"

# Start and End indices to replace
START_INDICES = range(0, 3) # 0, 1, 2
END_INDICES = range(189, 192) # 189, 190, 191 (Total 192 frames, 0-191)

def remove_logo_and_save(input_path, output_paths):
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        return

    # Load image
    img = cv2.imread(input_path)
    if img is None:
        print(f"Error: Could not read image: {input_path}")
        return

    h, w = img.shape[:2]
    
    # Simple Inpainting Strategy for bottom right logo
    # Assuming logo is approx 150x50 at the bottom right. 
    # Let's inspect, but blindly: we can just crop the bottom 40px or use inpainting.
    # User said "remove the open ai/gemini logo".
    # Mask area: Bottom-right corner.
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    
    # Define logo region (approximate, usually small in corner)
    # Let's clean a 200x80 box in bottom right to be safe.
    logo_w = 250
    logo_h = 100
    cv2.rectangle(mask, (w - logo_w, h - logo_h), (w, h), 255, -1)

    # Inpaint
    # optimized inpainting
    restored = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)

    # Save to all target paths
    for idx in output_paths:
        filename = f"frame_{str(idx).zfill(3)}.jpg"
        save_path = os.path.join(OUTPUT_DIR, filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save as JPG with high quality
        cv2.imwrite(save_path, restored, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        print(f"Saved: {save_path}")

# Execute
print("Processing Start Frames...")
remove_logo_and_save(INPUT_START, START_INDICES)

print("Processing End Frames...")
remove_logo_and_save(INPUT_END, END_INDICES)

print("Done.")
