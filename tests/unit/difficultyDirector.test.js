import { describe, it, expect, beforeEach } from 'vitest';
import { DifficultyDirector, DIFFICULTY_TIERS } from '../../src/gameplay/DifficultyDirector.js';

describe('DifficultyDirector Unit Tests', () => {
  let director;

  beforeEach(() => {
    director = new DifficultyDirector();
  });

  it('should initialize at Tier 1 CALM with 15 m/s speed and 0 distance', () => {
    expect(director.currentTier.name).toBe('CALM');
    expect(director.currentSpeed).toBe(15.0);
    expect(director.stats.distance).toBe(0);
  });

  it('should advance difficulty tiers based on distance covered', () => {
    // Simulate distance up to 350m (Tier 2 FLOW trigger)
    director.update(25.0); // 15 m/s * 25s = 375m
    expect(director.pendingTierChange).toBe(true);

    // Transition applied ONLY at safe rest segment
    const applied = director.applyPendingTierTransition();
    expect(applied).toBe(true);
    expect(director.currentTier.name).toBe('FLOW');
    expect(director.targetSpeed).toBe(20.0);
  });

  it('should enforce hard speed cap at 30 m/s in Mastery Tier', () => {
    director.setTierDirectly(5); // Jump to Mastery Tier
    expect(director.currentTier.name).toBe('MASTERY');
    expect(director.targetSpeed).toBe(30.0);

    // Simulate extensive running
    for (let i = 0; i < 100; i++) {
      director.update(1.0);
    }
    expect(director.currentSpeed).toBeLessThanOrEqual(30.0);
  });

  it('should allow instant tier jumps via debug panel controls', () => {
    director.setTierDirectly(3); // FOCUS
    expect(director.currentTier.name).toBe('FOCUS');
    expect(director.targetSpeed).toBe(24.0);

    director.setTierDirectly(4); // EXPERT
    expect(director.currentTier.name).toBe('EXPERT');
    expect(director.targetSpeed).toBe(28.0);
  });
});
