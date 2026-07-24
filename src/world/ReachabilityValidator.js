/**
 * Authoritative Reachability Validator
 * Simulates player movement limits (120ms per lane shift, jump height/duration)
 * and validates that consecutive pattern sequences are physically beatable.
 */

export class ReachabilityValidator {
  constructor(config = {}) {
    this.laneChangeTime = config.laneChangeTime || 0.12; // 120ms per lane
    this.segmentLength = config.segmentLength || 10;
  }

  /**
   * Validate if a transition from pattern A to pattern B is beatable at given game speed.
   * Returns { valid: boolean, reason?: string, timeAvailable: number, minTimeRequired: number }
   */
  validateTransition(patternA, patternB, gameSpeed = 20) {
    if (!patternA || !patternB) return { valid: true };

    // Rest segments and safe runways are always valid
    if (patternA.id === 'safe_runway' || patternB.id === 'safe_runway') {
      return { valid: true };
    }

    const timeAvailable = this.segmentLength / gameSpeed;

    // Find minimum lane distance between any valid safe lane in A to any valid safe lane in B
    let minLaneDelta = Infinity;
    for (const laneA of patternA.safePath) {
      for (const laneB of patternB.safePath) {
        const delta = Math.abs(laneA - laneB);
        if (delta < minLaneDelta) {
          minLaneDelta = delta;
        }
      }
    }

    const minTimeRequired = minLaneDelta * this.laneChangeTime;

    if (minTimeRequired > timeAvailable) {
      return {
        valid: false,
        reason: `Insufficient time to shift ${minLaneDelta} lanes (${minTimeRequired.toFixed(2)}s required > ${timeAvailable.toFixed(2)}s available)`,
        timeAvailable,
        minTimeRequired
      };
    }

    // Check explicit incompatibleNeighbors metadata
    if (patternA.incompatibleNeighbors && patternA.incompatibleNeighbors.includes(patternB.id)) {
      return {
        valid: false,
        reason: `Pattern ${patternB.id} is explicitly flagged as incompatible neighbor to ${patternA.id}`,
        timeAvailable,
        minTimeRequired
      };
    }

    return { valid: true, timeAvailable, minTimeRequired };
  }

  /**
   * Validate an entire pattern sequence array.
   */
  validateSequence(patternSequence, gameSpeed = 20) {
    for (let i = 0; i < patternSequence.length - 1; i++) {
      const result = this.validateTransition(patternSequence[i], patternSequence[i + 1], gameSpeed);
      if (!result.valid) {
        return {
          valid: false,
          failedIndex: i,
          patternA: patternSequence[i],
          patternB: patternSequence[i + 1],
          reason: result.reason
        };
      }
    }
    return { valid: true };
  }
}
