#!/usr/bin/env python3
"""
Pip's Midnight Nursery - Voice Generator
----------------------------------------
Generates high quality dialogue audio clips for Pip using the local Piper TTS model.
Model: en_US-hfc_female-medium.onnx
Output: assets/audio/voice/*.wav

Usage:
    python tools/generate_voice.py
    python tools/generate_voice.py --line identity
    python tools/generate_voice.py --list
"""

import os
import sys
import argparse
import subprocess

# Dialogue script for Pip's Midnight Nursery
VOICE_LINES = {
    "first_visit": "Oh! A new dreamer. Welcome to my tiny corner of midnight.",
    "sleepy_stars": "Shhh... the stars are trying to sleep.",
    "anomaly_1": "Hmm? That wasn't supposed to happen...",
    "anomaly_2": "Why is the nursery getting darker?",
    "returning_visit": "You came back! I kept your little spot among the stars warm.",
    "identity": "I'm Pip. Junior Dream Engineer. Professional cloud fluffier. Occasional moon inspector.",
    "lullaby_lab": "Shhh... let's build you a little song out of moonlight.",
    "nightlights": "Pick a little light. Every one keeps a different dream safe.",
    "dream_delivery": "Package ready! Destination selected. Sending one tiny happy dream your way.",
    "naughty_or_nice": "Hmm. Interesting bedtime behavior. The nursery has questions.",
    "transformation": "Oh... you found the other me. Well, bedtime just got interesting.",
    "nightmare_secret": "You weren't supposed to find this little secret.",
    "nightmare_mode": "Welcome to the night shift, dreamer. Don't worry. I only bite bad dreams.",
    "dream_jar": "Let's see what the stars tucked away for you tonight.",
    "guestbook": "A little wish for the nursery! I'll keep it safe right here.",
    "farewell": "Close your eyes, dreamer. I'll leave a little moonlight on for you.",
    "lullaby": "Little moon, sleepy star, dreams can find you where you are. Close your eyes and drift away, I'll keep watch until the day."
}

def find_model_files(model_dir):
    """Locate onnx model and config json."""
    candidate_dirs = [
        model_dir,
        os.path.join(model_dir, "assets", "models"),
        os.path.join(model_dir, "public"),
        os.path.join(model_dir, "models"),
        "."
    ]
    
    onnx_name = "en_US-hfc_female-medium.onnx"
    json_name = "en_US-hfc_female-medium.onnx.json"
    
    for cdir in candidate_dirs:
        mpath = os.path.join(cdir, onnx_name)
        cpath = os.path.join(cdir, json_name)
        if os.path.isfile(mpath) and os.path.isfile(cpath):
            return os.path.abspath(mpath), os.path.abspath(cpath)
            
    return None, None

def generate_line(key, text, model_path, config_path, out_dir):
    """Generate a single voice clip using Piper."""
    out_file = os.path.join(out_dir, f"{key}.wav")
    print(f"[*] Generating '{key}' -> {out_file}...")
    print(f"    Line: \"{text}\"")

    cmd = [
        sys.executable, "-m", "piper",
        "-m", model_path,
        "-c", config_path,
        "-f", out_file
    ]

    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate(input=text)
        if proc.returncode == 0 and os.path.exists(out_file) and os.path.getsize(out_file) > 0:
            print(f"    [+] OK ({os.path.getsize(out_file):,} bytes)")
            return True
        else:
            print(f"    [-] Piper returned code {proc.returncode}")
            if stderr:
                print(f"    Stderr: {stderr.strip()}")
            return False
    except Exception as e:
        print(f"    [-] Failed to execute piper: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Pip's Midnight Nursery Voice Generator")
    parser.add_argument("--line", help="Generate a specific voice line key")
    parser.add_argument("--list", action="store_true", help="List all available voice lines")
    parser.add_argument("--model-dir", default=".", help="Root directory to search for Piper models")
    parser.add_argument("--out-dir", default="assets/audio/voice", help="Output directory for generated WAV files")
    args = parser.parse_args()

    if args.list:
        print("Available voice lines for Pip:")
        for k, v in VOICE_LINES.items():
            print(f"  {k:18} : {v}")
        return

    model_path, config_path = find_model_files(args.model_dir)
    if not model_path:
        print("[-] Error: Could not locate Piper model files (en_US-hfc_female-medium.onnx and .json).")
        print("    Please ensure they exist in assets/models/ or public/")
        sys.exit(1)

    print(f"[+] Found Model : {model_path}")
    print(f"[+] Found Config: {config_path}")

    os.makedirs(args.out_dir, exist_ok=True)

    if args.line:
        if args.line not in VOICE_LINES:
            print(f"[-] Error: Unknown line '{args.line}'. Valid lines: {list(VOICE_LINES.keys())}")
            sys.exit(1)
        generate_line(args.line, VOICE_LINES[args.line], model_path, config_path, args.out_dir)
    else:
        print(f"[+] Generating all {len(VOICE_LINES)} voice lines...")
        success_count = 0
        for k, v in VOICE_LINES.items():
            if generate_line(k, v, model_path, config_path, args.out_dir):
                success_count += 1
        print(f"\n[DONE] Successfully generated {success_count}/{len(VOICE_LINES)} voice lines.")

if __name__ == "__main__":
    main()
