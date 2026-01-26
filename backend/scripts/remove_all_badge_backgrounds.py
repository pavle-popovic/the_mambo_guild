"""
Aggressive Badge Background Remover
Uses a more sophisticated approach to remove backgrounds from badge images.
"""
from PIL import Image, ImageChops, ImageFilter
import os
from pathlib import Path
import numpy as np

def remove_background_aggressive(image_path, output_path=None):
    """
    Aggressively remove background from badge image.
    This version uses a multi-step approach:
    1. Sample edges to determine background
    2. Remove similar colors with high tolerance
    3. Clean up with morphological operations
    """
    # Open image
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Convert to numpy array for easier manipulation
    data = np.array(img)
    
    # Get dimensions
    height, width = data.shape[:2]
    
    # Sample the edges to get background color
    # Take average of border pixels
    border_pixels = []
    border_width = 20  # Sample 20 pixels from each edge
    
    # Top and bottom edges
    border_pixels.extend(data[0:border_width, :].reshape(-1, 4))
    border_pixels.extend(data[height-border_width:height, :].reshape(-1, 4))
    # Left and right edges
    border_pixels.extend(data[:, 0:border_width].reshape(-1, 4))
    border_pixels.extend(data[:, width-border_width:width].reshape(-1, 4))
    
    border_pixels = np.array(border_pixels)
    
    # Calculate median background color (more robust than mean)
    bg_r = np.median(border_pixels[:, 0])
    bg_g = np.median(border_pixels[:, 1])
    bg_b = np.median(border_pixels[:, 2])
    
    print(f"Detected background color: RGB({bg_r:.0f}, {bg_g:.0f}, {bg_b:.0f})")
    
    # Create alpha channel based on color difference from background
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Calculate color distance from background
    color_diff = np.sqrt(
        (r - bg_r) ** 2 +
        (g - bg_g) ** 2 +
        (b - bg_b) ** 2
    )
    
    # Create new alpha channel
    # Pixels similar to background (within threshold) become transparent
    threshold = 40  # Increased threshold for more aggressive removal
    new_alpha = np.where(color_diff < threshold, 0, 255).astype(np.uint8)
    
    # Also make very dark pixels transparent (common for gray backgrounds)
    brightness = (r + g + b) / 3
    is_dark = brightness < 90
    is_gray = (np.abs(r - g) < 25) & (np.abs(g - b) < 25) & (np.abs(r - b) < 25)
    
    # Pixels that are both dark and gray become transparent
    new_alpha = np.where(is_dark & is_gray, 0, new_alpha)
    
    # Apply new alpha channel
    data[:, :, 3] = new_alpha
    
    # Convert back to PIL Image
    result = Image.fromarray(data, 'RGBA')
    
    # Apply a slight blur to alpha channel to smooth edges
    alpha_channel = result.split()[3]
    alpha_channel = alpha_channel.filter(ImageFilter.GaussianBlur(radius=1))
    result.putalpha(alpha_channel)
    
    # Save
    output = output_path or image_path
    result.save(output, 'PNG')
    print(f"[OK] Processed: {Path(image_path).name}")

def process_all_badges(badges_dir):
    """Process all PNG files in badges directory."""
    badges_path = Path(badges_dir)
    
    if not badges_path.exists():
        print(f"Error: Directory not found: {badges_dir}")
        return
    
    # Get all PNG files
    png_files = list(badges_path.glob('*.png'))
    
    print(f"\nProcessing {len(png_files)} badge files with AGGRESSIVE removal...")
    print("=" * 60)
    
    for png_file in png_files:
        try:
            remove_background_aggressive(str(png_file))
        except Exception as e:
            print(f"[ERROR] Error processing {png_file.name}: {e}")
            import traceback
            traceback.print_exc()
    
    print("=" * 60)
    print(f"Done! Processed {len(png_files)} badges.")

if __name__ == "__main__":
    # Path to badges directory
    script_dir = Path(__file__).parent
    badges_directory = script_dir / ".." / ".." / "frontend" / "public" / "badges"
    badges_directory = badges_directory.resolve()
    
    # Process ALL badges with aggressive removal
    process_all_badges(str(badges_directory))
