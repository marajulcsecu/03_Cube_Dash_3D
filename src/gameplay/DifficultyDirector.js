/**
 * Authoritative Difficulty Director & Endless Progression Engine
 * Manages distance-based difficulty tiers (Calm, Flow, Focus, Expert, Mastery),
 * capped maximum speed, pattern pool selection, and safe-rest segment tier transitions.
 */

export const DIFFICULTY_TIERS = [
  {
    tier: 1,
    name: 'CALM',
    minDistance: 0,
    maxDistance: 300,
    speed: 15.0,
    maxPatternDifficulty: 1,
    particleRate: 40,
    fogDensity: 0.005
  },
  {
    tier: 2,
    name: 'FLOW',
    minDistance: 300,
    maxDistance: 700,
    speed: 20.0,
    maxPatternDifficulty: 2,
    particleRate: 100,
    fogDensity: 0.007
  },
  {
    tier: 3,
    name: 'FOCUS',
    minDistance: 700,
    maxDistance: 1200,
    speed: 24.0,
    maxPatternDifficulty: 2,
    particleRate: 160,
    fogDensity: 0.009
  },
  {
    tier: 4,
    name: 'EXPERT',
    minDistance: 1200,
    maxDistance: 1800,
    speed: 28.0,
    maxPatternDifficulty: 3,
    particleRate: 220,
    fogDensity: 0.011
  },
  {
    tier: 5,
    name: 'MASTERY',
    minDistance: 1800,
    maxDistance: Infinity,
    speed: 30.0, // CAPPED HARD MAXIMUM SPEED
    maxPatternDifficulty: 3,
    particleRate: 280,
    fogDensity: 0.013
  }
];

export class DifficultyDirector {
  constructor() {
    this.distanceCovered = 0;
    this.currentTierIndex = 0;
    this.targetTierIndex = 0;
    this.currentSpeed = DIFFICULTY_TIERS[0].speed;
    this.targetSpeed = DIFFICULTY_TIERS[0].speed;
    this.pendingTierChange = false;
  }

  reset() {
    this.distanceCovered = 0;
    this.currentTierIndex = 0;
    this.targetTierIndex = 0;
    this.currentSpeed = DIFFICULTY_TIERS[0].speed;
    this.targetSpeed = DIFFICULTY_TIERS[0].speed;
    this.pendingTierChange = false;
  }

  update(delta) {
    this.distanceCovered += this.currentSpeed * delta;

    // Determine target tier based on distance covered
    let newTierIdx = 0;
    for (let i = 0; i < DIFFICULTY_TIERS.length; i++) {
      if (this.distanceCovered >= DIFFICULTY_TIERS[i].minDistance) {
        newTierIdx = i;
      }
    }

    if (newTierIdx !== this.targetTierIndex) {
      this.targetTierIndex = newTierIdx;
      this.pendingTierChange = true;
    }

    // Smoothly lerp speed towards target tier speed
    if (this.currentSpeed !== this.targetSpeed) {
      this.currentSpeed += (this.targetSpeed - this.currentSpeed) * Math.min(1.0, delta * 2.0);
    }
  }

  /**
   * Called by TunnelManager ONLY during safe rest segment transitions
   * to ensure speed/tier advances strictly on safe runways!
   */
  applyPendingTierTransition() {
    if (this.pendingTierChange) {
      this.currentTierIndex = this.targetTierIndex;
      this.targetSpeed = DIFFICULTY_TIERS[this.currentTierIndex].speed;
      this.pendingTierChange = false;
      return true; // Transition applied!
    }
    return false;
  }

  setTierDirectly(tierNumber) {
    const idx = Math.max(0, Math.min(DIFFICULTY_TIERS.length - 1, tierNumber - 1));
    this.currentTierIndex = idx;
    this.targetTierIndex = idx;
    this.currentSpeed = DIFFICULTY_TIERS[idx].speed;
    this.targetSpeed = DIFFICULTY_TIERS[idx].speed;
    this.distanceCovered = DIFFICULTY_TIERS[idx].minDistance + 10;
    this.pendingTierChange = false;
  }

  get currentTier() {
    return DIFFICULTY_TIERS[this.currentTierIndex];
  }

  get stats() {
    return {
      tier: this.currentTier.tier,
      tierName: this.currentTier.name,
      distance: Math.floor(this.distanceCovered),
      speed: parseFloat(this.currentSpeed.toFixed(1)),
      targetSpeed: this.targetSpeed
    };
  }
}
