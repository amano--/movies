from PIL import Image, ImageChops, ImageFilter
import os
import glob
import argparse

def make_transparent(input_dir, output_dir, corner_coords=(0, 0), tolerance=30, erosion=1):
    """
    Makes the background color transparent and erodes the edge to remove halos.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    files = glob.glob(os.path.join(input_dir, "*.png"))
    print(f"Processing {len(files)} files...")

    # Create a reference color image for difference calculation
    # We need to process one by one
    
    for file_path in files:
        filename = os.path.basename(file_path)
        output_path = os.path.join(output_dir, filename)

        try:
            img = Image.open(file_path).convert("RGBA")
            bg_color = img.getpixel(corner_coords)
            
            # Create a background color image of same size
            bg = Image.new("RGBA", img.size, bg_color)
            
            # Find difference
            diff = ImageChops.difference(img, bg)
            # Convert to grayscale to measure distance
            diff = diff.convert("L")
            
            # Create mask: Pixels with difference < tolerance are background (black), others subject (white)
            # We want background to be transparent (0 alpha).
            # The 'point' function maps values. If val < tolerance, 0. Else 255.
            mask = diff.point(lambda p: 0 if p < tolerance else 255)
            
            # Erode the mask to shrink the subject and eat not-quite-green edges
            if erosion > 0:
                # MinFilter shrinks the white (subject) area
                # Size 3 means 1 pixel erosion radius roughly
                mask = mask.filter(ImageFilter.MinFilter(3)) 
            
            # Blur the mask slightly for softer edges? Optional. 
            # Let's keep it sharp for now or slight blur 
            # mask = mask.filter(ImageFilter.GaussianBlur(0.5))

            # Apply mask to alpha channel of original image
            img.putalpha(mask)
            
            img.save(output_path, "PNG")
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print("Transparency processing complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove background from PNG images.")
    parser.add_argument("--input_dir", type=str, required=True, help="Directory containing input images")
    parser.add_argument("--output_dir", type=str, required=True, help="Directory to save output images")
    parser.add_argument("--tolerance", type=int, default=50, help="Tolerance for color matching")
    parser.add_argument("--erosion", type=int, default=1, help="Erode edges (1=yes, 0=no)")
    
    args = parser.parse_args()
    
    make_transparent(args.input_dir, args.output_dir, tolerance=args.tolerance, erosion=args.erosion)
