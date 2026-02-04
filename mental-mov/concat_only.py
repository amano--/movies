import os
import subprocess

OUTPUT_DIR = "public/renders"
FINAL_OUTPUT = "voice-diary-full.mp4"
FFMPEG_PATH = "ffmpeg"

def concat_videos(video_files, output_file):
    # Create list file
    list_file = "file_list.txt"
    with open(list_file, "w") as f:
        for v in video_files:
            f.write(f"file '{OUTPUT_DIR}/{v}'\n")
            
    print(f"Concatenating videos using {FFMPEG_PATH}...")
    

    cmd = [
        FFMPEG_PATH, "-f", "concat", "-safe", "0",
        "-i", list_file,
        "-c", "copy",
        "-y", # Overwrite if exists
        f"{OUTPUT_DIR}/{output_file}"
    ]
    subprocess.run(cmd, check=True)
    os.remove(list_file)

def main():
    chunk_files = [
        "chunk_01.mp4",
        "chunk_02.mp4",
        "chunk_03.mp4",
        "chunk_04.mp4",
        "chunk_05.mp4",
        "chunk_06.mp4"
    ]
    
    # Verify all exist
    missing = [f for f in chunk_files if not os.path.exists(os.path.join(OUTPUT_DIR, f))]
    if missing:
        print(f"Missing files: {missing}")
        return
        
    try:
        concat_videos(chunk_files, FINAL_OUTPUT)
        print(f"Full video created at {OUTPUT_DIR}/{FINAL_OUTPUT}")
    except subprocess.CalledProcessError as e:
        print(f"Error concatenating: {e}")

if __name__ == "__main__":
    main()
