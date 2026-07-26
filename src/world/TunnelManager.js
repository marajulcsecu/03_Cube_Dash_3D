/**
 * Endless Tunnel World Manager
 * Manages segment pool, continuous movement, difficulty director integration,
 * validated pattern library generation, and object recycling.
 */

import * as THREE from 'three';
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

    const isTier1 = (this.difficultyDirector.currentTierIndex === 0);
    // In Tier 1 CALM, alternate every 2nd segment as a clean runway for generous spacing!
    const restInterval = isTier1 ? 2 : 4;

    const isRest = (this.totalSegmentsSpawned % restInterval === 0);
    segment.reset(this.totalSegmentsSpawned, isRest);
    segment.meshGroup.position.z = targetZ;

    // Apply difficulty tier transitions ONLY at safe rest segments
    if (isRest) {
      const transitioned = this.difficultyDirector.applyPendingTierTransition();
      if (transitioned) {
        logger.info(`Difficulty Tier advanced to: ${this.difficultyDirector.currentTier.name}`, this.difficultyDirector.stats);
      }
      this.lastPattern = this.patternLibrary.getPattern('safe_runway');

      // Controlled rare chance for Power-Ups or Coin Trails on safe runway segments
      const rewardRoll = this.rng.next();
      if (rewardRoll < 0.08) {
        // 8% Rare Cyber Magnet Power-Up
        const pattern = this.patternLibrary.getPattern('magnet_powerup_center');
        if (pattern && pattern.hazards) {
          pattern.hazards.forEach(h => segment.addObstacleFromConfig(h));
        }
      } else if (rewardRoll < 0.22) {
        // 14% Coin Trail Bonus
        const pattern = this.patternLibrary.getPattern('coin_trail_center');
        if (pattern && pattern.hazards) {
          pattern.hazards.forEach(h => segment.addObstacleFromConfig(h));
        }
      }
    } else if (this.totalSegmentsSpawned > 6) { // 60m initial onboarding runway
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

  updateMagnetAttraction(playerPos, delta) {
    if (!playerPos) return;

    for (const segment of this.activeSegments) {
      if (!segment.obstacles) continue;
      const segZ = segment.meshGroup.position.z;

      for (const obstacle of segment.obstacles) {
        if (!obstacle.active || obstacle.type !== 'coin' || !obstacle.mesh) continue;

        // Target relative Z position inside segment space
        const targetRelZ = playerPos.z - segZ;

        // Vector towards player position
        const dx = playerPos.x - obstacle.x;
        const dy = playerPos.y - obstacle.y;
        const dz = targetRelZ - obstacle.relativeZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 40.0) { // Active within 40m radius
          const speed = Math.max(30.0, 60.0 - dist); // Dynamic acceleration as coin approaches player
          const moveStep = delta * speed;

          if (dist <= moveStep) {
            obstacle.x = playerPos.x;
            obstacle.y = playerPos.y;
            obstacle.relativeZ = targetRelZ;
          } else {
            obstacle.x += (dx / dist) * moveStep;
            obstacle.y += (dy / dist) * moveStep;
            obstacle.relativeZ += (dz / dist) * moveStep;
          }

          obstacle.mesh.position.x = obstacle.x;
          obstacle.mesh.position.y = obstacle.y;
          obstacle.mesh.position.z = obstacle.relativeZ;
        }
      }
    }
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
