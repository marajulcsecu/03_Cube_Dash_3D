/**
 * Endless Tunnel World Manager
 * Manages segment pool, continuous movement toward player, recycling, and seeded generation.
 */

import { ObjectPool } from './ObjectPools.js';
import { TunnelSegment } from './TunnelSegment.js';
import { SeededRNG } from './SeededRNG.js';
import { logger } from '../services/Logger.js';

export class TunnelManager {
  constructor(scene, materialFactory, seed = 42) {
    this.scene = scene;
    this.materialFactory = materialFactory;
    this.rng = new SeededRNG(seed);
    
    this.segmentLength = 10;
    this.visibleSegmentsCount = 15;
    this.activeSegments = [];
    this.totalSegmentsSpawned = 0;

    this.segmentPool = new ObjectPool(
      () => new TunnelSegment(this.materialFactory),
      (segment) => segment.reset(),
      25
    );

    this.initWorld();
  }

  initWorld() {
    // Clear existing active segments
    this.clearWorld();

    // Spawn initial chain of segments starting from Z = 0 extending into distance -Z
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

    // Every 8th segment is a safe Rest Segment
    const isRest = (this.totalSegmentsSpawned % 8 === 0);
    segment.reset(this.totalSegmentsSpawned, isRest);
    segment.meshGroup.position.z = targetZ;

    this.activeSegments.push(segment);
    this.scene.add(segment.meshGroup);
  }

  update(delta, speed = 20) {
    const moveDistance = delta * speed;

    for (let i = 0; i < this.activeSegments.length; i++) {
      const segment = this.activeSegments[i];
      segment.meshGroup.position.z += moveDistance;
    }

    // Recycle segments that pass behind player camera (z > 15)
    this._recyclePassedSegments();
  }

  _recyclePassedSegments() {
    while (this.activeSegments.length > 0 && this.activeSegments[0].meshGroup.position.z > 15) {
      const oldestSegment = this.activeSegments.shift();
      this.scene.remove(oldestSegment.meshGroup);

      // Find Z position of furthest segment in chain
      const lastZ = this.activeSegments[this.activeSegments.length - 1].meshGroup.position.z;
      const nextZ = lastZ - this.segmentLength;

      // Re-anchor recycled segment at back of queue
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
