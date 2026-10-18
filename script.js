/**
 * ============================================================================
 * PIP'S MIDNIGHT NURSERY — MASTER JAVASCRIPT ENGINE (ENHANCED)
 * Junior Dream Engineer • haX.baby Track 1
 * Boss Level / Tier 3 — Legendary
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. STORAGE & STATE MANAGEMENT (Pip's Memory)
     -------------------------------------------------------------------------- */
  const STORAGE_KEYS = {
    VISITOR_COUNT: 'pip_visitor_count',
    FIRST_VISIT: 'pip_first_visit',
    LAST_VISIT: 'pip_last_visit',
    THEME: 'pip_theme',
    DISCOVERED_TRANSFORMATION: 'pip_discovered_transformation',
    FAVORITE_LIGHT: 'pip_favorite_light',
    DREAMS_DELIVERED: 'pip_dreams_delivered',
    WISHES: 'pip_wishes',
    MUTED: 'pip_sound_muted',
    LULLABY_MOOD: 'pip_lullaby_mood'
  };

  const Memory = {
    isAvailable: (function () {
      try {
        const testKey = '__pip_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        console.warn('LocalStorage unavailable. Falling back to in-memory store.');
        return false;
      }
    })(),

    _fallbackStore: {},

    get(key, defaultValue = null) {
      if (this.isAvailable) {
        try {
          const val = localStorage.getItem(key);
          return val !== null ? JSON.parse(val) : defaultValue;
        } catch (e) {
          return defaultValue;
        }
      }
      return this._fallbackStore[key] !== undefined ? this._fallbackStore[key] : defaultValue;
    },

    set(key, value) {
      if (this.isAvailable) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return;
        } catch (e) {}
      }
      this._fallbackStore[key] = value;
    },

    remove(key) {
      if (this.isAvailable) {
        try {
          localStorage.removeItem(key);
          return;
        } catch (e) {}
      }
      delete this._fallbackStore[key];
    },

    clearAll() {
      if (this.isAvailable) {
        try {
          localStorage.clear();
        } catch (e) {}
      }
      this._fallbackStore = {};
    }
  };

  // Global Application State
  const AppState = {
    theme: Memory.get(STORAGE_KEYS.THEME, 'dream'),
    isMuted: Memory.get(STORAGE_KEYS.MUTED, false),
    visitorCount: 1,
    isReturningVisitor: false,
    discoveredTransformation: Memory.get(STORAGE_KEYS.DISCOVERED_TRANSFORMATION, false),
    favoriteLight: Memory.get(STORAGE_KEYS.FAVORITE_LIGHT, null),
    dreamsDelivered: Memory.get(STORAGE_KEYS.DREAMS_DELIVERED, 104287),
    currentLullabyMood: Memory.get(STORAGE_KEYS.LULLABY_MOOD, 'cloud'),
    activeVoiceAudio: null,
    audioContext: null
  };

  function initVisitorMemory() {
    const prevCount = Memory.get(STORAGE_KEYS.VISITOR_COUNT, 0);
    const now = new Date().toISOString();

    if (prevCount === 0) {
      AppState.visitorCount = 1;
      AppState.isReturningVisitor = false;
      Memory.set(STORAGE_KEYS.FIRST_VISIT, now);
      Memory.set(STORAGE_KEYS.VISITOR_COUNT, 1);
    } else {
      AppState.visitorCount = prevCount + 1;
      AppState.isReturningVisitor = true;
      Memory.set(STORAGE_KEYS.VISITOR_COUNT, AppState.visitorCount);
    }
    Memory.set(STORAGE_KEYS.LAST_VISIT, now);
  }
  initVisitorMemory();

  /* --------------------------------------------------------------------------
     2. AUDIO ENGINE (Web Audio API Synthesizer & Piper Voice Manager)
     -------------------------------------------------------------------------- */
  const VOICE_FILES = {
    first_visit: 'assets/audio/voice/first_visit.wav',
    sleepy_stars: 'assets/audio/voice/sleepy_stars.wav',
    anomaly_1: 'assets/audio/voice/anomaly_1.wav',
    anomaly_2: 'assets/audio/voice/anomaly_2.wav',
    returning_visit: 'assets/audio/voice/returning_visit.wav',
    identity: 'assets/audio/voice/identity.wav',
    lullaby_lab: 'assets/audio/voice/lullaby_lab.wav',
    nightlights: 'assets/audio/voice/nightlights.wav',
    dream_delivery: 'assets/audio/voice/dream_delivery.wav',
    naughty_or_nice: 'assets/audio/voice/naughty_or_nice.wav',
    transformation: 'assets/audio/voice/transformation.wav',
    nightmare_secret: 'assets/audio/voice/nightmare_secret.wav',
    nightmare_mode: 'assets/audio/voice/nightmare_mode.wav',
    dream_jar: 'assets/audio/voice/dream_jar.wav',
    guestbook: 'assets/audio/voice/guestbook.wav',
    farewell: 'assets/audio/voice/farewell.wav',
    lullaby: 'assets/audio/voice/lullaby.wav'
  };

  const VOICE_TRANSCRIPTS = {
    first_visit: "Oh! A new dreamer. Welcome to my tiny corner of midnight.",
    sleepy_stars: "Shhh... the stars are trying to sleep.",
    anomaly_1: "Hmm? That wasn't supposed to happen...",
    anomaly_2: "Why is the nursery getting darker?",
    returning_visit: "You came back! I kept your little spot among the stars warm.",
    identity: "I'm Pip. Junior Dream Engineer. Professional cloud fluffier. Occasional moon inspector.",
    lullaby_lab: "Shhh... let's build you a little song out of moonlight.",
    nightlights: "Pick a little light. Every one keeps a different dream safe.",
    dream_delivery: "Package ready! Destination selected. Sending one tiny happy dream your way.",
    naughty_or_nice: "Hmm. Interesting bedtime behavior. The nursery has questions.",
    transformation: "Oh... you found the other me. Well, bedtime just got interesting.",
    nightmare_secret: "You weren't supposed to find this little secret.",
    nightmare_mode: "Welcome to the night shift, dreamer. Don't worry. I only bite bad dreams.",
    dream_jar: "Let's see what the stars tucked away for you tonight.",
    guestbook: "A little wish for the nursery! I'll keep it safe right here.",
    farewell: "Close your eyes, dreamer. I'll leave a little moonlight on for you.",
    lullaby: "Little moon, sleepy star, dreams can find you where you are. Close your eyes and drift away, I'll keep watch until the day."
  };

  const SOUND_FILES = {
    click: 'assets/audio/sounds/click.wav',
    sparkle: 'assets/audio/sounds/sparkle.wav',
    giggle: 'assets/audio/sounds/giggle.wav',
    delivery: 'assets/audio/sounds/delivery.wav',
    transform: 'assets/audio/sounds/transform.wav'
  };

  function getAudioContext() {
    if (!AppState.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        AppState.audioContext = new AudioCtx();
      }
    }
    if (AppState.audioContext && AppState.audioContext.state === 'suspended') {
      AppState.audioContext.resume().catch(() => {});
    }
    return AppState.audioContext;
  }

  const SynthFX = {
    playClick() {
      if (AppState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    },

    playSparkle() {
      if (AppState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [1046.50, 1318.51, 1567.98, 1975.53, 2093.00, 2637.02];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = ctx.currentTime + idx * 0.06;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.45);
        });
      } catch (e) {}
    },

    playGiggle() {
      if (AppState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = ctx.currentTime + i * 0.12;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(700 + i * 80, start);
          osc.frequency.exponentialRampToValueAtTime(950 + i * 80, start + 0.09);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.11);
        }
      } catch (e) {}
    },

    playDeliveryChime() {
      if (AppState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const chords = [587.33, 739.99, 880.00, 1174.66];
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = ctx.currentTime + 0.2 + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.85);
        });
      } catch (e) {}
    },

    playTransformDrone() {
      if (AppState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 2.0);
        osc2.frequency.setValueAtTime(66.5, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(142.5, ctx.currentTime + 2.0);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 2.3);
        osc2.stop(ctx.currentTime + 2.3);
      } catch (e) {}
    }
  };

  function playSound(type) {
    if (AppState.isMuted) return;
    const file = SOUND_FILES[type];
    if (file) {
      const audio = new Audio(file);
      audio.volume = 0.6;
      audio.play().catch(() => triggerSynthFallback(type));
    } else {
      triggerSynthFallback(type);
    }
  }

  function triggerSynthFallback(type) {
    switch (type) {
      case 'click': SynthFX.playClick(); break;
      case 'sparkle': SynthFX.playSparkle(); break;
      case 'giggle': SynthFX.playGiggle(); break;
      case 'delivery': SynthFX.playDeliveryChime(); break;
      case 'transform': SynthFX.playTransformDrone(); break;
    }
  }

  let lastSpokenLine = null;

  function updateSpeakerButtons(isPlaying) {
    const heroSpeaker = document.getElementById('btn-speak-hero');
    if (heroSpeaker) {
      if (isPlaying) {
        heroSpeaker.classList.add('playing');
        heroSpeaker.setAttribute('aria-label', "Pip is speaking (click to restart from 0:00)");
      } else {
        heroSpeaker.classList.remove('playing');
        heroSpeaker.setAttribute('aria-label', "Replay Pip's Voice");
      }
    }
  }

  function playVoice(lineKey) {
    if (AppState.isMuted) return;

    if (AppState.activeVoiceAudio) {
      try {
        AppState.activeVoiceAudio.pause();
        AppState.activeVoiceAudio.currentTime = 0;
      } catch (e) {}
      AppState.activeVoiceAudio = null;
    }
    window.speechSynthesis && window.speechSynthesis.cancel();
    updateSpeakerButtons(false);

    lastSpokenLine = lineKey;
    updateAudioHUD(lineKey, true);

    const filePath = VOICE_FILES[lineKey];
    if (filePath) {
      const audio = new Audio(filePath);
      audio.volume = 0.9;
      AppState.activeVoiceAudio = audio;

      audio.onplay = () => {
        updateAudioHUD(lineKey, true);
        updateSpeakerButtons(true);
      };

      audio.onpause = () => {
        if (AppState.activeVoiceAudio === audio) {
          updateAudioHUD(lineKey, false);
          updateSpeakerButtons(false);
        }
      };

      audio.onended = () => {
        AppState.activeVoiceAudio = null;
        updateAudioHUD(lineKey, false);
        updateSpeakerButtons(false);
      };

      audio.onerror = (err) => {
        console.warn(`Voice file for ${lineKey} failed, falling back to speech synthesis:`, err);
        updateSpeakerButtons(false);
        fallbackSpeechSynthesis(lineKey);
      };

      // Restart from 0:00
      try {
        audio.currentTime = 0;
      } catch (e) {}

      audio.play().catch((err) => {
        console.warn(`Audio play prevented for ${lineKey}:`, err);
        updateSpeakerButtons(false);
        fallbackSpeechSynthesis(lineKey);
      });
    } else {
      fallbackSpeechSynthesis(lineKey);
    }
  }

  function fallbackSpeechSynthesis(lineKey) {
    const text = VOICE_TRANSCRIPTS[lineKey];
    if (!text || !window.speechSynthesis) {
      updateAudioHUD(lineKey, false);
      updateSpeakerButtons(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.35;
    utter.onstart = () => {
      updateSpeakerButtons(true);
    };
    utter.onend = () => {
      AppState.activeVoiceAudio = null;
      updateAudioHUD(lineKey, false);
      updateSpeakerButtons(false);
    };
    utter.onerror = () => {
      AppState.activeVoiceAudio = null;
      updateAudioHUD(lineKey, false);
      updateSpeakerButtons(false);
    };
    window.speechSynthesis.speak(utter);
  }

  function stopAllAudio() {
    if (AppState.activeVoiceAudio) {
      try {
        AppState.activeVoiceAudio.pause();
        AppState.activeVoiceAudio.currentTime = 0;
      } catch (e) {}
      AppState.activeVoiceAudio = null;
    }
    window.speechSynthesis && window.speechSynthesis.cancel();
    updateSpeakerButtons(false);
    Lullaby3DBox.pauseMusic();
    updateAudioHUD('Muted', false);
  }

  function updateAudioHUD(trackName, isPlaying) {
    const label = document.getElementById('audio-track-label');
    const bars = document.getElementById('audio-wave-bars');
    if (label) {
      label.textContent = isPlaying ? `Playing: ${trackName}` : 'Ambient Starlight';
    }
    if (bars) {
      if (isPlaying) bars.classList.add('playing');
      else bars.classList.remove('playing');
    }
  }

  function showToast(message, icon = '✦') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }

  /* --------------------------------------------------------------------------
     3. PIP CHARACTER NATURAL MOTION & 3D PERSPECTIVE INTERACTION
     Pip's glowing eyes are rendered naturally in the character illustration
     with perfect symmetry, matching sizes, and identical vertical alignment.
     CharacterMotion tilts the face and eyes as a cohesive unit toward the cursor.
     -------------------------------------------------------------------------- */
  const CharacterMotion = {
    wrapper: null,
    characterImg: null,
    targetRotX: 0,
    targetRotY: 0,
    targetTransX: 0,
    targetTransY: 0,
    currentRotX: 0,
    currentRotY: 0,
    currentTransX: 0,
    currentTransY: 0,
    rafId: null,

    init() {
      this.wrapper = document.getElementById('hero-character-wrapper');
      this.characterImg = document.getElementById('pip-hero-img');
      if (!this.wrapper || !this.characterImg) return;

      // Honor user's reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Track cursor coordinates across entire window
      window.addEventListener('mousemove', (e) => {
        this.updateMotion(e.clientX, e.clientY);
      }, { passive: true });

      // Gently reset to neutral when mouse leaves the document
      document.addEventListener('mouseleave', () => {
        this.targetRotX = 0;
        this.targetRotY = 0;
        this.targetTransX = 0;
        this.targetTransY = 0;
      });

      // Joyful click bounce reaction
      this.wrapper.addEventListener('click', () => {
        this.bounce();
      });

      // Start smooth physics render loop
      this.render();
    },

    updateMotion(mouseX, mouseY) {
      if (!this.wrapper) return;
      const rect = this.wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;

      // Subtle, tasteful 3D rotation bounds (max 8 degrees tilt, max 6px translation)
      const maxAngle = 8;
      const maxTranslate = 6;

      const normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth / 2)));
      const normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight / 2)));

      this.targetRotY = normX * maxAngle;
      this.targetRotX = -normY * maxAngle;
      this.targetTransX = normX * maxTranslate;
      this.targetTransY = normY * maxTranslate;
    },

    bounce() {
      if (!this.characterImg) return;
      this.characterImg.classList.remove('pip-bounce');
      // Trigger reflow to restart CSS keyframe animation
      void this.characterImg.offsetWidth;
      this.characterImg.classList.add('pip-bounce');
      playSound('giggle');
    },

    render() {
      // Smooth lerp (0.1 interpolation factor)
      this.currentRotX += (this.targetRotX - this.currentRotX) * 0.1;
      this.currentRotY += (this.targetRotY - this.currentRotY) * 0.1;
      this.currentTransX += (this.targetTransX - this.currentTransX) * 0.1;
      this.currentTransY += (this.targetTransY - this.currentTransY) * 0.1;

      if (this.characterImg) {
        this.characterImg.style.transform = `perspective(800px) rotateX(${this.currentRotX.toFixed(2)}deg) rotateY(${this.currentRotY.toFixed(2)}deg) translate3d(${this.currentTransX.toFixed(1)}px, ${this.currentTransY.toFixed(1)}px, 0)`;
      }

      this.rafId = requestAnimationFrame(() => this.render());
    }
  };

  /* --------------------------------------------------------------------------
     4. PIP'S LIVING DIALOGUE ENGINE
     Evolves through Dream Mode, Anomaly Phase, and Nightmare Mode with subtle
     typewriter cadence and synchronized Piper voice narration.
     -------------------------------------------------------------------------- */
  const PipDialogue = {
    heroTextEl: null,
    modalTextEl: null,
    typeTimer: null,
    isTyping: false,
    lineIndex: 0,

    dreamLines: [
      { text: "Oh! A new dreamer. Welcome to my tiny corner of midnight.", voice: "first_visit" },
      { text: "Shhh... the stars are trying to sleep.", voice: "sleepy_stars" }
    ],

    nightmareLines: [
      { text: "Oh... you found the other me.", voice: "transformation" },
      { text: "Well, bedtime just got interesting.", voice: "transformation" },
      { text: "You weren't supposed to find this little secret.", voice: "nightmare_secret" }
    ],

    init() {
      this.heroTextEl = document.getElementById('hero-dialogue-text');
      this.modalTextEl = document.getElementById('trans-speech');
    },

    type(text, voiceKey = null, speed = 22, onComplete = null) {
      if (this.typeTimer) {
        clearTimeout(this.typeTimer);
        this.typeTimer = null;
      }

      if (voiceKey && !AppState.isMuted) {
        playVoice(voiceKey);
      }

      const updateTargets = (str) => {
        if (this.heroTextEl) this.heroTextEl.textContent = `“${str}”`;
        if (this.modalTextEl) this.modalTextEl.textContent = `“${str}”`;
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updateTargets(text);
        this.isTyping = false;
        if (onComplete) onComplete();
        return;
      }

      let i = 0;
      updateTargets('');
      this.isTyping = true;

      const typeStep = () => {
        i++;
        updateTargets(text.substring(0, i));
        if (i < text.length) {
          this.typeTimer = setTimeout(typeStep, speed);
        } else {
          this.isTyping = false;
          if (onComplete) onComplete();
        }
      };
      typeStep();
    },

    cycle() {
      if (AppState.theme === 'nightmare') {
        const item = this.nightmareLines[this.lineIndex % this.nightmareLines.length];
        this.lineIndex++;
        this.type(item.text, item.voice, 20);
      } else {
        const item = this.dreamLines[this.lineIndex % this.dreamLines.length];
        this.lineIndex++;
        this.type(item.text, item.voice, 22);
      }
    }
  };

  /* --------------------------------------------------------------------------
     5. SECRET CINEMATIC TRANSFORMATION (Direct In-Page Easter Egg)
     Seamlessly shifts the entire nursery between Dream Mode and Nightmare Mode
     directly on the page without intrusive popup modals.
     -------------------------------------------------------------------------- */
  const SecretTransformationChamber = {
    isTransforming: false,

    init() {
      PipDialogue.init();
    },

    toggle() {
      if (this.isTransforming) return;

      if (AppState.theme === 'nightmare') {
        // Return safely to Dream Mode!
        this.isTransforming = true;
        playSound('sparkle');
        playVoice('identity');
        applyTheme('dream');

        const charWrapper = document.getElementById('hero-character-wrapper');
        if (charWrapper) {
          charWrapper.classList.add('shiver');
          setTimeout(() => charWrapper.classList.remove('shiver'), 400);
        }

        showToast('Returned safely to Dream Mode 🌸', '✨');
        if (PipDialogue) {
          PipDialogue.type("Oh! You turned the silver key. Welcome back to sweet dreams, little dreamer.", null, 20, () => {
            this.isTransforming = false;
          });
        } else {
          this.isTransforming = false;
        }
      } else {
        // Shift to Nightmare Mode!
        this.isTransforming = true;
        AppState.discoveredTransformation = true;
        Memory.set(STORAGE_KEYS.DISCOVERED_TRANSFORMATION, true);

        const charWrapper = document.getElementById('hero-character-wrapper');
        const heroTitle = document.getElementById('hero-title');
        if (charWrapper) charWrapper.classList.add('shiver');
        if (heroTitle) heroTitle.classList.add('glitch-anomaly');
        playSound('sparkle');

        PipDialogue.type("Hmm? That wasn't supposed to happen...", "anomaly_1", 24, () => {
          setTimeout(() => {
            if (charWrapper) charWrapper.classList.remove('shiver');
            if (heroTitle) heroTitle.classList.remove('glitch-anomaly');

            applyTheme('nightmare');
            playSound('transform');
            playVoice('nightmare_secret');

            showToast('🌙 Night Shift Activated! (Click Pip\'s key to return to Dream Mode)', '🖤');
            PipDialogue.type("Why is the nursery getting darker? Well... bedtime just got interesting.", "anomaly_2", 22, () => {
              this.isTransforming = false;
            });
          }, 800);
        });
      }
    },

    open() {
      this.toggle();
    },

    close(theme = null) {
      if (theme) applyTheme(theme);
      this.isTransforming = false;
    }
  };

  /* --------------------------------------------------------------------------
     5. 3D UNICORN SOUND BOX & RELAXING LULLABY PLAYER
     -------------------------------------------------------------------------- */
  const Lullaby3DBox = {
    scene: null,
    camera: null,
    renderer: null,
    model: null,
    mixer: null,
    audioElement: null,
    isPlayingMusic: false,
    isWoundUp: false,
    springTension: 100,
    sparkleContainer: null,
    sparkleInterval: null,

    init() {
      this.sparkleContainer = document.getElementById('box-sparkles-container');

      // Initialize Three.js 3D Viewport
      this.initThreeScene();

      // Audio Player initialization
      this.initRelaxingAudio();

      // Winding key button
      const windBtn = document.getElementById('btn-wind-box');
      windBtn && windBtn.addEventListener('click', () => {
        this.windUp();
      });

      // Tine keys (Music Box Chimes)
      this.initChimeKeys();
    },

    initThreeScene() {
      const canvas = document.getElementById('lullaby-box-3d-canvas');
      const fallback = document.getElementById('box-3d-fallback');
      const container = document.getElementById('box-3d-container');

      if (!canvas || typeof THREE === 'undefined') {
        console.warn('Three.js not available, showing 3D fallback image.');
        if (fallback) fallback.style.display = 'flex';
        return;
      }

      try {
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 420;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 0.5, 2.2);

        this.renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Soft Studio Lighting
        const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
        keyLight.position.set(2, 4, 3);
        this.scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xffb7d2, 0.8);
        rimLight.position.set(-3, 2, -2);
        this.scene.add(rimLight);

        // OrbitControls
        let controls = null;
        if (typeof THREE.OrbitControls !== 'undefined') {
          controls = new THREE.OrbitControls(this.camera, canvas);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.maxPolarAngle = Math.PI / 2 + 0.1;
          controls.minDistance = 1.2;
          controls.maxDistance = 3.5;
        }

        // Load .GLB Model
        if (typeof THREE.GLTFLoader !== 'undefined') {
          const loader = new THREE.GLTFLoader();
          loader.load(
            'assets/models/lullaby_box.glb',
            (gltf) => {
              this.model = gltf.scene;
              // Center model
              this.model.position.set(0, -0.3, 0);
              this.model.scale.set(1.15, 1.15, 1.15);
              this.scene.add(this.model);
              console.log('🦄 3D Unicorn Lullaby Box loaded successfully.');
            },
            undefined,
            (error) => {
              console.warn('Could not load GLB model:', error);
              if (fallback) fallback.style.display = 'flex';
            }
          );
        } else {
          if (fallback) fallback.style.display = 'flex';
        }

        // Render animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          // Rotate turntable when music is playing
          if (this.model && this.isPlayingMusic) {
            this.model.rotation.y += 0.012;
          } else if (this.model) {
            this.model.rotation.y += 0.002; // Gentle idle float
          }

          if (controls) controls.update();
          this.renderer.render(this.scene, this.camera);
        };
        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        });

      } catch (err) {
        console.warn('WebGL init error:', err);
        if (fallback) fallback.style.display = 'flex';
      }
    },

    initRelaxingAudio() {
      // Audio element playing user's relaxing music
      this.audioElement = new Audio('assets/audio/music/relaxing_lullaby.mp3');
      this.audioElement.loop = true;
      this.audioElement.volume = 0.75;

      const playBtn = document.getElementById('btn-play-relaxing');
      const pauseBtn = document.getElementById('btn-pause-relaxing');
      const playIcon = document.getElementById('btn-play-relaxing-icon');
      const playText = document.getElementById('btn-play-relaxing-text');
      const progressFill = document.getElementById('audio-progress-fill');
      const progressContainer = document.getElementById('audio-progress-container');
      const curTime = document.getElementById('audio-cur-time');
      const totTime = document.getElementById('audio-tot-time');

      // Sync UI state strictly based on real audio playback events
      this.audioElement.addEventListener('play', () => {
        this.isPlayingMusic = true;
        if (playIcon) playIcon.textContent = '🔄';
        if (playText) playText.textContent = 'Restart (0:00)';
        if (playBtn) playBtn.title = 'Restart lullaby from 0:00';
        if (pauseBtn) pauseBtn.style.display = 'inline-flex';
        this.startSparkleNotes();
        updateAudioHUD('Soothing Relaxing Lullaby', true);
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlayingMusic = false;
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Play Lullaby';
        if (playBtn) playBtn.title = 'Play lullaby from beginning';
        if (pauseBtn) pauseBtn.style.display = 'none';
        this.stopSparkleNotes();
        updateAudioHUD('Ambient Starlight', false);
      });

      this.audioElement.addEventListener('ended', () => {
        this.isPlayingMusic = false;
        try { this.audioElement.currentTime = 0; } catch (e) {}
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Play Lullaby';
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (progressFill) progressFill.style.width = '0%';
        if (curTime) curTime.textContent = '0:00';
        this.stopSparkleNotes();
        updateAudioHUD('Ambient Starlight', false);
      });

      this.audioElement.addEventListener('error', (err) => {
        console.warn('Lullaby audio loading/playback error:', err);
        this.isPlayingMusic = false;
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Play Lullaby';
        if (pauseBtn) pauseBtn.style.display = 'none';
        this.stopSparkleNotes();
        updateAudioHUD('Ambient Starlight', false);
        showToast('Lullaby audio could not be played.', '⚠️');
      });

      // Play button: Clicking always starts from 0:00, or restarts from 0:00 if already playing
      playBtn && playBtn.addEventListener('click', () => {
        this.playMusic();
      });

      // Dedicated pause button allows pausing without losing scrub position if desired
      pauseBtn && pauseBtn.addEventListener('click', () => {
        this.pauseMusic();
      });

      this.audioElement.addEventListener('timeupdate', () => {
        if (!this.audioElement.duration) return;
        const pct = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (curTime) curTime.textContent = formatTime(this.audioElement.currentTime);
        if (totTime) totTime.textContent = formatTime(this.audioElement.duration);
      });

      this.audioElement.addEventListener('loadedmetadata', () => {
        if (totTime && this.audioElement.duration) {
          totTime.textContent = formatTime(this.audioElement.duration);
        }
      });

      progressContainer && progressContainer.addEventListener('click', (e) => {
        if (!this.audioElement.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.audioElement.currentTime = Math.max(0, Math.min(pos * this.audioElement.duration, this.audioElement.duration));
      });

      function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
      }
    },

    playMusic() {
      if (AppState.isMuted) {
        AppState.isMuted = false;
        const muteToggle = document.getElementById('btn-mute-toggle');
        if (muteToggle) muteToggle.textContent = '🔊 Sound: ON';
        const hudToggle = document.getElementById('hud-sound-toggle');
        if (hudToggle) hudToggle.textContent = '🔊';
      }

      // Always reset time to 0:00 so clicking starts from the beginning or restarts from the beginning!
      try {
        this.audioElement.currentTime = 0;
      } catch (e) {
        console.warn('Error resetting lullaby playback position:', e);
      }

      const progressFill = document.getElementById('audio-progress-fill');
      const curTime = document.getElementById('audio-cur-time');
      if (progressFill) progressFill.style.width = '0%';
      if (curTime) curTime.textContent = '0:00';

      const wasAlreadyPlaying = this.isPlayingMusic;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          showToast(wasAlreadyPlaying ? 'Lullaby restarted from 0:00 🔄' : 'Unicorn Music Box playing from 0:00 🦄', '🎶');
        }).catch((err) => {
          console.warn('Playback error / autoplay restricted:', err);
          this.isPlayingMusic = false;
          showToast('Click to begin lullaby playback 🎵', '🎶');
        });
      }
    },

    pauseMusic() {
      this.isPlayingMusic = false;
      if (this.audioElement) {
        this.audioElement.pause();
      }
      showToast('Lullaby paused ⏸', '💤');
    },

    windUp() {
      playSound('click');
      const status = document.getElementById('music-spring-status');
      if (status) status.textContent = 'Spring Tension: Fully Wound 🗝️';

      // Spawn a burst of sparkles
      for (let i = 0; i < 6; i++) {
        setTimeout(() => this.spawnNote(), i * 120);
      }

      this.playMusic();
    },

    startSparkleNotes() {
      if (this.sparkleInterval) clearInterval(this.sparkleInterval);
      this.sparkleInterval = setInterval(() => {
        this.spawnNote();
      }, 700);
    },

    stopSparkleNotes() {
      if (this.sparkleInterval) clearInterval(this.sparkleInterval);
      this.sparkleInterval = null;
    },

    spawnNote() {
      if (!this.sparkleContainer) return;
      const note = document.createElement('div');
      note.className = 'floating-box-note';
      note.textContent = ['♪', '♫', '★', '✦', '🦄'][Math.floor(Math.random() * 5)];
      note.style.left = `${Math.random() * 60 + 20}%`;
      note.style.bottom = `${Math.random() * 30 + 30}%`;
      this.sparkleContainer.appendChild(note);
      setTimeout(() => {
        if (note.parentNode) note.parentNode.removeChild(note);
      }, 2300);
    },

    initChimeKeys() {
      const tineKeys = document.querySelectorAll('.tine-key');
      const freqs = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.00,
        'A4': 440.00, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25
      };

      tineKeys.forEach((tine) => {
        tine.addEventListener('click', () => {
          const noteKey = tine.getAttribute('data-note');
          const f = freqs[noteKey];
          if (f && !AppState.isMuted) {
            const ctx = getAudioContext();
            if (ctx) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, ctx.currentTime);
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 1.25);
            }
            this.spawnNote();
            tine.classList.add('vibrating');
            setTimeout(() => tine.classList.remove('vibrating'), 150);
          }
        });
      });
    }
  };

  /* --------------------------------------------------------------------------
     6. SECTION A: TINY NURSERY BOOT SCREEN
     -------------------------------------------------------------------------- */
  const BootScreen = {
    init() {
      const screen = document.getElementById('boot-screen');
      const log = document.getElementById('boot-log');
      const clock = document.getElementById('boot-clock');
      const skipBtn = document.getElementById('btn-boot-skip');
      const enterBtn = document.getElementById('btn-boot-enter');
      const statusText = document.getElementById('boot-status-text');

      if (!screen || !log) return;

      setInterval(() => {
        const d = new Date();
        const str = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ST';
        if (clock) clock.textContent = str;
      }, 1000);

      const bootSequence = [
        { text: '>> ROM CHECK: 640 KB STARLIGHT OK', color: 'cyan', delay: 150 },
        { text: '>> INITIALIZING DREAM_ENGINE.SYS v2.04...', color: 'cyan', delay: 300 },
        { text: '>> CALIBRATING LULLABY HARMONICS (432 Hz)... OK', color: '', delay: 500 },
        { text: '>> CHARGING NIGHTLIGHT NODES [5/5 ACTIVE]...', color: 'yellow', delay: 750 },
        { text: '>> MOON STATUS: WAXING CRESCENT 🌙 (SLUMBER-OPTIMAL)', color: 'magenta', delay: 1050 },
        { text: '>> LOCATING JUNIOR DREAM ENGINEER: PIP FOUND [CLOUD 9½]', color: 'yellow', delay: 1350 },
        { text: '>> MIDNIGHT NURSERY SYSTEM: ONLINE.', color: 'cyan', delay: 1700 }
      ];

      let isDismissed = false;

      function dismiss() {
        if (isDismissed) return;
        isDismissed = true;
        screen.classList.add('dismissed');
        setTimeout(() => { screen.style.display = 'none'; }, 500);

        if (AppState.isReturningVisitor) {
          playVoice('returning_visit');
        } else {
          playVoice('first_visit');
        }
      }

      skipBtn && skipBtn.addEventListener('click', () => { dismiss(); playSound('click'); });
      enterBtn && enterBtn.addEventListener('click', () => { dismiss(); playSound('click'); });

      document.addEventListener('keydown', (e) => {
        if (!isDismissed && (e.key === 'Escape' || e.key === 'Enter')) {
          dismiss();
        }
      });

      bootSequence.forEach((item) => {
        setTimeout(() => {
          if (isDismissed) return;
          const p = document.createElement('div');
          p.className = `boot-log-line ${item.color}`;
          p.textContent = item.text;
          log.appendChild(p);
          log.scrollTop = log.scrollHeight;
          SynthFX.playClick();
        }, item.delay);
      });

      setTimeout(() => {
        if (isDismissed) return;
        if (statusText) statusText.textContent = 'SYSTEM READY.';
        if (skipBtn) skipBtn.style.display = 'none';
        if (enterBtn) {
          enterBtn.style.display = 'inline-block';
          enterBtn.focus();
        }
      }, 1900);
    }
  };

  /* --------------------------------------------------------------------------
     7. GLOBAL THEME, MUTE & MEMORY
     -------------------------------------------------------------------------- */
  function applyTheme(theme) {
    AppState.theme = theme;
    Memory.set(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'nightmare' ? 'theme-nightmare' : 'theme-dream';

    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    const heroImg = document.getElementById('pip-hero-img');
    const chatAvatar = document.getElementById('chat-avatar-img');
    const closingAvatar = document.getElementById('closing-pip-img');
    const statusPill = document.getElementById('hero-status-pill');
    const speechText = document.getElementById('hero-dialogue-text');

    const secretKey = document.getElementById('secret-key-trigger');
    if (secretKey) {
      secretKey.title = theme === 'nightmare'
        ? "Click Pip's silver key to return to Dream Mode 🌸"
        : "A tiny silver key glints on Pip's ribbon... (Click to toggle Night Shift 🗝️)";
    }

    if (theme === 'nightmare') {
      if (themeIcon) themeIcon.textContent = '😈';
      if (themeLabel) themeLabel.textContent = 'NIGHTMARE SHIFT';
      if (heroImg) heroImg.src = 'assets/images/pip-nightmare.png';
      if (chatAvatar) chatAvatar.src = 'assets/images/pip-nightmare.png';
      if (closingAvatar) closingAvatar.src = 'assets/images/pip-nightmare.png';
      if (statusPill) statusPill.textContent = '● NIGHT SHIFT • TUCKING IN NIGHTMARES';
      if (PipDialogue && PipDialogue.heroTextEl && !SecretTransformationChamber.isTransforming) {
        PipDialogue.type("Welcome to the night shift, dreamer. Don't worry. I only bite bad dreams.", null, 20);
      }
    } else {
      if (themeIcon) themeIcon.textContent = '🌸';
      if (themeLabel) themeLabel.textContent = 'DREAM MODE';
      if (heroImg) heroImg.src = 'assets/images/pip-cute.png';
      if (chatAvatar) chatAvatar.src = 'assets/images/pip-cute.png';
      if (closingAvatar) closingAvatar.src = 'assets/images/pip-closing.png';
      if (statusPill) statusPill.textContent = 'OFFICIAL JUNIOR DREAM ENGINEER';
      if (PipDialogue && PipDialogue.heroTextEl && !SecretTransformationChamber.isTransforming) {
        PipDialogue.type("Oh! A new dreamer. Welcome to my tiny corner of midnight.", null, 20);
      }
    }
  }

  function initGlobalControls() {
    applyTheme(AppState.theme);

    const themeBtn = document.getElementById('btn-theme-toggle');
    themeBtn && themeBtn.addEventListener('click', () => {
      const nextTheme = AppState.theme === 'dream' ? 'nightmare' : 'dream';
      applyTheme(nextTheme);
      playSound('sparkle');
      if (nextTheme === 'nightmare') {
        playVoice('nightmare_mode');
        showToast('Shifted to Nightmare Mode 😈', '🖤');
      } else {
        playVoice('identity');
        showToast('Returned to Dream Mode 🌸', '✨');
      }
    });

    const muteBtn = document.getElementById('btn-mute-toggle');
    const muteIcon = document.getElementById('mute-icon');
    const muteLabel = document.getElementById('mute-label');
    const hudSoundToggle = document.getElementById('hud-sound-toggle');

    function syncMuteUI() {
      const icon = AppState.isMuted ? '🔇' : '🔊';
      const label = AppState.isMuted ? 'SOUND: OFF' : 'SOUND: ON';
      if (muteIcon) muteIcon.textContent = icon;
      if (muteLabel) muteLabel.textContent = label;
      if (hudSoundToggle) hudSoundToggle.textContent = icon;
    }
    syncMuteUI();

    function toggleMute() {
      AppState.isMuted = !AppState.isMuted;
      Memory.set(STORAGE_KEYS.MUTED, AppState.isMuted);
      if (AppState.isMuted) {
        stopAllAudio();
        showToast('All nursery sounds muted.', '🔇');
      } else {
        playSound('sparkle');
        showToast('Nursery sound enabled!', '🔊');
      }
      syncMuteUI();
    }

    muteBtn && muteBtn.addEventListener('click', toggleMute);
    hudSoundToggle && hudSoundToggle.addEventListener('click', toggleMute);

    const hudReplay = document.getElementById('hud-voice-replay');
    hudReplay && hudReplay.addEventListener('click', () => {
      if (lastSpokenLine) playVoice(lastSpokenLine);
      else playVoice('identity');
    });

    const memModal = document.getElementById('memory-modal');
    const memBtn = document.getElementById('btn-memory-modal');
    const memCloseBtn = document.getElementById('btn-close-memory');
    const memResetBtn = document.getElementById('btn-reset-memory');

    function updateMemoryModal() {
      document.getElementById('mem-visitor-status').textContent = AppState.isReturningVisitor ? 'Returning Dreamer' : 'First-time Dreamer';
      document.getElementById('mem-visit-count').textContent = AppState.visitorCount;
      document.getElementById('mem-secret-discovered').textContent = AppState.discoveredTransformation ? 'Yes (Unlocked! 🗝️)' : 'Not Yet (Locked 🔒)';
      document.getElementById('mem-favorite-light').textContent = AppState.favoriteLight || 'None Selected';
      document.getElementById('mem-dreams-sent').textContent = AppState.dreamsDelivered.toLocaleString();
      document.getElementById('mem-sound-status').textContent = AppState.isMuted ? 'Muted' : 'Enabled';
    }

    memBtn && memBtn.addEventListener('click', () => {
      updateMemoryModal();
      memModal.style.display = 'flex';
      playSound('click');
    });

    memCloseBtn && memCloseBtn.addEventListener('click', () => {
      memModal.style.display = 'none';
      playSound('click');
    });

    memModal && memModal.addEventListener('click', (e) => {
      if (e.target === memModal) memModal.style.display = 'none';
    });

    memResetBtn && memResetBtn.addEventListener('click', () => {
      if (confirm('Clear all local dream data and reset Pip\'s memory?')) {
        Memory.clearAll();
        showToast('Pip\'s memory has been fluffed fresh!', '🧹');
        setTimeout(() => window.location.reload(), 600);
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. SECTION B: HERO
     -------------------------------------------------------------------------- */
  function initHero() {
    const hudTime = document.getElementById('hud-time');
    setInterval(() => {
      const d = new Date();
      if (hudTime) {
        hudTime.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ST';
      }
    }, 1000);

    const speakHero = document.getElementById('btn-speak-hero');
    speakHero && speakHero.addEventListener('click', () => {
      playSound('click');
      PipDialogue.cycle();
    });

    const btnChat = document.getElementById('btn-hero-chat');
    btnChat && btnChat.addEventListener('click', () => {
      playSound('click');
      document.getElementById('pip-chat').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('chat-input').focus();
    });

    const introBtn = document.getElementById('btn-lullaby-intro');
    introBtn && introBtn.addEventListener('click', () => {
      playVoice('lullaby_lab');
    });

    // Secret Easter Egg Trigger 1: The glowing silver key on Pip's frame (toggles Night Shift / Dream Mode)
    const secretKey = document.getElementById('secret-key-trigger');
    secretKey && secretKey.addEventListener('click', (e) => {
      e.stopPropagation();
      SecretTransformationChamber.toggle();
    });

    // Secret Easter Egg Trigger 2: Triple-clicking / triple-tapping Pip (single click cycles dialogue)
    let pipClickTimes = [];
    const charWrapper = document.getElementById('hero-character-wrapper');
    if (charWrapper) {
      charWrapper.addEventListener('click', () => {
        const now = Date.now();
        pipClickTimes.push(now);
        pipClickTimes = pipClickTimes.filter(t => now - t < 750);
        if (pipClickTimes.length >= 3) {
          pipClickTimes = [];
          SecretTransformationChamber.toggle();
        } else if (pipClickTimes.length === 1) {
          setTimeout(() => {
            if (pipClickTimes.length < 2 && !SecretTransformationChamber.isTransforming) {
              PipDialogue.cycle();
            }
          }, 280);
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     9. SECTION C: MEET PIP
     -------------------------------------------------------------------------- */
  const FACTS = {
    skull: {
      text: "All official Dream Engineers wear the ancient bone mask of slumber. It lets us walk between waking and dreaming realms without waking ourselves up! Plus, it keeps my sleepy skull nice and safe.",
      author: "— Pip, adjusting his nightcap"
    },
    snack: {
      text: "Lunar biscuits dipped in lukewarm chamomile tea! Crumbs in bed are strictly forbidden by Nursery Rule #14, but occasionally I sneak one under the quilt anyway.",
      author: "— Pip, brushing crumbs off his onesie"
    },
    horns: {
      text: "Horns? What horns? (Pip glances away nervously and pulls his hoodie tight...) You definitely didn't see any little red horns. Unless you were snooping around the 3 AM shift...",
      author: "— Pip, whistling innocently"
    },
    monsters: {
      text: "Bad dreams are just misunderstood fears that need extra blankets and a friendly bedtime song. Once you tuck them in with a warm cookie, they stop scaring people and fall fast asleep.",
      author: "— Pip, Junior Dream Engineer"
    },
    tools: {
      text: "A pocket brass wrench for tightening loose constellation bolts, a cloud-fluffing density comb, three jars of liquid starlight, and a squeaky rubber comet.",
      author: "— Pip, patting his tool satchel"
    }
  };

  function initMeetPip() {
    const pills = document.querySelectorAll('.fact-pill');
    const factText = document.getElementById('fact-text');
    const factAuthor = document.querySelector('.fact-author');

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const key = pill.getAttribute('data-fact');
        if (FACTS[key]) {
          factText.textContent = FACTS[key].text;
          factAuthor.textContent = FACTS[key].author;
          playSound('sparkle');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     10. SECTION D: STORY CAROUSEL
     -------------------------------------------------------------------------- */
  function initStoryCarousel() {
    const scenes = document.querySelectorAll('.story-scene');
    const stepBtns = document.querySelectorAll('.story-step-btn');
    const prevBtn = document.getElementById('btn-story-prev');
    const nextBtn = document.getElementById('btn-story-next');
    let currentStep = 0;

    function showScene(idx) {
      if (idx < 0) idx = scenes.length - 1;
      if (idx >= scenes.length) idx = 0;
      currentStep = idx;

      scenes.forEach((s, i) => s.classList.toggle('active', i === currentStep));
      stepBtns.forEach((b, i) => b.classList.toggle('active', i === currentStep));
      playSound('click');
    }

    stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-step'), 10);
        showScene(step);
      });
    });

    prevBtn && prevBtn.addEventListener('click', () => showScene(currentStep - 1));
    nextBtn && nextBtn.addEventListener('click', () => showScene(currentStep + 1));
  }

  /* --------------------------------------------------------------------------
     11. SECTION F: NIGHTLIGHT COLLECTION
     -------------------------------------------------------------------------- */
  const NIGHTLIGHTS = {
    rabbit: { name: 'Moon Rabbit Nightlight', desc: 'Bathed in warm amber light, you dream of hopping across fluffy cloud fields alongside friendly silver rabbits.' },
    whale: { name: 'Cosmic Whale Bioluminescent Light', desc: 'Floating through sunken turquoise star clusters with singing celestial leviathans guiding you safely through slumber.' },
    lantern: { name: 'Sakura Origami Lantern', desc: 'A midnight garden festival where folded paper birds gather up your daytime worries and carry them off into the sunset.' },
    bear: { name: 'Slumbering Bear Honey Lamp', desc: 'A hollow velvet tree trunk filled with warm blueberry tarts, soft moss quilts, and gentle rain on the leaves.' },
    forbidden: { name: 'The Forbidden Lantern (Classified)', desc: 'A secret corridor behind the ticking grandfather clock. Bad dreams are dismantled into harmless stardust. [Terminal Key: NIGHTMARE]', isSecret: true }
  };

  function initNightlights() {
    const cards = document.querySelectorAll('.nightlight-card');
    const dreamTitle = document.getElementById('active-dream-title');
    const dreamDesc = document.getElementById('active-dream-desc');
    const favBtn = document.getElementById('btn-save-light-fav');
    let currentSelectedLight = null;

    cards.forEach((card) => {
      const lightKey = card.getAttribute('data-light');
      const toggleBtn = card.querySelector('.btn-lamp-toggle');

      if (lightKey === 'forbidden' && toggleBtn) {
        toggleBtn.textContent = '⚡ Breach Chamber';
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showToast('Bypassing nursery firewall... Entering Secret Chamber.', '⚡');
          SecretTransformationChamber.open();
        });
      }

      card.addEventListener('click', () => {
        cards.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');

        const data = NIGHTLIGHTS[lightKey];
        currentSelectedLight = lightKey;

        if (data) {
          dreamTitle.textContent = data.name;
          dreamDesc.textContent = data.desc;
          favBtn.disabled = false;

          if (data.isSecret) {
            playSound('transform');
            showToast('Secret Lantern Discovered! Click Breach Chamber or enter NIGHTMARE in Terminal', '🗝️');
          } else {
            playSound('sparkle');
            playVoice('nightlights');
          }
        }
      });
    });

    favBtn && favBtn.addEventListener('click', () => {
      if (!currentSelectedLight) return;
      if (currentSelectedLight === 'forbidden') {
        showToast('Direct chamber link authorized...', '⚡');
        SecretTransformationChamber.open();
        return;
      }
      AppState.favoriteLight = NIGHTLIGHTS[currentSelectedLight].name;
      Memory.set(STORAGE_KEYS.FAVORITE_LIGHT, AppState.favoriteLight);
      showToast(`Set "${NIGHTLIGHTS[currentSelectedLight].name}" as favorite!`, '⭐');
      playSound('click');
    });
  }

  /* --------------------------------------------------------------------------
     12. SECTION G & M: DELIVERY CONSOLE & ODOMETER
     -------------------------------------------------------------------------- */
  function renderOdometer(count) {
    const display = document.getElementById('odometer-display');
    const snippet = document.getElementById('hud-delivered-snippet');
    if (snippet) snippet.textContent = count.toLocaleString();

    if (!display) return;
    const str = count.toString().padStart(6, '0');
    const digits = display.querySelectorAll('.odometer-digit');

    digits.forEach((digitEl, idx) => {
      const targetChar = str[idx];
      const targetNum = parseInt(targetChar, 10);
      const strip = digitEl.querySelector('.digit-strip');
      if (strip && !isNaN(targetNum)) {
        strip.style.transform = `translateY(-${targetNum * 54}px)`;
      }
    });
  }

  function initDeliveryConsole() {
    renderOdometer(AppState.dreamsDelivered);

    const form = document.getElementById('dream-dispatch-form');
    const capsule = document.getElementById('dream-capsule');
    const receiptText = document.getElementById('receipt-text');
    const receiptSpeed = document.getElementById('receipt-speed');
    const receiptDest = document.getElementById('receipt-dest');
    const dispatchBtn = document.getElementById('btn-dispatch-dream');

    form && form.addEventListener('submit', (e) => {
      e.preventDefault();
      dispatchBtn.disabled = true;

      const destSelect = document.getElementById('dispatch-dest');
      const destText = destSelect.options[destSelect.selectedIndex].text;
      const speed = form.querySelector('input[name="speed"]:checked').value;

      receiptText.textContent = `Packaging complete. Dispatching to: ${destText}...`;
      receiptDest.textContent = destSelect.value.toUpperCase();
      receiptSpeed.textContent = speed.toUpperCase();

      playSound('delivery');
      playVoice('dream_delivery');

      capsule.classList.remove('launched');
      void capsule.offsetWidth;
      capsule.classList.add('launched');

      setTimeout(() => {
        AppState.dreamsDelivered += 1;
        Memory.set(STORAGE_KEYS.DREAMS_DELIVERED, AppState.dreamsDelivered);
        renderOdometer(AppState.dreamsDelivered);

        receiptText.innerHTML = `✅ <strong>DELIVERY SUCCESSFUL!</strong> Receipt #DREAM-${Math.floor(10000 + Math.random() * 90000)}. Recipient is fast asleep.`;
        showToast('Dream successfully dispatched!', '🚀');
        dispatchBtn.disabled = false;
      }, 1000);
    });
  }

  /* --------------------------------------------------------------------------
     13. SECTION O: BED-SIDE DREAM JAR
     -------------------------------------------------------------------------- */
  const PROPHECIES = [
    { text: "Tonight, you will dream of walking on warm sponge cakes across a low-gravity kitchen, catching sugar stars with a silver spoon.", rarity: "✨ COMMON BLESSING" },
    { text: "A wise midnight owl will hand you a small brass key that unlocks whichever worry was bothering you this afternoon.", rarity: "✨ COMMON BLESSING" },
    { text: "You will discover a calm cove where bioluminescent waves wash up warm memories and smooth sea glass.", rarity: "✨ COMMON BLESSING" },
    { text: "You will float inside an enchanted velvet bubble, drifting gently past sleepy constellations that hum a soft lullaby.", rarity: "✨ COMMON BLESSING" },
    { text: "Your shoes will turn into cloud-puffs, letting you bounce effortlessly over rooftops and say hello to resting sparrows.", rarity: "🌙 UNCOMMON DREAM" },
    { text: "You will share a pot of chamomile tea with an origami crane who speaks eight languages of the wind.", rarity: "🌙 UNCOMMON DREAM" },
    { text: "🌟 LEGENDARY CELESTIAL PROPHECY: You stumble upon Pip's secret attic workshop, where lost socks are lovingly unraveled and spun into baby stars!", rarity: "🌟 RARE LEGENDARY" },
    { text: "🔥 MIDNIGHT SHIFT PROPHECY: The monsters under your bed aren't trying to scare you—they just really want a cup of hot cocoa with extra marshmallows.", rarity: "🔥 RARE NIGHTMARE" }
  ];

  function initDreamJar() {
    const jar = document.getElementById('mason-jar');
    const drawBtn = document.getElementById('btn-draw-prophecy');
    const speakBtn = document.getElementById('btn-speak-jar');
    const textEl = document.getElementById('prophecy-text');
    const rarityEl = document.getElementById('prophecy-rarity');

    function drawProphecy() {
      jar.style.transform = 'scale(1.15) rotate(-6deg)';
      setTimeout(() => jar.style.transform = '', 300);

      playSound('sparkle');
      playVoice('dream_jar');

      const idx = Math.floor(Math.random() * PROPHECIES.length);
      const chosen = PROPHECIES[idx];

      textEl.textContent = `“${chosen.text}”`;
      rarityEl.textContent = chosen.rarity;
      showToast('Prophecy drawn from starlight!', '🫙');
    }

    jar && jar.addEventListener('click', drawProphecy);
    drawBtn && drawBtn.addEventListener('click', drawProphecy);
    speakBtn && speakBtn.addEventListener('click', () => playVoice('farewell'));
  }

  /* --------------------------------------------------------------------------
     14. SECTION I: CHAT INTERFACE
     -------------------------------------------------------------------------- */
  function initChat() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const typing = document.getElementById('chat-typing');
    const chips = document.querySelectorAll('.chat-chip');
    const clearBtn = document.getElementById('btn-clear-chat');
    const charCounter = document.getElementById('chat-char-count');

    input && input.addEventListener('input', () => {
      charCounter.textContent = `${input.value.length}/100`;
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.textContent;
        charCounter.textContent = `${input.value.length}/100`;
        form.dispatchEvent(new Event('submit'));
      });
    });

    clearBtn && clearBtn.addEventListener('click', () => {
      messages.innerHTML = `
        <div class="chat-msg pip-msg">
          <div class="msg-bubble">
            <p>Chat cleared! Pip adjusted his nightcap. What shall we dream of next?</p>
            <span class="msg-time">Just now</span>
          </div>
        </div>
      `;
      playSound('click');
    });

    function appendMessage(sender, text) {
      const msg = document.createElement('div');
      msg.className = `chat-msg ${sender}-msg`;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      msg.innerHTML = `
        <div class="msg-bubble">
          <p>${escapeHTML(text)}</p>
          <span class="msg-time">${time}</span>
        </div>
      `;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    form && form.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawText = input.value.trim();
      if (!rawText) return;

      appendMessage('user', rawText);
      input.value = '';
      charCounter.textContent = '0/100';
      playSound('click');

      typing.style.display = 'flex';
      messages.scrollTop = messages.scrollHeight;

      setTimeout(() => {
        typing.style.display = 'none';
        const reply = getPipReply(rawText);
        appendMessage('pip', reply.text);
        if (reply.voice) playVoice(reply.voice);
        else playSound('sparkle');
      }, 700);
    });

    function getPipReply(query) {
      const q = query.toLowerCase();

      if (q.includes('who are you') || q.includes('identity') || q.includes('name')) {
        return {
          text: "I'm Pip! Junior Dream Engineer of haX.baby Track 1. I fluff the clouds, polish the starlight lenses, and make sure everybody gets to sleep on time.",
          voice: 'identity'
        };
      }
      if (q.includes('secret') || q.includes('horns') || q.includes('nightmare') || q.includes('other you')) {
        return {
          text: "Hush! When the clock strikes past three, I slip into my black hoodie and patrol the nightmares. (Psst: check the Transformation Chamber above to scrub the frames!)",
          voice: 'transformation'
        };
      }
      if (q.includes('sing') || q.includes('lullaby') || q.includes('song') || q.includes('music box')) {
        return {
          text: "Little moon, sleepy star, dreams can find you where you are. Close your eyes and drift away, I'll keep watch until the day.",
          voice: 'lullaby'
        };
      }
      if (q.includes('nursery') || q.includes('midnight') || q.includes('hax.baby')) {
        return {
          text: "The Midnight Nursery sits right on Cloud 9½. We manufacture warm lavender thoughts, soft puppy dreams, and catch any nightmares that wander too close.",
          voice: 'first_visit'
        };
      }
      if (q.includes('good') || q.includes('bad') || q.includes('naughty')) {
        return {
          text: "Hmm. The nursery monitors every bedtime! If you've been good, sweet dreams await. If you've been mischievous... well, bedtime just got interesting.",
          voice: 'naughty_or_nice'
        };
      }
      if (q.includes('bad dream') || q.includes('scared') || q.includes('monster')) {
        return {
          text: "Don't worry, dreamer! I only bite bad dreams. I've got my trusty dream wrench ready. Close your eyes and let me handle it.",
          voice: 'nightmare_mode'
        };
      }
      if (q.includes('deliver') || q.includes('rocket') || q.includes('package')) {
        return {
          text: "Over in the Dream Delivery Console, you can launch custom capsules through our pneumatic starlight tubes straight down to earth!",
          voice: 'dream_delivery'
        };
      }

      return {
        text: "Pip tilts his head and his eyes follow your cursor... 'My dream antenna didn't catch every frequency of that, but here's a warm cloud while I figure it out!'",
        voice: null
      };
    }
  }

  /* --------------------------------------------------------------------------
     15. SECTION J: RETRO BEDTIME TERMINAL
     -------------------------------------------------------------------------- */
  function initTerminal() {
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    const quickBtns = document.querySelectorAll('.term-btn');

    function logTerm(text, colorClass = 'term-green') {
      const line = document.createElement('div');
      line.className = `term-line ${colorClass}`;
      line.textContent = text;
      history.appendChild(line);
      const screen = document.getElementById('terminal-screen');
      if (screen) screen.scrollTop = screen.scrollHeight;
    }

    function executeCommand(cmd) {
      const clean = cmd.trim().toLowerCase();
      logTerm(`> ${cmd}`, 'term-cyan');
      playSound('click');

      switch (clean) {
        case 'good':
        case '1':
          logTerm('>> COMPLIANCE AUDIT: 100% WHOLESOME.', 'term-green');
          logTerm('>> Pip awards you a Golden Star of Slumber. Sweet dreams guaranteed!', 'term-amber');
          playVoice('dream_delivery');
          break;

        case 'cookies':
        case '2':
          logTerm('>> CRUMB PATROL ALERT: BEDTIME CONTRABAND DETECTED.', 'term-amber');
          logTerm('>> Pip says: "I will look the other way if you leave half a cookie for me."', 'term-green');
          playSound('giggle');
          break;

        case 'mischief':
        case '3':
          logTerm('>> WARNING: MISCHIEF LEVEL EXCEEDS DAYTIME THRESHOLD.', 'term-red');
          logTerm('>> Loading classified Night Shift protocols...', 'term-amber');
          setTimeout(() => {
            logTerm('>> BREACHING SECRET TRANSFORMATION CHAMBER...', 'term-red');
            SecretTransformationChamber.open();
          }, 800);
          break;

        case 'nightmare':
        case 'horns':
        case '4':
        case 'override':
        case '666':
        case 'shift3':
        case 'chamber':
          logTerm('>> !!! UNAUTHORIZED OVERRIDE DETECTED !!!', 'term-red');
          logTerm('>> INITIATING PROTOCOL NIGHTMARE...', 'term-red');
          setTimeout(() => {
            SecretTransformationChamber.open();
          }, 600);
          break;

        case 'records':
        case 'logs':
        case 'archive':
          logTerm('>> [CLASSIFIED ARCHIVES — LEVEL 2 CLEARANCE]', 'term-cyan');
          logTerm('>> LOG #0042: Dream capsule 772-B diverted to Mt. Pillow (100% cloud fluff).', 'term-green');
          logTerm('>> LOG #0088: Subject requested 100 puppies; system dispatched 104 due to buffer overflow.', 'term-green');
          logTerm('>> LOG #0099 [RESTRICTED]: Junior Engineer Pip observed growing crimson horns after midnight milk intake. Chamber seals active.', 'term-amber');
          logTerm('>> LOG #0114: Stardust engine running at 103% harmonic efficiency.', 'term-green');
          break;

        case 'whoami':
        case 'pip':
          logTerm('>> NURSERY PERSONNEL IDENT:', 'term-cyan');
          logTerm('>> Name: Pip (Junior Dream Engineer, Batch #404)', 'term-green');
          logTerm('>> Station: Cloud 9½, Midnight Nursery', 'term-green');
          logTerm('>> Specialty: Sweet Dream Delivery & Emergency Nightmare Dissolution', 'term-green');
          logTerm('>> Status: Operational. Ready for lullaby playback.', 'term-amber');
          break;

        case 'secret':
        case 'clue':
        case 'hints':
        case 'easteregg':
          logTerm('>> NURSERY WHISPERS & ARCHIVED SECRETS:', 'term-amber');
          logTerm('>> 1. The silver pin upon Pip\'s nursery collar holds the key to the chamber...', 'term-cyan');
          logTerm('>> 2. Triple-tapping the slumbering Junior Engineer activates emergency mode.', 'term-cyan');
          logTerm('>> 3. The 5th lantern in the nursery gallery has a direct override toggle.', 'term-cyan');
          break;

        case 'hax':
        case 'hax.baby':
        case 'hackathon':
          logTerm('>> haX.baby 2026 // TRACK 1: OFFICIAL PIP', 'term-green');
          logTerm('>> STATUS: BOSS LEVEL / TIER 3 — LEGENDARY EXPERIENCE LOADED.', 'term-cyan');
          logTerm('>> Welcome Hackathon Judges & Dreamers alike!', 'term-amber');
          playSound('sparkle');
          break;

        case 'help':
          logTerm('>> AVAILABLE COMMANDS: good, cookies, mischief, nightmare, records, whoami, secret, hax, status, clear', 'term-amber');
          break;

        case 'status':
          logTerm(`>> DREAMS DELIVERED: ${AppState.dreamsDelivered}`, 'term-green');
          logTerm(`>> ACTIVE THEME: ${AppState.theme.toUpperCase()}`, 'term-green');
          logTerm(`>> SECRET DISCOVERED: ${AppState.discoveredTransformation ? 'YES (CHAMBER UNLOCKED)' : 'NOT YET'}`, 'term-cyan');
          break;

        case 'clear':
          history.innerHTML = '';
          break;

        default:
          logTerm(`>> UNKNOWN COMMAND "${clean}". TYPE "help" FOR RECOGNIZED PROTOCOLS.`, 'term-amber');
          break;
      }
    }

    quickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        executeCommand(cmd);
      });
    });

    form && form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      executeCommand(val);
    });
  }

  /* --------------------------------------------------------------------------
     16. SECTION N: GUESTBOOK
     -------------------------------------------------------------------------- */
  const INITIAL_WISHES = [
    { author: "Oliver (Age 7)", content: "I hope my puppy dreams of catching flying tennis balls made of bacon.", sticker: "🧸", time: "Yesterday" },
    { author: "Anya (Midnight Baker)", content: "Wishing for sleep that feels as warm and gentle as freshly rising brioche dough.", sticker: "🍪", time: "2 days ago" },
    { author: "Pip (Dream Engineer)", content: "Don't forget to tuck your feet under the blanket so the cold air doesn't tickle your toes!", sticker: "🌙", time: "Official Note" }
  ];

  function initGuestbook() {
    const form = document.getElementById('guestbook-form');
    const authorInput = document.getElementById('wish-author');
    const contentInput = document.getElementById('wish-content');
    const charCounter = document.getElementById('wish-char-count');
    const wishesList = document.getElementById('wishes-list');
    const wishCountDisplay = document.getElementById('wish-count-display');
    const clearBtn = document.getElementById('btn-clear-wishes');

    let savedWishes = Memory.get(STORAGE_KEYS.WISHES, null);
    if (!savedWishes || !Array.isArray(savedWishes)) {
      savedWishes = [...INITIAL_WISHES];
      Memory.set(STORAGE_KEYS.WISHES, savedWishes);
    }

    function renderWishes() {
      if (!wishesList) return;
      wishesList.innerHTML = '';
      if (wishCountDisplay) wishCountDisplay.textContent = savedWishes.length;

      savedWishes.forEach((w) => {
        const item = document.createElement('div');
        item.className = 'wish-entry';
        item.innerHTML = `
          <div class="wish-entry-top">
            <span class="wish-author">${escapeHTML(w.author)}</span>
            <span class="wish-sticker">${w.sticker || '🌙'}</span>
          </div>
          <p class="wish-body">“${escapeHTML(w.content)}”</p>
          <div class="wish-meta">Tucked into memory • ${w.time || 'Recently'}</div>
        `;
        wishesList.appendChild(item);
      });
    }
    renderWishes();

    contentInput && contentInput.addEventListener('input', () => {
      charCounter.textContent = `${contentInput.value.length}/140`;
    });

    form && form.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = authorInput.value.trim();
      const content = contentInput.value.trim();
      const sticker = form.querySelector('input[name="sticker"]:checked').value;

      if (!author || !content) return;

      const newWish = { author, content, sticker, time: 'Just now' };
      savedWishes.unshift(newWish);
      Memory.set(STORAGE_KEYS.WISHES, savedWishes);
      renderWishes();

      form.reset();
      charCounter.textContent = '0/140';
      playSound('sparkle');
      playVoice('guestbook');
      showToast('Wish tucked safely into your pillow!', '📖');
    });

    clearBtn && clearBtn.addEventListener('click', () => {
      if (confirm('Clear custom bedtime wishes and restore defaults?')) {
        savedWishes = [...INITIAL_WISHES];
        Memory.set(STORAGE_KEYS.WISHES, savedWishes);
        renderWishes();
        playSound('click');
      }
    });
  }

  /* --------------------------------------------------------------------------
     17. SECTION P: CLOSING SCENE & LULLABY POEM
     -------------------------------------------------------------------------- */
  function initClosingScene() {
    const playLullabyBtn = document.getElementById('btn-play-lullaby-poem');
    const secretStar = document.getElementById('secret-star-btn');
    const secretBox = document.getElementById('closing-secret-reveal');
    const poemLines = document.querySelectorAll('.poem-line');
    let poemTimers = [];

    playLullabyBtn && playLullabyBtn.addEventListener('click', () => {
      // Clear previous subtitle timers to synchronize with fresh playback from 0:00
      poemTimers.forEach(clearTimeout);
      poemTimers = [];

      // Restart voice lullaby from 0:00
      playVoice('lullaby');

      poemLines.forEach((l) => l.classList.remove('highlight'));
      const lineDelays = [400, 2800, 5200, 7800];
      lineDelays.forEach((delay, idx) => {
        const timer = setTimeout(() => {
          poemLines.forEach((l) => l.classList.remove('highlight'));
          if (poemLines[idx]) poemLines[idx].classList.add('highlight');
        }, delay);
        poemTimers.push(timer);
      });

      const endTimer = setTimeout(() => {
        poemLines.forEach((l) => l.classList.remove('highlight'));
      }, 11000);
      poemTimers.push(endTimer);
    });

    secretStar && secretStar.addEventListener('click', () => {
      secretBox.style.display = 'block';
      secretBox.scrollIntoView({ behavior: 'smooth' });
      playSound('sparkle');
      playVoice('farewell');
      showToast('You discovered the Secret Star! ⭐', '🌟');
    });
  }

  /* --------------------------------------------------------------------------
     18. DREAMY CURSOR TRAIL (Stardust Particle System)
     -------------------------------------------------------------------------- */
  function initCursorTrail() {
    const canvas = document.getElementById('cursor-canvas');
    if (!canvas) return;

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];

    window.addEventListener('mousemove', (e) => {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: Math.random() * 3 + 2,
          alpha: 1,
          color: AppState.theme === 'nightmare' ? '#ff2a5f' : '#ffd166'
        });
      }
    });

    function loop() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size < 0.5) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* --------------------------------------------------------------------------
     19. DREAM-REACTIVE AMBIENT PARALLAX
     -------------------------------------------------------------------------- */
  function initAmbientParallax() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = document.querySelectorAll('[data-depth]');
    if (!elements.length) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2);
      targetY = (e.clientY - window.innerHeight / 2);
    }, { passive: true });

    function renderParallax() {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      elements.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth')) || 0.04;
        const moveX = currentX * depth;
        const moveY = currentY * depth;
        el.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      });

      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);
  }

  /* --------------------------------------------------------------------------
     20. CINEMATIC SCROLL STORYTELLING OBSERVER
     -------------------------------------------------------------------------- */
  function initScrollStoryObserver() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.section').forEach((s) => s.classList.add('is-revealed'));
      return;
    }

    const sections = document.querySelectorAll('.section:not(#hero)');
    sections.forEach((s) => s.classList.add('reveal-on-scroll'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    sections.forEach((s) => observer.observe(s));
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  /* --------------------------------------------------------------------------
     20b. DREAM CAPSULE LAUNCHER — Hackathon Surprise Feature ✨
          Clicking "Launch Dream Capsule" sends glowing orbs flying across the
          screen, then delivers a dreamy prophecy card from Pip.
     -------------------------------------------------------------------------- */
  function initDreamCapsuleLauncher() {
    const btn = document.getElementById('btn-launch-capsule');
    const portal = document.getElementById('capsule-portal');
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (!btn || !portal) return;

    const PROPHECIES = [
      {
        emoji: '💀',
        title: 'Dream Capsule #404',
        text: '"Tonight your dreams will be scored by a tiny orchestra of sleepy stars who misread your musical request. It will be beautiful anyway."',
        stars: '★★★★☆',
        badge: 'DREAM CLASS: CELESTIAL IMPROV'
      },
      {
        emoji: '🌙',
        title: 'Pip\'s Midnight Verdict',
        text: '"You will dream of being extremely late to an important cloud — but the cloud is very understanding and also made of cotton candy."',
        stars: '★★★★★',
        badge: 'DREAM CLASS: CONFECTIONERY CRISIS'
      },
      {
        emoji: '👁️',
        title: 'Nightmare Pip Sees You',
        text: '"Pip has reviewed your sleep data and discovered you have 11,000 unread emails in your dream inbox. They are all from stars you forgot to wish upon."',
        stars: '★★☆☆☆',
        badge: 'DREAM CLASS: ADMIN NIGHTMARE'
      },
      {
        emoji: '✨',
        title: 'Dream Capsule Delivered!',
        text: '"Your subconscious has been upgraded to Cloud 9½. Expect unusually cooperative pillows, three cameo appearances by a tiny moon, and one unexplained conga line."',
        stars: '★★★★★',
        badge: 'DREAM CLASS: LEGENDARY PILLOW TIER'
      },
      {
        emoji: '💫',
        title: 'Classified — Eyes Only',
        text: '"Tonight Pip will personally deliver a dream where every door you open leads to a slightly more comfortable version of the room you just left. You will never find the last room."',
        stars: '★★★☆☆',
        badge: 'DREAM CLASS: INFINITE COZY LOOP'
      },
      {
        emoji: '🦴',
        title: 'Dream Engineer Report',
        text: '"Dream capsule analysis complete: you have excellent dream bone density and a surprisingly robust imagination. Pip recommends at least 8 hours of nonsensical adventure."',
        stars: '★★★★★',
        badge: 'DREAM CLASS: BONE-TIER IMAGINATION'
      },
      {
        emoji: '🌸',
        title: 'Pastel Division Memo',
        text: '"Your dream tonight will feature a very small but extremely loud marching band made entirely of sleepy bunnies. They mean well. One of them is Pip in disguise."',
        stars: '★★★★☆',
        badge: 'DREAM CLASS: COVERT BUNNY OPS'
      }
    ];

    const TRAIL_VARIANTS = ['', 'trail-a', 'trail-b', 'trail-c'];
    const CAPSULE_EMOJIS = ['💀', '🌙', '✨', '💫', '⭐', '🌟', '👻'];

    let prophecyIdx = 0;
    let activeCard = null;

    function launchCapsule() {
      btn.classList.add('launching');
      setTimeout(() => btn.classList.remove('launching'), 350);

      playSound('sparkle');

      // Fire multiple capsules in sequence
      const count = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        setTimeout(() => fireCapsule(i, count), i * 80);
      }

      // Show prophecy card after capsules land
      setTimeout(showProphecy, 900);
    }

    function fireCapsule(idx, total) {
      const capsule = document.createElement('div');
      const variant = TRAIL_VARIANTS[idx % TRAIL_VARIANTS.length];
      capsule.className = `dream-capsule ${variant}`;
      capsule.textContent = CAPSULE_EMOJIS[idx % CAPSULE_EMOJIS.length];

      // Start from button position
      const btnRect = btn.getBoundingClientRect();
      const startX = btnRect.left + btnRect.width / 2 - 28;
      const startY = btnRect.top + btnRect.height / 2 - 28;

      // Random target across the screen
      const targetX = Math.random() * (window.innerWidth - 80);
      const targetY = Math.random() * (window.innerHeight * 0.75);

      capsule.style.cssText = `left:${startX}px;top:${startY}px;transform:scale(0);opacity:0;`;
      document.body.appendChild(capsule);

      // Animate via WAAPI
      const dur = 700 + Math.random() * 400;
      const angle = -360 + Math.random() * 720;
      capsule.animate([
        { transform: 'scale(0) rotate(0deg)', opacity: 0 },
        { transform: `scale(1.2) rotate(${angle * 0.3}deg)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(1) rotate(${angle}deg)`, opacity: 1, offset: 0.8 },
        { transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0) rotate(${angle + 90}deg)`, opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' });

      setTimeout(() => capsule.remove(), dur + 50);
    }

    function showProphecy() {
      // Close existing card first
      if (activeCard) closeCard(activeCard, true);

      const data = PROPHECIES[prophecyIdx % PROPHECIES.length];
      prophecyIdx++;

      const card = document.createElement('div');
      card.className = 'dream-prophecy-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-label', 'Dream Prophecy from Pip');

      card.innerHTML = `
        <button class="prophecy-close-btn" type="button" aria-label="Close prophecy">✕</button>
        <div class="prophecy-header">
          <span class="prophecy-pip-emoji">${data.emoji}</span>
          <div>
            <div class="prophecy-tag">✦ PIP'S DREAM CAPSULE ✦</div>
            <div class="prophecy-title">${data.title}</div>
          </div>
        </div>
        <p class="prophecy-text">${data.text}</p>
        <div class="prophecy-stars">${data.stars.split('').map(s => `<span>${s}</span>`).join('')}</div>
        <div class="prophecy-badge">${data.badge}</div>
      `;

      // Center on screen
      portal.appendChild(card);
      activeCard = card;

      // Position after append so we can measure
      requestAnimationFrame(() => {
        const cw = card.offsetWidth;
        const ch = card.offsetHeight;
        card.style.left = `${(window.innerWidth - cw) / 2}px`;
        card.style.top = `${Math.max(60, (window.innerHeight - ch) / 2)}px`;
      });

      // Skull confetti burst
      burstConfetti();

      // Close button
      card.querySelector('.prophecy-close-btn').addEventListener('click', () => {
        closeCard(card);
        activeCard = null;
      });

      // Auto-close after 9 seconds
      const autoClose = setTimeout(() => {
        if (card.isConnected) { closeCard(card); activeCard = null; }
      }, 9000);
      card._autoClose = autoClose;
    }

    function closeCard(card, immediate = false) {
      clearTimeout(card._autoClose);
      if (immediate) { card.remove(); return; }
      card.classList.add('closing');
      card.addEventListener('animationend', () => card.remove(), { once: true });
    }

    /* ---- Skull Confetti ---- */
    function burstConfetti() {
      if (!confettiCanvas) return;
      const ctx = confettiCanvas.getContext('2d');
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;

      const pieces = [];
      const SYMBOLS = ['💀', '⭐', '✨', '🌙', '💫', '🌸', '👻'];
      const count = 60;

      for (let i = 0; i < count; i++) {
        pieces.push({
          x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
          y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 18,
          vy: -8 - Math.random() * 12,
          size: 14 + Math.random() * 18,
          sym: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          rot: Math.random() * 360,
          rotV: (Math.random() - 0.5) * 12,
          life: 1,
          decay: 0.012 + Math.random() * 0.015,
          gravity: 0.4 + Math.random() * 0.3
        });
      }

      function draw() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let alive = false;
        pieces.forEach(p => {
          if (p.life <= 0) return;
          alive = true;
          p.x += p.vx;
          p.vy += p.gravity;
          p.y += p.vy;
          p.rot += p.rotV;
          p.life -= p.decay;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.sym, 0, 0);
          ctx.restore();
        });
        if (alive) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
      requestAnimationFrame(draw);
    }

    btn.addEventListener('click', launchCapsule);
  }

  /* --------------------------------------------------------------------------
     21. APPLICATION INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    BootScreen.init();
    initGlobalControls();
    initHero();
    CharacterMotion.init();
    initMeetPip();
    initStoryCarousel();
    SecretTransformationChamber.init();
    Lullaby3DBox.init();
    initNightlights();
    initDeliveryConsole();
    initDreamJar();
    initChat();
    initGuestbook();
    initClosingScene();
    initDreamCapsuleLauncher();
    initCursorTrail();
    initAmbientParallax();
    initScrollStoryObserver();

    console.log("🌙 Pip's Midnight Nursery Engine Loaded Successfully (Boss Level / Track 1 Legendary Experience).");
  });

})();
