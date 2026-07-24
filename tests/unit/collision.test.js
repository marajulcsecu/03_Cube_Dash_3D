import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionSystem } from '../../src/gameplay/CollisionSystem.js';
import { PlayerController } from '../../src/gameplay/PlayerController.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { MaterialFactory } from '../../src/render/Materials.js';
import * as THREE from 'three';

describe('CollisionSystem & Death Flow Unit Tests', () => {
  let collisionSystem;
  let player;
  let materialFactory;
  let scene;

  beforeEach(() => {
    scene = new THREE.Scene();
    materialFactory = new MaterialFactory();
    collisionSystem = new CollisionSystem();
    player = new PlayerController(scene, materialFactory);
  });

  it('should detect wall collision when player is in same lane as wall obstacle', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0; // Same Z as player
    segment.addObstacle('wall', 2, 0); // Lane 2 (center)

    const result = collisionSystem.checkCollisions(player, [segment]);
    expect(result).not.toBeNull();
    expect(result.hit).toBe(true);
    expect(result.type).toBe('wall');
  });

  it('should allow player to clear low barrier by jumping over it', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0;
    segment.addObstacle('low_barrier', 2, 0);

    // Grounded collision test
    const groundedResult = collisionSystem.checkCollisions(player, [segment]);
    expect(groundedResult).not.toBeNull();
    expect(groundedResult.hit).toBe(true);

    // Player jumps over barrier
    player.jump();
    player.update(0.2); // Player reaches apex y > 1.5
    expect(player.y).toBeGreaterThan(1.2);

    const jumpingResult = collisionSystem.checkCollisions(player, [segment]);
    expect(jumpingResult).toBeNull(); // Cleared safely!
  });

  it('should detect floor gap fall when player is grounded in gap lane', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0;
    segment.addFloorGap([2]); // Center lane gap

    const result = collisionSystem.checkCollisions(player, [segment]);
    expect(result).not.toBeNull();
    expect(result.hit).toBe(true);
    expect(result.type).toBe('gap');
  });

  it('should collect energy shard without triggering terminal collision', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0;
    segment.addObstacle('shard', 2, 0);

    const result = collisionSystem.checkCollisions(player, [segment]);
    expect(result).not.toBeNull();
    expect(result.hit).toBe(true);
    expect(result.type).toBe('shard');
  });
});
