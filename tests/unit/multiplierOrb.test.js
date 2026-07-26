import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';
import { ScoreSystem } from '../../src/gameplay/ScoreSystem.js';
import { CollisionSystem } from '../../src/gameplay/CollisionSystem.js';

describe('Reward Step 4: Score Multiplier Orb Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize cyberMultiplierPurple material with neon purple glow', () => {
    const mat = materialFactory.get('cyberMultiplierPurple');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0x9d4edd);
    expect(mat.emissive.getHex()).toBe(0x7b2cbf);
  });

  it('should create 3D Multiplier Orb item mesh group in TunnelSegment', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.MULTIPLIER_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    expect(segment.obstacles.length).toBe(1);
    const orbItem = segment.obstacles[0];

    expect(orbItem.type).toBe('multiplier_powerup');
    expect(orbItem.active).toBe(true);
    expect(orbItem.isCollectible).toBe(true);
    expect(orbItem.mesh.name).toBe('CyberMultiplier');
  });

  it('should boost score calculations when boostMultiplier is active in ScoreSystem', () => {
    const scoreSystem = new ScoreSystem();
    scoreSystem.multiplier = 2; // Base multiplier 2x

    scoreSystem.setMultiplierBoost(2); // 2x Boost Orb active!
    expect(scoreSystem.effectiveMultiplier).toBe(4); // 2 * 2 = 4x!

    scoreSystem.collectCoin(); // 50 * 4 = 200 points
    expect(scoreSystem.score).toBe(200);

    scoreSystem.clearMultiplierBoost();
    expect(scoreSystem.effectiveMultiplier).toBe(2); // Restored to base 2x!
  });

  it('should detect multiplier_powerup collection in CollisionSystem', () => {
    const collisionSystem = new CollisionSystem();
    const mockPlayer = {
      position: { x: 0, y: 0.25, z: 2.0, lane: 2 },
      currentLane: 2
    };

    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0;
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.MULTIPLIER_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    const orbObstacle = segment.obstacles[0];
    const result = collisionSystem.checkCollisions(mockPlayer, [segment]);

    expect(result).toBeDefined();
    expect(result.hit).toBe(true);
    expect(result.type).toBe('multiplier_powerup');
    expect(orbObstacle.active).toBe(false); // Collected!
  });

  it('should register multiplier_powerup_center pattern in PatternLibrary', () => {
    const library = new PatternLibrary();
    const multPattern = library.getPattern('multiplier_powerup_center');

    expect(multPattern).toBeDefined();
    expect(multPattern.difficulty).toBe(1);
  });
});
