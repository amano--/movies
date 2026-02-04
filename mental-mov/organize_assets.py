import os
import shutil
import random
import glob

# Configuration
BASE_DIR = "public/project_2025_03"
MANIFEST_PATH = "src/remotion/NewNewsVideo/storyManifest.ts"

# Pool (Same as before)
# Pool (Same as before)
SRC_IMAGES = [
    "topic_1_ageha.png", "topic_2_silence.png", "mood_pondering.png", "mood_family_tension.png", 
    "mood_time_passing.png", "mood_shock.png", "scene_buddhist_funeral.png", "scene_gloomy_train.png",
    "scene_tokyo_night_lonely.png", "mood_hysteria_scream.png", "scene_old_shed.png", "scene_walking_away.png",
    "scene_samurai_spirit.png", "scene_samurai_seppuku.png", "topic_3_tokyo.png", 
    "scene_love_escape.png", "scene_mirror_reflection.png", "scene_running_diet.png", "scene_frail_shadow.png",
    "scene_working_late.png", "scene_father_shrink.png", "scene_countryside_house.png", 
    "scene_corrugated_shed.png", "scene_sacrifice_angel.png", "scene_scale_weight.png", 
    "scene_question_confusion.png", "scene_bowing_respect.png", "scene_guts_dignity.png", 
    "scene_calendar_feb_2020.png", "scene_retro_record.png", "scene_wiki_search.png", 
    "scene_forensic_mark.png", "scene_medical_report.png", "scene_golden_awakening.png", "scene_brain_glowing.png",
    # Variants addition
    "topic_1_ageha_v_intense.png", "mood_family_tension_v_sepia.png", "topic_2_silence_v_dark.png", "mood_pondering_v_gray.png", 
    "scene_buddhist_funeral_v_blur.png", "scene_old_shed_v_rust.png", "scene_walking_away_v_mirror.png", "mood_time_passing_v_sepia.png", 
    "mood_time_passing_v_neg.png", "scene_running_diet_v_mirror.png", "scene_samurai_spirit_v_strong.png", "scene_samurai_seppuku_v_bw.png", 
    "mood_shock_v_inv.png", "mood_pondering_v_mirror.png", "mood_pondering_v_dark.png", "mood_pondering_v_dream.png", 
    "scene_love_escape_v_old.png", "scene_tokyo_night_lonely_v_blur.png", "scene_love_escape_v_neon.png", "mood_hysteria_scream_v_scream.png", 
    "mood_pondering_v_mem.png", "scene_mirror_reflection_v_mirror.png", "topic_1_ageha_v_end.png", "mood_time_passing_v_fade.png", 
    "topic_2_silence_v_void.png", "scene_tokyo_night_lonely_v_mono.png",
    # Newest variants (replacing usage below)
    "mood_pondering_v_invert.png", "mood_time_passing_v_pixel.png", "mood_pondering_v_pixel.png", "topic_2_silence_v_loud.png", "scene_tokyo_night_lonely_v_stark.png",
    # Brand new generated images
    "scene_dark_road.png", "scene_hands_praying.png", "scene_broken_mirror.png", "scene_clock_ticking.png", "scene_hospital_hallway.png", "scene_rainy_window.png",
    "scene_drowning_deep_sea.png", "scene_lightning_storm_shock.png",
    # Even newer generated images (Chunk 1-2 duplicates fix)
    "scene_sand_timer_short.png", "mood_hysteria_abstract.png", "scene_tired_father_shadow.png", "scene_train_station_hesitation.png",
    "scene_father_ghost_memory.png", "scene_long_wooden_shed.png", "mood_depressive_thoughts.png", "scene_candle_dying_out.png",
    "scene_drowning_deep_sea.png", "scene_lightning_storm_shock.png",
    # Chunk 1 refills (New batch)
    "mood_pondering_blank.png", "mood_family_tension_dinner.png", "mood_hysteria_scream_warped.png",
    # Chunk 3 refills
    "scene_samurai_seppuku_abstract.png", "mood_father_respect_back.png", "scene_mirror_reflection_truth.png", "mood_escape_running_shadow.png",
    # Chunk 3 refills (Batch 2)
    "mood_pondering_dark_room.png", "scene_samurai_seppuku_bw_ink.png", "mood_pondering_night_window.png", "mood_tokyo_blur_lights.png",
    # Chunk 4 refills
    "scene_angel_sacrifice_glow.png", "scene_medical_report_mark.png", "mood_confusion_questions.png", "scene_forensic_mark_neck.png",
    # Chunk 4 refills (Batch 2)
    "mood_love_escape_abstract.png", "mood_shock_realization.png", "mood_pondering_regret.png", "mood_family_tension_silence.png",
    # Chunk 4 & 5 refills (Batch 3)
    "mood_awakening_energy_gold.png", "mood_father_silent_strength.png", "scene_mind_fast_body_stone.png", "mood_role_reversal_balance.png",
    "mood_insecurity_mirror.png", "scene_endless_spiral_thoughts.png",
    # Chunk 1 & 2 refills (Unique Batch 1)
    "mood_hysteria_chaos_abstract.png", "scene_calendar_shadow_ominous.png", "scene_train_interior_gloomy.png", "scene_tokyo_street_low_angle.png",
    "scene_old_japanese_house_night.png",
    # Chunk 3 & 4 refills (Unique Batch 2)
    "scene_tokyo_night_empty_street.png", "scene_vinyl_record_spinning_close.png",
    # Chunk 4 refills (Unique Batch 3)
    "scene_laptop_search_dark_room.png", "scene_incense_smoke_abstract.png"
]

FALLBACKS = [] # No fallbacks allowed

MAPPING = {
    "chunk_01": [
        "topic_1_ageha.png", "scene_working_late.png", "topic_2_silence.png", "mood_pondering_blank.png", 
        "scene_sand_timer_short.png", "scene_father_shrink.png", "mood_family_tension_dinner.png", "mood_hysteria_scream_warped.png", 
        "mood_hysteria_chaos_abstract.png", "mood_hysteria_abstract.png", "scene_dark_road.png", "scene_tired_father_shadow.png", 
        "scene_calendar_shadow_ominous.png", "scene_calendar_feb_2020.png", "scene_buddhist_funeral.png", "scene_forensic_mark.png", 
        "scene_countryside_house.png", "scene_train_station_hesitation.png", "scene_gloomy_train.png", "scene_tokyo_night_lonely.png"
    ],
    "chunk_02": [
        "scene_train_interior_gloomy.png", "scene_father_ghost_memory.png", "scene_tokyo_street_low_angle.png", "scene_long_wooden_shed.png", 
        "scene_walking_away.png", "scene_old_japanese_house_night.png", "scene_old_shed.png", "scene_corrugated_shed.png", 
        "mood_depressive_thoughts.png", "scene_candle_dying_out.png", "scene_fragile_heart_smoke.png", "scene_hospital_hallway.png", 
        "scene_hikikomori_despair.png", "scene_scale_weight.png", "scene_running_diet.png", "scene_single_apple_diet.png", 
        "scene_frail_shadow.png", "scene_medical_report.png", "scene_withered_tree_thin.png", "scene_clock_ticking.png"
    ],
    "chunk_03": [
         "scene_samurai_spirit.png", "mood_pondering_dark_room.png", "scene_samurai_seppuku_abstract.png", "scene_lightning_storm_shock.png", 
         "scene_guts_dignity.png", "mood_father_respect_back.png", "scene_bowing_respect.png", "scene_hands_praying.png", 
         "scene_samurai_seppuku_bw_ink.png", "scene_drowning_deep_sea.png", "scene_mirror_reflection_truth.png", "mood_pondering_night_window.png", 
         "scene_tokyo_night_empty_street.png", "scene_love_escape.png", "scene_retro_record.png", "scene_wiki_search.png", 
         "mood_escape_running_shadow.png", "scene_rainy_window.png", "topic_3_tokyo.png", "mood_tokyo_blur_lights.png"
    ],
    "chunk_04": [
        "mood_love_escape_abstract.png", "scene_vinyl_record_spinning_close.png", "scene_laptop_search_dark_room.png", "mood_confusion_questions.png", 
        "scene_forensic_mark_neck.png", "scene_medical_report_mark.png", "scene_incense_smoke_abstract.png", "mood_shock_realization.png", 
        "", "", "mood_pondering_regret.png", "scene_angel_sacrifice_glow.png", 
        "", "mood_family_tension_silence.png", "mood_awakening_energy_gold.png", "", 
        "", "scene_broken_mirror.png", "scene_brain_glowing.png", "scene_golden_awakening.png"
    ],
    "chunk_05": [
        "", "", "mood_father_silent_strength.png", "", 
        "", "scene_mind_fast_body_stone.png", "scene_mirror_reflection.png", "", 
        "", "", "mood_role_reversal_balance.png", "", 
        "", "", "", "mood_insecurity_mirror.png", 
        "scene_endless_spiral_thoughts.png", "", "", ""
    ],
     "chunk_06": [
        "", "", "", "",
        "", "", "", "",
        "", "", "", "",
        "", "", "", "",
        "", "", "", ""
    ]
}

def main():
    print("Organizing assets and generating Manifest...")
    
    available_images = [img for img in SRC_IMAGES if os.path.exists(os.path.join(BASE_DIR, img))]
    
    manifest_data = {} # chunk_id -> list of filenames

    for chunk_id in ["chunk_01", "chunk_02", "chunk_03", "chunk_04", "chunk_05", "chunk_06"]:
        target_dir = os.path.join(BASE_DIR, chunk_id)
        
        # Clean directory first to remove old naming convention
        if os.path.exists(target_dir):
            files = glob.glob(os.path.join(target_dir, "*"))
            for f in files:
                os.remove(f)
        else:
            os.makedirs(target_dir)

        assigned_list = MAPPING.get(chunk_id, [])
        slots_needed = 20
        chunk_files = []

        for i in range(slots_needed):
            # Determine source
            if i < len(assigned_list):
                src_name = assigned_list[i]
            else:
                # No mapping for this slot -> Leave empty or handle gracefully in component
                src_name = ""
            
            if src_name:
                # Construct new descriptive filename: scene_01_original_name.png
                base_name = os.path.splitext(src_name)[0]
                ext = os.path.splitext(src_name)[1]
                
                new_filename = f"scene_{str(i+1).zfill(2)}_{base_name}{ext}"
                target_path = os.path.join(target_dir, new_filename)
                src_path = os.path.join(BASE_DIR, src_name)
                
                if os.path.exists(src_path):
                    shutil.copy2(src_path, target_path)
                    print(f"[{chunk_id}] {new_filename}")
                    # Store relative path for manifest
                    chunk_files.append(f"project_2025_03/{chunk_id}/{new_filename}")
                else:
                    print(f"Warning: Source {src_name} not found for {chunk_id} slot {i+1}")
                    chunk_files.append("") # File missing
            else:
                chunk_files.append("") # No assignment

        manifest_data[chunk_id] = chunk_files

    # Write Manifest TS file
    with open(MANIFEST_PATH, "w") as f:
        f.write("// Auto-generated by organize_assets.py\n")
        f.write("export const STORY_MANIFEST: Record<string, string[]> = {\n")
        for cid, files in manifest_data.items():
            f.write(f'  "{cid}": [\n')
            for file_path in files:
                f.write(f'    "{file_path}",\n')
            f.write("  ],\n")
        f.write("};\n")
    
    print(f"Manifest written to {MANIFEST_PATH}")

if __name__ == "__main__":
    main()
