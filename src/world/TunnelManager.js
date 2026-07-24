/**
 * Endless Tunnel World Manager
 * Manages segment pool, continuous movement, validated pattern library generation, and object recycling.
 */

import { ObjectPool } from './ObjectPools.js';
import { TunnelSegment } from './TunnelSegment.js';
import { SeededRNG } from './SeededRNG.js';
import { PatternLibrary } from './PatternLibrary.js';
import { ReachabilityValidator } from './ReachabilityValidator.js';
import { logger } from '../services/Logger.js';

export class TunnelManager {
  constructor(scene, materialFactory, seed = 42) {
    this.scene = scene;
    this.materialFactory = materialFactory;
    this.rng = new SeededRNG(seed);
    this.patternLibrary = new PatternLibrary();
    this.validator = new ReachabilityValidator();
    
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

    this.initWorld();
  }

  initWorld() {
    this.clearWorld();

    for (let i = 0; i < this.visibleSegmentsCount; i++) {
      this._spawnNextSegment(i * -this.segmentLength);
    }

    logger.info('TunnelManager initialized endless tunnel world.', {
      seed: this.rng.initialSeed,
      active: this.activeSegments.length
    });
  }

  _spawnNextSegment(targetZ) {
    const segment = this.segmentPool.acquire();
    this.totalSegmentsSpawned++;

    const isRest = (this.totalSegmentsSpawned % 7 === 0);
    segment.reset(this.totalSegmentsSpawned, isRest);
    segment.meshGroup.position.z = targetZ;

    // Seed obstacle patterns after initial safe runway (segments 1-3)
    if (this.totalSegmentsSpawned > 3 && !isRest) {
      this._populateValidatedPattern(segment);
    } else {
      this.lastPattern = this.patternLibrary.getPattern('safe_runway');
    }

    this.activeSegments.push(segment);
    this.scene.add(segment.meshGroup);
  }

  _populateValidatedPattern(segment) {
    let candidatePattern = this.patternLibrary.getRandomPattern(this.rng, 2);
    
    // Validate reachability from previous pattern
    const valResult = this.validator.validateTransition(this.lastPattern, candidatePattern, 20);
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

  update(delta, speed = 20) {
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
      seed: this.rng.initialSeed
    };
  }

  dispose() {
    this.clearWorld();
    this.segmentPool.dispose();
  }
}
