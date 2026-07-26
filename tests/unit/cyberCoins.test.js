import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';
import { ScoreSystem } from '../../src/gameplay/ScoreSystem.js';
import { CollisionSystem } from '../../src/gameplay/CollisionSystem.js';

describe('Reward Step 1: 3D Cyber Coins & Score Orbs Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize cyberCoinGold material with brilliant metallic gold sheen', () => {
    const mat = materialFactory.get('cyberCoinGold');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0xffd700);
    expect(mat.emissive.getHex()).toBe(0xffaa00);
  });

  it('should create 3D Cyber Coin mesh group and coin trails in TunnelSegment', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.COIN_TRAIL,
      lane: 2,
      relativeZ: 0,
      count: 4
    });

    expect(segment.obstacles.length).toBe(4);
    const coin = segment.obstacles[0];

    expect(coin.type).toBe('coin');
    expect(coin.active).toBe(true);
    expect(coin.isCollectible).toBe(true);
    expect(coin.mesh.name).toBe('CyberCoin');
  });

  it('should update continuous coin spin rotation angle frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.COIN,
      lane: 2,
      y: 1.0,
      relativeZ: 0
    });

    const coin = segment.obstacles[0];
    const initialRotY = coin.mesh.rotation.y;

    segment.update(0.05); // 50ms frame

    expect(coin.mesh.rotation.y).not.toBe(initialRotY);
  });

  it('should track coins collected and award score bonus in ScoreSystem', () => {
    const scoreSystem = new ScoreSystem();
    expect(scoreSystem.coinsCount).toBe(0);

    scoreSystem.collectCoin();
    expect(scoreSystem.coinsCount).toBe(1);
    expect(scoreSystem.score).toBe(50);
  });

  it('should detect coin collision in CollisionSystem and mark coin inactive', () => {
    const collisionSystem = new CollisionSystem();
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.COIN,
      lane: 2,
      y: 1.0,
      relativeZ: 2.0
    });

    const mockPlayer = {
      position: { x: segment.getLaneX(2), y: 1.0, z: 2.0 },
      isGrounded: true,
      currentLane: 2
    };

    const activeSegments = [
      {
        meshGroup: { position: { z: 0 } },
        obstacles: segment.obstacles,
        hasGap: false
      }
    ];

    const hitResult = collisionSystem.checkCollisions(mockPlayer, activeSegments);

    expect(hitResult).toBeDefined();
    expect(hitResult.hit).toBe(true);
    expect(hitResult.type).toBe('coin');
    expect(segment.obstacles[0].active).toBe(false);
  });

  it('should register coin_trail_center pattern in PatternLibrary', () => {
    const library = new PatternLibrary();
    const coinPattern = library.getPattern('coin_trail_center');

    expect(coinPattern).toBeDefined();
    expect(coinPattern.difficulty).toBe(1);
  });
});
