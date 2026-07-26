import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';
import { CollisionSystem } from '../../src/gameplay/CollisionSystem.js';
import * as THREE from 'three';

describe('Reward Step 3: Energy Shield Power-Up Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize cyberShieldBlue material with cyan glow', () => {
    const mat = materialFactory.get('cyberShieldBlue');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0x00f3ff);
    expect(mat.emissive.getHex()).toBe(0x00aaff);
  });

  it('should create 3D Energy Shield item mesh group in TunnelSegment', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.SHIELD_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    expect(segment.obstacles.length).toBe(1);
    const shieldItem = segment.obstacles[0];

    expect(shieldItem.type).toBe('shield_powerup');
    expect(shieldItem.active).toBe(true);
    expect(shieldItem.isCollectible).toBe(true);
    expect(shieldItem.mesh.name).toBe('CyberShield');
  });

  it('should shatter obstacle when player has active energy shield', () => {
    const collisionSystem = new CollisionSystem();
    const mockPlayer = {
      position: { x: 0, y: 0.25, z: 2.0, lane: 2 },
      shieldActive: true,
      currentLane: 2
    };

    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0; // Same Z as player
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.LANE_WALL,
      lane: 2,
      relativeZ: 0
    });

    const wallObstacle = segment.obstacles[0];
    const result = collisionSystem.checkCollisions(mockPlayer, [segment]);

    expect(result).toBeDefined();
    expect(result.hit).toBe(true);
    expect(result.type).toBe('shield_break');
    expect(wallObstacle.active).toBe(false); // Obstacle destroyed!
    expect(mockPlayer.shieldActive).toBe(false); // Shield consumed!
  });

  it('should register shield_powerup_center pattern in PatternLibrary', () => {
    const library = new PatternLibrary();
    const shieldPattern = library.getPattern('shield_powerup_center');

    expect(shieldPattern).toBeDefined();
    expect(shieldPattern.difficulty).toBe(1);
  });
});
