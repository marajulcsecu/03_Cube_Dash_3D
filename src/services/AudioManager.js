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

  _canPlay() {
    return this.initialized && this.ctx && !this.muted && this.ctx.state === 'running';
  }
}

export const audioManager = new AudioManager();
