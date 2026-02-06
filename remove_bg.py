from PIL import Image
import os
import glob

def make_transparent(input_dir, output_dir, corner_coords=(0, 0), tolerance=30):
    """
    Makes the background color transparent based on the color at a specific coordinate.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    files = glob.glob(os.path.join(input_dir, "*.png"))
    print(f"Processing {len(files)} files...")

    for file_path in files:
        filename = os.path.basename(file_path)
        output_path = os.path.join(output_dir, filename)

        try:
            img = Image.open(file_path).convert("RGBA")
            datas = img.getdata()
            
            # Get background color from the corner (usually gray/green screen area)
            bg_color = img.getpixel(corner_coords)
            
            newData = []
            for item in datas:
                # Check if pixel is close to background color
                if (abs(item[0] - bg_color[0]) < tolerance and
                    abs(item[1] - bg_color[1]) < tolerance and
                    abs(item[2] - bg_color[2]) < tolerance):
                    newData.append((255, 255, 255, 0)) # Transparent
                else:
                    newData.append(item)
            
            img.putdata(newData)
            img.save(output_path, "PNG")
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print("Transparency processing complete.")

if __name__ == "__main__":
    input_folder = "mental-mov/public/project_2025_03/caster_frames_raw"
    output_folder = "mental-mov/public/project_2025_03/caster_frames"
    
    # Assuming top-left corner (0,0) is part of the background to be removed
    make_transparent(input_folder, output_folder)
