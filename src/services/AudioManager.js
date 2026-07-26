/**
 * Authoritative Web Audio API Sound Synthesizer and Audio Service
 * Generates 100% offline procedural sound effects (jump, shard collection,
 * collision crash, streak multiplier up) with zero external asset dependencies.
 * Integrates with GameBridge window.setAudioMuted(isMuted).
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.5;
    this.initialized = false;

    this._bindWindowBridge();
    this._bindUserGestureInit();
  }

  _bindWindowBridge() {
    // MegaGameBox global window.setAudioMuted contract
    window.setAudioMuted = (isMuted) => {
      this.muted = !!isMuted;
    };
  }

  _bindUserGestureInit() {
    const initAudio = () => {
      if (this.initialized) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.initialized = true;
          if (this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
        }
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('pointerdown', initAudio);
    window.addEventListener('keydown', initAudio);
  }

  playJump() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playShard() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playCollision() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playSpaceshipFlyby() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Doppler effect frequency sweep: pitch rises as ship approaches, drops as it passes
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.6);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.6);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  // ── Cyberpunk Vehicle Engine Sound Synthesizer ─────────────────────────────────
  // ── Vehicle Engine Sound Synthesizer (Disabled per user request) ────────────────
  startEngine() {
    // Silenced annoying vehicle sound per user request!
    return;
  }

  updateEngineRPM(speedNormalized = 0) {
    // Silenced annoying vehicle sound per user request!
    return;
  }

  stopEngine() {
    this.engineRunning = false;
  }

  // ── 🎵 Qawwali Style Procedural Background Music Generator ──────────────────────
  startQawwaliBGM() {
    if (!this._canPlay() || this.qawwaliActive) return;

    try {
      const now = this.ctx.currentTime;
      this.qawwaliActive = true;

      // 1. Harmonium Sur / Drone (Sa - Pa: C3 = 130.81 Hz, G3 = 196.00 Hz)
      this.droneSa = this.ctx.createOscillator();
      this.dronePa = this.ctx.createOscillator();
      this.droneSa.type = 'sawtooth';
      this.dronePa.type = 'triangle';

      this.droneSa.frequency.setValueAtTime(130.81, now);
      this.dronePa.frequency.setValueAtTime(196.00, now);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(550, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.linearRampToValueAtTime(this.volume * 0.12, now + 1.0);

      this.droneSa.connect(this.droneFilter);
      this.dronePa.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneSa.start(now);
      this.dronePa.start(now);

      // 2. Qawwali Harmonium & Tabla/Clap Sequencer Loop (Raag Yaman Scale)
      // Scale Frequencies (Hz): C4(261.63), D4(293.66), E4(329.63), F#4(369.99), G4(392.00), A4(440.00), B4(493.88), C5(523.25)
      const scale = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25];
      const melodySequence = [0, 2, 4, 3, 4, 6, 5, 4, 2, 3, 4, 2, 1, 0, 4, 7];
      let step = 0;

      this.qawwaliTimer = setInterval(() => {
        if (!this.qawwaliActive || !this._canPlay()) return;

        try {
          const t = this.ctx.currentTime;

          // A) Harmonium Lead Reed Note
          const noteFreq = scale[melodySequence[step % melodySequence.length]];
          const harmOsc = this.ctx.createOscillator();
          const harmGain = this.ctx.createGain();

          harmOsc.type = 'sawtooth';
          harmOsc.frequency.setValueAtTime(noteFreq, t);

          harmGain.gain.setValueAtTime(this.volume * 0.08, t);
          harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

          harmOsc.connect(harmGain);
          harmGain.connect(this.ctx.destination);

          harmOsc.start(t);
          harmOsc.stop(t + 0.28);

          // B) Qawwali Handclap / Tabla Rhythm Pulse (on beats 0, 2, 4, 6)
          if (step % 2 === 0) {
            const clapOsc = this.ctx.createOscillator();
            const clapGain = this.ctx.createGain();

            clapOsc.type = 'triangle';
            clapOsc.frequency.setValueAtTime(step % 4 === 0 ? 110 : 220, t);

            clapGain.gain.setValueAtTime(this.volume * 0.1, t);
            clapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            clapOsc.connect(clapGain);
            clapGain.connect(this.ctx.destination);

            clapOsc.start(t);
            clapOsc.stop(t + 0.08);
          }

          step++;
        } catch (e) {}
      }, 300); // 100 BPM Qawwali Tempo
    } catch (e) {
      this.qawwaliActive = false;
    }
  }

  stopQawwaliBGM() {
    if (this.qawwaliTimer) {
      clearInterval(this.qawwaliTimer);
      this.qawwaliTimer = null;
    }

    if (this.droneSa) {
      try { this.droneSa.stop(); this.droneSa.disconnect(); } catch (e) {}
      this.droneSa = null;
    }
    if (this.dronePa) {
      try { this.dronePa.stop(); this.dronePa.disconnect(); } catch (e) {}
      this.dronePa = null;
    }
    if (this.droneGain) {
      try { this.droneGain.disconnect(); } catch (e) {}
      this.droneGain = null;
    }

    this.qawwaliActive = false;
  }

  stopEngine() {
    if (!this.engineRunning || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      }
      setTimeout(() => {
        try {
          if (this.engineOsc) { this.engineOsc.stop(); this.engineOsc.disconnect(); }
          if (this.subOsc) { this.subOsc.stop(); this.subOsc.disconnect(); }
          if (this.engineLFO) { this.engineLFO.stop(); this.engineLFO.disconnect(); }
          if (this.engineFilter) this.engineFilter.disconnect();
          if (this.engineGain) this.engineGain.disconnect();
        } catch (e) {}
        this.engineRunning = false;
      }, 220);
    } catch (e) {
      this.engineRunning = false;
    }
  }

  updateEngine(speedRatio = 1.0, active = true) {
    if (this.muted || !active) {
      if (this.engineRunning) this.stopEngine();
      return;
    }

    if (!this.engineRunning) {
      this.startEngine();
      return;
    }

    if (!this.ctx || !this.engineOsc || !this.engineFilter) return;

    try {
      const now = this.ctx.currentTime;
      const clampedRatio = Math.max(0.5, Math.min(2.5, speedRatio));

      // Pitch sweeps up with vehicle speed (65Hz up to 160Hz)
      const baseFreq = 65 * clampedRatio;
      this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.1);
      this.subOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.1);

      // Sci-fi turbine filter cutoff opens up as vehicle accelerates (320Hz up to 1400Hz)
      const filterCutoff = 320 + (clampedRatio - 0.5) * 600;
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.1);

      // Volume adjusts slightly with speed
      if (this.engineGain) {
        const targetVol = this.volume * (0.15 + (clampedRatio - 0.5) * 0.08);
        this.engineGain.gain.setTargetAtTime(targetVol, now, 0.1);
      }
    } catch (e) {}
  }

  playAsteroidRumble() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playMonsterBioHum() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playLaserCrackle() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2800, now + 0.15);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.Q.setValueAtTime(5.0, now);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playPlasmaSawWhir() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playWormholeSuction() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playCoinCollect(streak = 0) {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 987.77; // B5 pitch
      const pitchShift = Math.min( streak * 80, 600 );
      const startFreq = baseFreq + pitchShift;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.33, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playMagnetActivate() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playShieldActivate() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

      gain.gain.setValueAtTime(this.volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playShieldShatter() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playMultiplierActivate() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playEmpBlast() {
    if (!this._canPlay()) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

      gain.gain.setValueAtTime(this.volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  _canPlay() {
    return this.initialized && this.ctx && !this.muted && this.ctx.state === 'running';
  }
}

export const audioManager = new AudioManager();
