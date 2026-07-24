/**
 * Endless Tunnel World Manager
 * Manages segment pool, continuous movement, difficulty director integration,
 * validated pattern library generation, and object recycling.
 */

import { ObjectPool } from './ObjectPools.js';
import { TunnelSegment } from './TunnelSegment.js';
import { SeededRNG } from './SeededRNG.js';
import { PatternLibrary } from './PatternLibrary.js';
import { ReachabilityValidator } from './ReachabilityValidator.js';
import { DifficultyDirector } from '../gameplay/DifficultyDirector.js';
import { logger } from '../services/Logger.js';

export class TunnelManager {
  constructor(scene, materialFactory, seed = 42) {
    this.scene = scene;
    this.materialFactory = materialFactory;
    this.rng = new SeededRNG(seed);
    this.patternLibrary = new PatternLibrary();
    this.validator = new ReachabilityValidator();
    this.difficultyDirector = new DifficultyDirector();
    
    this.segmentLength = 10;
    this.visibleSegmentsCount = 15;
    this.activeSegments = [];
    this.totalSegmentsSpawned = 0;

    this.lastPattern = null;

    this.segmentPool = new ObjectPool(
      () => new TunnelSegment(this.materialFactory),
      (segment) => segment.reset(),
      25
    );

    this.manualTierOverride = null;

    this.initWorld();
  }

  initWorld(preserveTier = false) {
    const savedTier = (preserveTier || this.manualTierOverride)
      ? (this.difficultyDirector.currentTierIndex + 1)
      : null;

    this.clearWorld();

    if (savedTier !== null) {
      this.difficultyDirector.setTierDirectly(savedTier);
    } else {
      this.difficultyDirector.reset();
    }

    for (let i = 0; i < this.visibleSegmentsCount; i++) {
      this._spawnNextSegment(i * -this.segmentLength);
    }

    logger.info('TunnelManager initialized endless tunnel world.', {
      seed: this.rng.initialSeed,
      active: this.activeSegments.length
    });
  }

  setManualTier(tierNumber) {
    this.manualTierOverride = tierNumber;
    this.difficultyDirector.setTierDirectly(tierNumber);
  }

  _spawnNextSegment(targetZ) {
    const segment = this.segmentPool.acquire();
    this.totalSegmentsSpawned++;

    const isRest = (this.totalSegmentsSpawned % 7 === 0);
    segment.reset(this.totalSegmentsSpawned, isRest);
    segment.meshGroup.position.z = targetZ;

    // Apply difficulty tier transitions ONLY at safe rest segments
    if (isRest) {
      const transitioned = this.difficultyDirector.applyPendingTierTransition();
      if (transitioned) {
        logger.info(`Difficulty Tier advanced to: ${this.difficultyDirector.currentTier.name}`, this.difficultyDirector.stats);
      }
      this.lastPattern = this.patternLibrary.getPattern('safe_runway');
    } else if (this.totalSegmentsSpawned > 3) {
      this._populateValidatedPattern(segment);
    } else {
      this.lastPattern = this.patternLibrary.getPattern('safe_runway');
    }

    this.activeSegments.push(segment);
    this.scene.add(segment.meshGroup);
  }

  _populateValidatedPattern(segment) {
    const currentTier = this.difficultyDirector.currentTier;
    let candidatePattern = this.patternLibrary.getRandomPattern(this.rng, currentTier.maxPatternDifficulty);
    
    // Validate reachability from previous pattern
    const valResult = this.validator.validateTransition(this.lastPattern, candidatePattern, this.difficultyDirector.currentSpeed);
    if (!valResult.valid) {
      logger.warn(`ReachabilityValidator rejected pattern transition from ${this.lastPattern?.id} to ${candidatePattern.id}. Fallback to safe_runway.`);
      candidatePattern = this.patternLibrary.getPattern('safe_runway');
    }

    this.lastPattern = candidatePattern;

    if (candidatePattern && candidatePattern.hazards) {
      candidatePattern.hazards.forEach(hazard => {
        segment.addObstacleFromConfig(hazard);
      });
    }
  }

  spawnSpecificPattern(patternId) {
    const pattern = this.patternLibrary.getPattern(patternId);
    if (!pattern) return;

    // Clear world and force spawn specific pattern
    this.clearWorld();

    for (let i = 0; i < 5; i++) {
      const segment = this.segmentPool.acquire();
      this.totalSegmentsSpawned++;
      segment.reset(this.totalSegmentsSpawned, false);
      segment.meshGroup.position.z = i * -this.segmentLength;

      if (i === 2) {
        pattern.hazards.forEach(hazard => segment.addObstacleFromConfig(hazard));
      }

      this.activeSegments.push(segment);
      this.scene.add(segment.meshGroup);
    }
  }

  update(delta) {
    this.difficultyDirector.update(delta);

    const speed = this.difficultyDirector.currentSpeed;
    const moveDistance = delta * speed;

    for (let i = 0; i < this.activeSegments.length; i++) {
      const segment = this.activeSegments[i];
      segment.meshGroup.position.z += moveDistance;
      segment.update(delta);
    }

    this._recyclePassedSegments();
  }

  _recyclePassedSegments() {
    while (this.activeSegments.length > 0 && this.activeSegments[0].meshGroup.position.z > 15) {
      const oldestSegment = this.activeSegments.shift();
      this.scene.remove(oldestSegment.meshGroup);

      const lastZ = this.activeSegments[this.activeSegments.length - 1].meshGroup.position.z;
      const nextZ = lastZ - this.segmentLength;

      this.segmentPool.release(oldestSegment);
      this._spawnNextSegment(nextZ);
    }
  }

  setSeed(seed) {
    this.rng.setSeed(seed);
    this.initWorld();
  }

  clearWorld() {
    while (this.activeSegments.length > 0) {
      const segment = this.activeSegments.pop();
      this.scene.remove(segment.meshGroup);
      this.segmentPool.release(segment);
    }
    this.totalSegmentsSpawned = 0;
    this.lastPattern = null;
    this.rng.reset();
  }

  get stats() {
    return {
      active: this.activeSegments.length,
      pooled: this.segmentPool.stats.pooled,
      totalSpawned: this.totalSegmentsSpawned,
      seed: this.rng.initialSeed,
      tier: this.difficultyDirector.currentTier.name,
      distance: Math.floor(this.difficultyDirector.distanceCovered),
      speed: parseFloat(this.difficultyDirector.currentSpeed.toFixed(1))
    };
  }

  dispose() {
    this.clearWorld();
    this.segmentPool.dispose();
  }
}
