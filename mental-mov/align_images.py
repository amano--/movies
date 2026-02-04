from PIL import Image
import os
import sys

BASE_DIR = "public/project_2025_03"
files = {
    "normal": "husky_normal.png",
    "targets": [
        "husky_closed.png",
        "husky_talk_a.png",
        "husky_talk_big.png",
        "husky_talk_i.png",
        "husky_happy.png",
        "husky_mouse_open.png",
        "husky_closing_1.png",
        "husky_closing_2.png",
        "husky_closing_3.png"
    ]
}

CANVAS_SIZE = (1152, 1152) 

def flood_fill_transparency(img, tolerance=30):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Visited set
    visited = set()
    queue = []
    
    # Start from corners if they are whitish
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    start_nodes = []
    
    for x, y in corners:
        r, g, b, a = pixels[x, y]
        # Check if the corner is "white-ish"
        if r > 200 and g > 200 and b > 200:
            queue.append((x, y))
            visited.add((x, y))
            
    # Directions: 4-connected
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    
    while queue:
        x, y = queue.pop(0)
        
        # Set to transparent
        pixels[x, y] = (255, 255, 255, 0)
        
        for dx, dy in dirs:
            nx, ny = x + dx, y + dy
            
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    r, g, b, a = pixels[nx, ny]
                    # Check if pixel is white-ish (background)
                    # We assume the background is very light. The Husky has white fur but maybe slightly different shade 
                    # or bounded by dark lines? 
                    # Husky has a black outline usually which stops the flood.
                    if r > 200 and g > 200 and b > 200:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    return img

def get_content_bbox(img):
    # Get bbox using alpha channel
    return img.getbbox()

def process_images():
    print("Processing images with flood fill transparency...")
    
    # 1. Inspect Anchor (Normal)
    normal_path = os.path.join(BASE_DIR, files["normal"])
    if not os.path.exists(normal_path):
        print("Normal image not found!")
        return

    normal_img = Image.open(normal_path)
    # Use Normal's dimensions as the master canvas size
    master_width, master_height = normal_img.size
    print(f"Master Dimensions: {master_width}x{master_height}")
    
    # We define the canvas as the master size
    canvas_size = (master_width, master_height)
    
    # We assume 'normal' is already centered/positioned beautifully by the artist/user.
    # We align targets to be centered horizontally and top-aligned (assuming heads are at top).
    
    # Optional: We could calculate where Normal's content IS, to align precisely.
    # temp_normal = flood_fill_transparency(normal_img.copy())
    # normal_bbox = get_content_bbox(temp_normal)
    # normal_content_center_x = normal_bbox[0] + (normal_bbox[2] - normal_bbox[0]) // 2
    # But simpler is Center of Canvas.
    canvas_center_x = master_width // 2
    
    # 2. Process Targets
    for fname in files["targets"]:
        fpath = os.path.join(BASE_DIR, fname)
        if not os.path.exists(fpath):
            continue
            
        img = Image.open(fpath)
        img = flood_fill_transparency(img)
        bbox = get_content_bbox(img)
        
        if not bbox:
            print(f"Empty bbox for {fname}")
            continue
            
        content = img.crop(bbox)
        
        # Create new canvas matching Master Size
        new_img = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
        
        # Position: Center Horizontally, Top Aligned (0)
        # If normal started at Y=0 (which bbox says it does), we align target top to Y=0.
        
        c_x = canvas_center_x - (content.width // 2)
        c_y = 0 
        
        new_img.paste(content, (c_x, c_y))
        new_img.save(fpath, "PNG")
        print(f"Aligned Target: {fname}")

if __name__ == "__main__":
    # Increase recursion limit just in case, though we use queue
    sys.setrecursionlimit(10000)
    process_images()
