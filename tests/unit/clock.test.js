import { describe, it, expect, beforeEach } from 'vitest';
import { Clock } from '../../src/core/Clock.js';

describe('Clock Service Unit Tests', () => {
  let clock;

  beforeEach(() => {
    clock = new Clock(0.1);
  });

  it('should initialize with zero elapsed and delta', () => {
    expect(clock.elapsedSeconds).toBe(0);
    expect(clock.deltaSeconds).toBe(0);
  });

  it('should calculate delta time between updates', () => {
    clock.start(1000);
    clock.update(1050); // +50ms
    expect(clock.deltaSeconds).toBeCloseTo(0.05, 3);
    expect(clock.elapsedSeconds).toBeCloseTo(0.05, 3);
  });

  it('should clamp delta time when frame time exceeds maxDelta', () => {
    clock.start(1000);
    clock.update(1500); // +500ms lag spike
    expect(clock.deltaSeconds).toBe(0.1); // Clamped to maxDelta (0.1)
  });

  it('should return 0 delta time when paused', () => {
    clock.start(1000);
    clock.pause();
    clock.update(1050);
    expect(clock.deltaSeconds).toBe(0);
  });
});
