from elevenlabs import save
from elevenlabs.client import ElevenLabs
import os
import argparse
import sys

def generate_speech(text, output_path, voice_id="JBFqnCBsd6RMkjVDRZzb", model_id="eleven_multilingual_v2"):
    """
    Generates speech from text using the ElevenLabs API and saves it to a file.
    
    Args:
        text (str): The text to synthesize.
        output_path (str): The path to save the MP3 file.
        voice_id (str): The ID of the voice to use.
        model_id (str): The ID of the model to use.
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("Error: ELEVENLABS_API_KEY environment variable not set.")
        sys.exit(1)
        
    try:
        client = ElevenLabs(api_key=api_key)
        
        audio = client.generate(
            text=text,
            voice=voice_id,
            model=model_id
        )
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        save(audio, output_path)
        print(f"Successfully saved audio to {output_path}")
        
    except Exception as e:
        print(f"Error generating speech: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate speech using ElevenLabs API")
    parser.add_argument("text", help="Text to convert to speech")
    parser.add_argument("output_path", help="Path to save the output audio file")
    parser.add_argument("--voice_id", default="JBFqnCBsd6RMkjVDRZzb", help="ElevenLabs Voice ID (default: standard voice)")
    parser.add_argument("--model_id", default="eleven_multilingual_v2", help="ElevenLabs Model ID (default: eleven_multilingual_v2)")
    
    args = parser.parse_args()
    
    generate_speech(args.text, args.output_path, args.voice_id, args.model_id)
