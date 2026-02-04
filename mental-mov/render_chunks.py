import os
import subprocess

# Total Frames: ~45330
TOTAL_FRAMES = 45330
FPS = 30
CHUNK_DURATION_MIN = 5
CHUNK_FRAMES = CHUNK_DURATION_MIN * 60 * FPS

# Output dir
OUTPUT_DIR = "public/renders"
FINAL_OUTPUT = "voice-diary-full.mp4"

def render_chunk(start_frame, end_frame, output_filename):
    # npx remotion render src/remotion/NewNewsVideo/index.ts NewNewsVideo output.mp4 --sequence --start-frame=... --end-frame=...
    # But wait, Root usually defines composition. We can override frame range via CLI.
    # We are rendering "NewNewsVideo" composition.
    
    cmd = [
        "npx", "remotion", "render",
        "src/remotion/index.ts",
        "NewNewsVideo",
        f"{OUTPUT_DIR}/{output_filename}",
        f"--frames={start_frame}-{end_frame}"
    ]
    print(f"Rendering {output_filename} (Frames {start_frame}-{end_frame})...")
    subprocess.run(cmd, check=True)

def concat_videos(video_files, output_file):
    # Create list file
    list_file = "file_list.txt"
    with open(list_file, "w") as f:
        for v in video_files:
            f.write(f"file '{OUTPUT_DIR}/{v}'\n")
            
    print("Concatenating videos...")
    cmd = [
        "ffmpeg", "-f", "concat", "-safe", "0",
        "-i", list_file,
        "-c", "copy",
        f"{OUTPUT_DIR}/{output_file}"
    ]
    subprocess.run(cmd, check=True)
    os.remove(list_file)

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    chunk_files = []
    
    current_frame = 0
    chunk_idx = 1
    
    while current_frame < TOTAL_FRAMES:
        end_frame = min(current_frame + CHUNK_FRAMES - 1, TOTAL_FRAMES - 1)
        filename = f"chunk_{chunk_idx:02d}.mp4"
        
        # Render
        try:
            render_chunk(current_frame, end_frame, filename)
            chunk_files.append(filename)
        except subprocess.CalledProcessError as e:
            print(f"Error rendering chunk {chunk_idx}: {e}")
            return
            
        current_frame = end_frame + 1
        chunk_idx += 1
        
    # Concat
    try:
        concat_videos(chunk_files, FINAL_OUTPUT)
        print(f"Full video created at {OUTPUT_DIR}/{FINAL_OUTPUT}")
    except subprocess.CalledProcessError as e:
        print(f"Error concatenating: {e}")

if __name__ == "__main__":
    main()
