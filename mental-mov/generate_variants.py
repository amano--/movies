from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import os
import glob

BASE_DIR = "public/project_2025_03"

def create_variant(src_filename, variant_type, output_suffix):
    src_path = os.path.join(BASE_DIR, src_filename)
    if not os.path.exists(src_path):
        print(f"Skipping {src_filename}, not found.")
        return None

    try:
        img = Image.open(src_path).convert("RGBA")
        
        if variant_type == "flop":
            img = ImageOps.mirror(img)
        elif variant_type == "grayscale":
            img = ImageOps.grayscale(img).convert("RGBA")
        elif variant_type == "sepia":
            gray = ImageOps.grayscale(img)
            img = ImageOps.colorize(gray, "#704214", "#C0C0C0").convert("RGBA")
        elif variant_type == "negate":
            # Invert colors for a 'shock' or 'negative' effect
            # ImageOps.invert only works on RGB usually
            r, g, b, a = img.split()
            rgb = Image.merge("RGB", (r, g, b))
            inverted = ImageOps.invert(rgb)
            r2, g2, b2 = inverted.split()
            img = Image.merge("RGBA", (r2, g2, b2, a))
        elif variant_type == "blur":
            img = img.filter(ImageFilter.GaussianBlur(5))
        elif variant_type == "contrast":
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.5)
        elif variant_type == "darken":
             enhancer = ImageEnhance.Brightness(img)
             img = enhancer.enhance(0.6)
        elif variant_type == "pixelate":
             # Resize small then big
             orig_size = img.size
             small = img.resize((64, 64), resample=Image.NEAREST)
             img = small.resize(orig_size, resample=Image.NEAREST)
        
        # Save
        name_part, ext = os.path.splitext(src_filename)
        new_filename = f"{name_part}_{output_suffix}{ext}"
        out_path = os.path.join(BASE_DIR, new_filename)
        img.save(out_path)
        print(f"Created {new_filename}")
        return new_filename
    except Exception as e:
        print(f"Error creating variant for {src_filename}: {e}")
        return None

def main():
    # Define duplicates needing new variants
    # Chunk 1
    create_variant("topic_1_ageha.png", "contrast", "v_intense") # scene 5
    create_variant("mood_family_tension.png", "sepia", "v_sepia") # scene 10
    create_variant("topic_2_silence.png", "darken", "v_dark") # scene 11
    create_variant("mood_pondering.png", "grayscale", "v_gray") # scene 12
    create_variant("scene_buddhist_funeral.png", "blur", "v_blur") # scene 18

    # Chunk 2
    create_variant("scene_old_shed.png", "contrast", "v_rust") # scene 10
    create_variant("scene_walking_away.png", "flop", "v_mirror") # scene 11
    create_variant("mood_time_passing.png", "sepia", "v_sepia") # scene 13
    create_variant("mood_time_passing.png", "negate", "v_neg") # scene 20
    create_variant("scene_running_diet.png", "flop", "v_mirror") # scene 19
    create_variant("mood_pondering.png", "negate", "v_invert") # scene 12 (Fix for duplicate)

    # Chunk 3
    create_variant("scene_samurai_spirit.png", "contrast", "v_strong") # scene 6
    create_variant("scene_samurai_seppuku.png", "grayscale", "v_bw") # scene 9
    create_variant("mood_shock.png", "negate", "v_inv") # scene 10
    create_variant("mood_pondering.png", "flop", "v_mirror") # scene 8
    create_variant("mood_pondering.png", "darken", "v_dark") # scene 12
    create_variant("mood_pondering.png", "blur", "v_dream") # scene 18
    create_variant("scene_love_escape.png", "sepia", "v_old") # scene 17
    create_variant("scene_tokyo_night_lonely.png", "blur", "v_blur") # scene 20

    # Chunk 4
    create_variant("scene_love_escape.png", "contrast", "v_neon") # scene 1
    
    # Chunk 5
    create_variant("mood_hysteria_scream.png", "contrast", "v_scream") # chunk 5 scene 3
    create_variant("mood_pondering.png", "sepia", "v_mem") # chunk 5 scene 6
    create_variant("scene_mirror_reflection.png", "flop", "v_mirror") # chunk 5 scene 17
    create_variant("topic_1_ageha.png", "grayscale", "v_end") # chunk 5 scene 20
    
    # Chunk 6
    create_variant("mood_time_passing.png", "blur", "v_fade") # scene 1
    create_variant("topic_2_silence.png", "negate", "v_void") # scene 2
    create_variant("scene_tokyo_night_lonely.png", "grayscale", "v_mono") # scene 5
    create_variant("mood_time_passing.png", "pixelate", "v_pixel") # scene 6
    create_variant("mood_pondering.png", "pixelate", "v_pixel") # scene 8
    create_variant("topic_2_silence.png", "contrast", "v_loud") # scene 7
    create_variant("scene_tokyo_night_lonely.png", "contrast", "v_stark") # scene 11?
    
    print("Variants generation complete.")

if __name__ == "__main__":
    main()
