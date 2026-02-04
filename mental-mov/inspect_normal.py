from PIL import Image
import os

BASE_DIR = "public/project_2025_03"
normal_path = os.path.join(BASE_DIR, "husky_normal.png")

if os.path.exists(normal_path):
    img = Image.open(normal_path)
    print(f"Size: {img.size}")
    bbox = img.getbbox()
    print(f"BBox: {bbox}")
else:
    print("husky_normal.png not found")
