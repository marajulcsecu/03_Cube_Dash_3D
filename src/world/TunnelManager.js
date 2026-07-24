/**
 * Endless Tunnel World Manager
 * Manages segment pool, continuous movement, obstacle patterns, recycling, and seeded generation.
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
      this._populateObstacles(segment);
    }

    this.activeSegments.push(segment);
    this.scene.add(segment.meshGroup);
  }

  _populateObstacles(segment) {
    const patternType = this.rng.nextInt(1, 5);

    switch (patternType) {
      case 1:
        // Wall on sides, safe center
        segment.addObstacle('wall', 0);
        segment.addObstacle('wall', 4);
        segment.addObstacle('shard', 2);
        break;
      case 2:
        // Low barrier across center (requires jump!)
        segment.addObstacle('low_barrier', 2);
        segment.addObstacle('shard', 2, -2);
        break;
      case 3:
        // Walls blocking lanes 1 and 2
        segment.addObstacle('wall', 1);
        segment.addObstacle('wall', 2);
        segment.addObstacle('shard', 3);
        break;
      case 4:
        // Floor gap on side lanes 0 and 1
        segment.addFloorGap([0, 1]);
        segment.addObstacle('shard', 3);
        break;
      case 5:
        // Shard line guide
        segment.addObstacle('shard', 1, -2);
        segment.addObstacle('shard', 2, 0);
        segment.addObstacle('shard', 3, 2);
        break;
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
