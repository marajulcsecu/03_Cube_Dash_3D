import { describe, it, expect } from 'vitest';
import { PatternLibrary, PATTERNS } from '../../src/world/PatternLibrary.js';
import { ReachabilityValidator } from '../../src/world/ReachabilityValidator.js';
import { SeededRNG } from '../../src/world/SeededRNG.js';

describe('Obstacle Pattern Library & Reachability Validator Unit Tests', () => {
  const library = new PatternLibrary();
  const validator = new ReachabilityValidator({ laneChangeTime: 0.12, segmentLength: 10 });

  it('should validate that all production patterns in library pass reachability validation', () => {
    const allPatterns = library.getAllPatterns();
    expect(allPatterns.length).toBeGreaterThan(5);

    // Validate sequential transitions across all patterns
    const result = validator.validateSequence(allPatterns, 20);
    expect(result.valid).toBe(true);
  });

  it('should intentionally reject physically impossible transition fixtures', () => {
    // Impossible Fixture A: Safe path only on Lane 0
    const impossibleA = {
      id: 'impossible_lane_0',
      safePath: [0],
      incompatibleNeighbors: []
    };

    // Impossible Fixture B: Safe path only on Lane 4
    const impossibleB = {
      id: 'impossible_lane_4',
      safePath: [4],
      incompatibleNeighbors: []
    };

    // At extreme high speed (speed = 100), time available = 10 / 100 = 0.1s.
    // Shift from Lane 0 to Lane 4 requires 4 * 0.12s = 0.48s.
    const result = validator.validateTransition(impossibleA, impossibleB, 100);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Insufficient time');
  });

  it('should reject explicitly marked incompatible neighbor patterns', () => {
    const patternA = {
      id: 'pattern_a',
      safePath: [2],
      incompatibleNeighbors: ['pattern_b']
    };

    const patternB = {
      id: 'pattern_b',
      safePath: [2],
      incompatibleNeighbors: []
    };

    const result = validator.validateTransition(patternA, patternB, 20);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('incompatible neighbor');
  });

  it('should retrieve deterministic patterns using SeededRNG', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);

    const pattern1 = library.getRandomPattern(rng1, 2);
    const pattern2 = library.getRandomPattern(rng2, 2);

    expect(pattern1.id).toBe(pattern2.id);
  });
});
