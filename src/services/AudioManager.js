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
  startEngine() {
    if (!this._canPlay() || this.engineRunning) return;

    try {
      const now = this.ctx.currentTime;
      this.engineRunning = true;

      // 1. Sub-bass growl oscillator (sawtooth for rich harmonics)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, now);

      // 2. High-resonance Sci-Fi lowpass filter (Tron / Cyberpunk turbine hum)
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, now);
      this.engineFilter.Q.setValueAtTime(5.0, now); // High Q gives sci-fi whistle/hum

      // 3. Sub-oscillator for deep bass rumble (sine at octave down)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(32.5, now);

      // 4. LFO for engine pulse modulation
      this.engineLFO = this.ctx.createOscillator();
      this.engineLFO.type = 'sine';
      this.engineLFO.frequency.setValueAtTime(14, now); // 14 Hz pulsing rumble

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(15, now);
      this.engineLFO.connect(this.lfoGain.gain);

      // 5. Main Engine Master Gain Node
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.001, now);
      this.engineGain.gain.linearRampToValueAtTime(this.volume * 0.18, now + 0.3);

      // Signal routing: Osc -> Filter -> Master Gain -> Audio Destination
      this.engineOsc.connect(this.engineFilter);
      this.subOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.subOsc.start(now);
      this.engineLFO.start(now);
    } catch (e) {
      this.engineRunning = false;
    }
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
