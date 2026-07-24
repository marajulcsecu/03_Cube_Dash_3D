/**
 * Seeded Pseudo-Random Number Generator (PRNG) using Mulberry32.
 * Guarantees 100% deterministic procedural generation across runs.
 */

export class SeededRNG {
  constructor(seed = 12345) {
    this.initialSeed = seed;
    this.seed = seed;
  }

  setSeed(seed) {
    this.initialSeed = seed;
    this.seed = seed;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer between min (inclusive) and max (inclusive).
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random element from an array.
   */
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.nextInt(0, array.length - 1)];
  }

  reset() {
    this.seed = this.initialSeed;
  }
}
