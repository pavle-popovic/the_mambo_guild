"""
Badge Background Remover
Removes gray/dark backgrounds from badge PNG files and makes them transparent.
"""
from PIL import Image
import os
from pathlib import Path

def remove_background(image_path, output_path=None, tolerance=30):
    """
    Remove gray/dark background from a PNG image and make it transparent.
    
    Args:
        image_path: Path to input PNG file
        output_path: Path to save output (defaults to overwriting input)
        tolerance: Color difference tolerance for background detection (0-255)
    """
    # Open image
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get image data
    data = img.getdata()
    
    # Sample the corner pixels to determine background color
    # Assuming background is in the corners
    width, height = img.size
    corners = [
        data[0],  # Top-left
        data[width - 1],  # Top-right
        data[width * (height - 1)],  # Bottom-left
        data[width * height - 1]  # Bottom-right
    ]
    
    # Use the most common corner color as background
    # For simplicity, we'll use the top-left corner
    bg_color = corners[0][:3]  # RGB only, ignore alpha
    
    # Create new image data
    new_data = []
    for item in data:
        r, g, b, a = item
        
        # Check if pixel is close to background color
        # Also check if it's a dark gray (common background)
        is_background = (
            # Match background color with tolerance
            (abs(r - bg_color[0]) < tolerance and 
             abs(g - bg_color[1]) < tolerance and 
             abs(b - bg_color[2]) < tolerance)
            or
            # Or if it's a dark/gray color (R, G, B are similar and dark)
            (abs(r - g) < 20 and abs(g - b) < 20 and abs(r - b) < 20 and r < 80)
        )
        
        if is_background:
            # Make transparent
            new_data.append((r, g, b, 0))
        else:
            # Keep original
            new_data.append(item)
    
    # Update image
    img.putdata(new_data)
    
    # Save
    output = output_path or image_path
    img.save(output, 'PNG')
    print(f"[OK] Processed: {Path(image_path).name}")

def process_badges_directory(badges_dir, specific_badges=None):
    """
    Process all badge PNG files in a directory.
    
    Args:
        badges_dir: Path to badges directory
        specific_badges: List of specific badge filenames to process (optional)
    """
    badges_path = Path(badges_dir)
    
    if not badges_path.exists():
        print(f"Error: Directory not found: {badges_dir}")
        return
    
    # Get all PNG files
    png_files = list(badges_path.glob('*.png'))
    
    if specific_badges:
        # Filter to only specific badges
        png_files = [f for f in png_files if f.name in specific_badges]
    
    print(f"\nProcessing {len(png_files)} badge files...")
    print("=" * 50)
    
    for png_file in png_files:
        try:
            remove_background(str(png_file))
        except Exception as e:
            print(f"[ERROR] Error processing {png_file.name}: {e}")
    
    print("=" * 50)
    print(f"Done! Processed {len(png_files)} badges.")

if __name__ == "__main__":
    # Path to badges directory
    import sys
    script_dir = Path(__file__).parent
    badges_directory = script_dir / ".." / ".." / "frontend" / "public" / "badges"
    badges_directory = badges_directory.resolve()
    
    # Option 1: Process all badges
    # process_badges_directory(badges_directory)
    
    # Option 2: Process only specific badges with known background issues
    problematic_badges = [
        'beta_tester.png',
        'unstoppable_bronze.png',
        'unstoppable_silver.png',
        'unstoppable_gold.png',
        'unstoppable_diamond.png'
    ]
    
    process_badges_directory(str(badges_directory), problematic_badges)
