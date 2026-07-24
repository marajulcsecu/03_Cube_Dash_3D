import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG } from '../../src/world/SeededRNG.js';
import { ObjectPool } from '../../src/world/ObjectPools.js';
import { TunnelManager } from '../../src/world/TunnelManager.js';
import { MaterialFactory } from '../../src/render/Materials.js';
import * as THREE from 'three';

describe('World Object Pooling & Deterministic Generation Unit Tests', () => {
  it('should produce identical pseudo-random sequence for identical seeds', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);

    for (let i = 0; i < 20; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('should correctly recycle items in generic ObjectPool', () => {
    let resetCount = 0;
    const pool = new ObjectPool(
      () => ({ value: 0 }),
      (item) => { item.value = 0; resetCount++; },
      5
    );

    expect(pool.stats.pooled).toBe(5);
    expect(pool.stats.active).toBe(0);

    const item1 = pool.acquire();
    item1.value = 99;
    expect(pool.stats.active).toBe(1);
    expect(pool.stats.pooled).toBe(4);

    pool.release(item1);
    expect(pool.stats.active).toBe(0);
    expect(pool.stats.pooled).toBe(5);
    expect(item1.value).toBe(0);
  });

  it('should maintain fixed active segment count during endless tunnel movement', () => {
    const scene = new THREE.Scene();
    const materialFactory = new MaterialFactory();
    const manager = new TunnelManager(scene, materialFactory, 100);

    expect(manager.stats.active).toBe(15);
    const initialSpawned = manager.stats.totalSpawned;

    // Simulate 100 frames of fast movement (200 units)
    for (let i = 0; i < 100; i++) {
      manager.update(0.1, 20); // 2 units per step
    }

    // Active segments count remains strictly capped at 15
    expect(manager.stats.active).toBe(15);
    // Total spawned count has increased as segments were recycled
    expect(manager.stats.totalSpawned).toBeGreaterThan(initialSpawned);

    manager.dispose();
  });
});
