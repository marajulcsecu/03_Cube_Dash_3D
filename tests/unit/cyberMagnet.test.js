import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';
import { TunnelManager } from '../../src/world/TunnelManager.js';
import * as THREE from 'three';

describe('Reward Step 2: Cyber Magnet Power-Up Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize cyberMagnetRed material with crimson metallic glow', () => {
    const mat = materialFactory.get('cyberMagnetRed');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0xff0044);
    expect(mat.emissive.getHex()).toBe(0x990022);
  });

  it('should create 3D Cyber Magnet mesh group in TunnelSegment', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.MAGNET_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    expect(segment.obstacles.length).toBe(1);
    const magnet = segment.obstacles[0];

    expect(magnet.type).toBe('magnet_powerup');
    expect(magnet.active).toBe(true);
    expect(magnet.isCollectible).toBe(true);
    expect(magnet.mesh.name).toBe('CyberMagnet');
  });

  it('should update continuous magnet spin and hover animation frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.MAGNET_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    const magnet = segment.obstacles[0];
    const initialRotY = magnet.mesh.rotation.y;

    segment.update(0.05); // 50ms frame

    expect(magnet.mesh.rotation.y).not.toBe(initialRotY);
  });

  it('should pull active coins toward player position during magnet attraction', () => {
    const mockScene = { add: () => {}, remove: () => {} };
    const tunnelManager = new TunnelManager(mockScene, materialFactory);
    tunnelManager.initWorld();

    const segment = tunnelManager.activeSegments[0];
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.COIN,
      lane: 0,
      y: 1.0,
      relativeZ: -5.0
    });

    const coin = segment.obstacles[segment.obstacles.length - 1];
    const initialX = coin.x;

    const mockPlayerPos = { x: 2.0, y: 1.0, z: -5.0 }; // Player in Lane 4
    tunnelManager.updateMagnetAttraction(mockPlayerPos, 0.1);

    expect(coin.x).not.toBe(initialX);
  });

  it('should register magnet_powerup_center pattern in PatternLibrary', () => {
    const library = new PatternLibrary();
    const magnetPattern = library.getPattern('magnet_powerup_center');

    expect(magnetPattern).toBeDefined();
    expect(magnetPattern.difficulty).toBe(1);
  });
});
