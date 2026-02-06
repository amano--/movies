---
name: ElevenLabs Text-to-Speech
description: Generate high-quality speech from text using the ElevenLabs API.
---

# ElevenLabs Text-to-Speech Skill

This skill allows you to synthesize speech from text using ElevenLabs' realistic AI voices.

## Prerequisites

1.  **Python Environment**: Ensure you have a Python environment set up.
2.  **Installation**: Install the `elevenlabs` package.
    ```bash
    pip install elevenlabs
    ```
3.  **API Key**: You must have an `ELEVENLABS_API_KEY` set in your environment variables.

## Usage

You can use the `speech.py` script to generate audio files.

### Command

```bash
python3 skills/elevenlabs/speech.py "Your text here" path/to/output.mp3 --voice_id <VOICE_ID>
```

### Arguments

- `text` (required): The text you want to convert to speech.
- `output_path` (required): The path where the MP3 file will be saved.
- `--voice_id` (optional): The ID of the specific voice to use.
- `--model_id` (optional): The model ID to use (default: `eleven_multilingual_v2`).

## Examples

**Basic Usage:**

```bash
python3 skills/elevenlabs/speech.py "Hello, this is a test of the ElevenLabs skill." output/test_audio.mp3
```

**Using a Specific Voice:**

```bash
python3 skills/elevenlabs/speech.py "I am speaking with a specific voice." output/custom_voice.mp3 --voice_id Josh
```
