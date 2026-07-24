/**
 * Game Loop Clock & Time Service
 * Provides delta time calculation, frame clamping, pause control, and time scaling.
 */

export class Clock {
  constructor(maxDeltaSeconds = 0.1) {
    this.maxDelta = maxDeltaSeconds;
    this.elapsedSeconds = 0;
    this.deltaSeconds = 0;
    this.scale = 1.0;
    this.isPaused = false;
    this.lastTime = 0;
  }

  start(currentTime = performance.now()) {
    this.lastTime = currentTime;
    this.elapsedSeconds = 0;
    this.deltaSeconds = 0;
    this.isPaused = false;
  }

  update(currentTime = performance.now()) {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return 0;
    }

    const rawDelta = (currentTime - this.lastTime) / 1000.0;
    this.lastTime = currentTime;

    if (this.isPaused) {
      this.deltaSeconds = 0;
      return 0;
    }

    // Clamp delta to prevent huge skips during lag or tab switching
    this.deltaSeconds = Math.min(rawDelta, this.maxDelta) * this.scale;
    this.elapsedSeconds += this.deltaSeconds;

    return this.deltaSeconds;
  }

  pause() {
    this.isPaused = true;
    this.deltaSeconds = 0;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  setTimeScale(scale) {
    if (typeof scale === 'number' && scale >= 0) {
      this.scale = scale;
    }
  }

  reset() {
    this.elapsedSeconds = 0;
    this.deltaSeconds = 0;
    this.lastTime = performance.now();
  }
}
