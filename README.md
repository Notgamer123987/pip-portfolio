# Pip's Midnight Nursery 🌙
### haX.baby — Baby's First Website | Track 1 — Official Pip
**Target Level:** Boss Level / Tier 3 — Legendary

> *"Sweet Dreams for the Good. Curious Nightmares for the Rest."*

Welcome to the official digital sanctuary of **Pip, the Junior Dream Engineer**. Perched atop Cloud 9½ beside the silver crescent moon, Pip weaves dreams for sleepy souls and gently manages the midnight shift when curious nightmares stir.

---

## 🌟 What's New & Boss-Tier Features

1. **⚡ Secret Easter Egg Transformation Chamber (Cinematic Reveal)**
   - Hidden seamlessly behind multiple subtle, discoverable storytelling triggers:
     - **The Silver Pin**: A delicate, glowing key pin pinned to Pip's nursery collar (`#secret-key-trigger`).
     - **Triple-Tap Interaction**: Triple-tapping or triple-clicking slumbering Pip triggers an emergency frequency wake-up.
     - **Forbidden Lantern**: In the Nightlights gallery, inspecting the 5th classified lamp unlocks the direct *Breach Chamber* bypass.
     - **Bedtime Terminal Overrides**: Entering secret command codes (`nightmare`, `shift3`, `mischief`, `chamber`, `records`, `whoami`, `secret`, `hax`).
   - **Swirling Black Mist Vortex**: When unlocked, a dynamic HTML5 Canvas particle vortex of dark swirling mist and purple stardust embers completely shrouds Pip before dramatically revealing his transformed appearance.
   - **183 High-Resolution Transformation Frames**: Plays through all 183 rendered transformation frames at a silky ~30fps, synchronized with `transform.wav` and Piper voice narration.
   - **Chamber Control Deck**: Includes frame counter (`FRAME 001 / 183`), phase badges (`PASTEL FLUFF` ➔ `SHIFT RESONANCE` ➔ `NIGHT SHIFT AWAKENED`), manual scrub slider, replay button, and theme selection buttons (`Embrace the Night Shift` or `Return to Dream Mode`).
   - Clean escape via corner `✕` or `Escape` key without interrupting the natural flow of the page.

2. **🌑 Nightmare Mode: Full-Website Atmosphere Shift**
   - When the transformation activates, the **entire website** shifts gradually from the sweet pastel dream aesthetic into a mysterious midnight nightmare world over a smooth 1.2s transition.
   - Pastel pink and cream surfaces fade into deep midnight purple (`#0a0812`), obsidian black (`#13101e`), and restrained crimson accents (`#ff2a5f`).
   - The background darkens with an atmospheric mist overlay (`.nightmare-atmosphere`) spreading outward from Pip's character container.
   - Ambient celestial stars and floating stardust particles transform into glowing crimson and violet embers.
   - Smooth, coordinated restoration to Dream Mode when exiting.

3. **💬 Pip's Living Dialogue Engine**
   - Pip features an evolving dialogue sequence rendered with a subtle typewriter cadence and synchronized Piper voice narration:
     - **Dream Mode**: *"Oh! A new dreamer. Welcome to my tiny corner of midnight."* & *"Shhh... the stars are trying to sleep."*
     - **Anomaly Begins**: *"Hmm? That wasn't supposed to happen..."* & *"Why is the nursery getting darker?"*
     - **Nightmare Mode**: *"Oh... you found the other me."*, *"Well, bedtime just got interesting."*, & *"You weren't supposed to find this little secret."*
   - Clicking Pip or the speaker button cycles through contextual lines for the active theme.

4. **📱 Precision Responsive Mobile Header**
   - Handcrafted for compact screens (tested at 320px, 375px, 430px, and 768px):
     - Site title cleanly formatted with zero awkward wrapping or clipping.
     - Controls reorganized into comfortable 44 × 44 CSS pixel touch targets with accessible aria labels and tooltips.
     - Header padding optimized to avoid taking up unnecessary vertical space (~52px compact height).
     - Sticky scroll clearance ensures header never obstructs section titles or content during navigation jumps.
     - Fully responsive across both Dream Mode and Nightmare Mode.

5. **🦄 3D Unicorn Carousel Sound Box (Three.js)**
   - Renders the official 3D clay-styled unicorn music box (`assets/models/lullaby_box.glb`) in real time!
   - Interactive 360° orbit rotation with mouse drag or touch.
   - Click **"Wind Up Music Box"** to spin the carousel, wind up the spring key, and release floating musical notes (♪ ♫ ★) and celestial sparkles rising into the air!
   - Plays the soothing relaxing lullaby audio loop (`assets/audio/music/relaxing_lullaby.mp3`) starting from `0:00`, with instant restart, pause toggle, audio scrubber, and time display.
   - 100% resilient offline fallback using high-res 3D artwork (`assets/images/lullaby_box.png`) if WebGL is unavailable.

6. **👁️ Interactive Cursor-Tracking Eyes & Dream Parallax**
   - Pip's dark glowing eyes in the Hero section **track the visitor's cursor across the entire screen in real time** using smooth spring physics and symmetrical pupil offsets.
   - Natural blinking loop every few seconds, plus winking/giggle reactions when clicked.
   - When in Nightmare Mode, glowing crimson **X-eyes** also track the cursor with dramatic red flaring!
   - **Dream-Reactive Ambient Parallax**: Multi-layered background stars and cloud puffs gently drift in response to cursor movement via lerp interpolation.
   - **Cinematic Scroll Storytelling**: Each section smoothly glides into focus with scroll-triggered storytelling reveals.

---

## 🚀 Quick Start (Running Locally)

This project is built with framework-free web technologies (Vanilla HTML5, modern CSS3 with custom properties, Three.js 3D engine, and modular vanilla JavaScript). It requires **zero Node.js dependencies, zero build steps, and zero external APIs**.

### Option A: Python Built-in Server (Recommended)
Open a terminal in the project directory and run:

```bash
python -m http.server 8000
```
Then open your browser to:
👉 **[http://localhost:8000](http://localhost:8000)**

### Option B: VS Code Live Server
1. Open this folder in VS Code.
2. Right click `index.html` and click **"Open with Live Server"**.

---

## 📁 Project Directory Structure

```text
pips-midnight-nursery/
├── index.html                   # Master semantic webpage with all sections
├── styles.css                   # Handcrafted early-2000s plush & terminal styling
├── script.js                    # Interactive engine (Web Audio, Eye-tracking, 3D Sound Box, Scroll scrub)
├── README.md                    # Project documentation & guide
├── assets/
│   ├── js/                      # Local Three.js libraries (100% offline support)
│   │   ├── three.min.js
│   │   ├── GLTFLoader.js
│   │   └── OrbitControls.js
│   ├── images/
│   │   ├── pip-cute.png         # Cute Pip plush character artwork
│   │   ├── pip-nightmare.png    # Nightmare Pip character artwork
│   │   ├── lullaby_box.png      # Handcrafted 3D unicorn music box artwork
│   │   └── favicon.svg          # Handcrafted SVG favicon
│   ├── models/
│   │   ├── lullaby_box.glb      # 3D Unicorn Carousel Music Box model
│   │   ├── en_US-hfc_female-medium.onnx        # Piper neural voice model
│   │   └── en_US-hfc_female-medium.onnx.json   # Model configuration
│   ├── transformation/
│   │   ├── frames/              # 183-frame transformation sequence
│   │   │   ├── ezgif-frame-001.jpg
│   │   │   └── ... ezgif-frame-183.jpg
│   │   └── transformation.mp4   # H.264 video compiled from frames
│   └── audio/
│       ├── music/
│       │   └── relaxing_lullaby.mp3 # Soothing womb & water lullaby soundtrack
│       ├── voice/               # 13 Piper-generated dialogue WAV files
│       │   ├── first_visit.wav
│       │   ├── returning_visit.wav
│       │   ├── identity.wav
│       │   ├── lullaby_lab.wav
│       │   ├── nightlights.wav
│       │   ├── dream_delivery.wav
│       │   ├── naughty_or_nice.wav
│       │   ├── transformation.wav
│       │   ├── nightmare_mode.wav
│       │   ├── dream_jar.wav
│       │   ├── guestbook.wav
│       │   ├── farewell.wav
│       │   └── lullaby.wav
│       └── sounds/              # 16-bit 44.1kHz sound effects
│           ├── click.wav
│           ├── sparkle.wav
│           ├── giggle.wav
│           ├── delivery.wav
│           └── transform.wav
└── tools/
    ├── generate_voice.py        # CLI script to re-generate Piper dialogue
    └── generate_sounds.py       # Synthesizer script for WAV sound effects
```

---

## 🎙️ Piper Voice Generation

All 13 exact voice lines are generated and bundled. To customize or re-render:

```bash
python tools/generate_voice.py
```

The site also includes automatic speech synthesis fallbacks and a master mute button (`🔊 / 🔇`).

---

## 📜 Credits

- **Character Identity & Lore:** Pip the Junior Dream Engineer
- **Platform:** haX.baby Track 1 — Official Pip
- **Engineered by:** Senior Creative Director & Interactive Storytelling Specialist
