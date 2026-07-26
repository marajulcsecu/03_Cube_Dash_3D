import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';
import { CollisionSystem } from '../../src/gameplay/CollisionSystem.js';
import { TunnelManager } from '../../src/world/TunnelManager.js';
import { SceneFactory } from '../../src/render/SceneFactory.js';
import * as THREE from 'three';

describe('Reward Step 5: EMP Sonic Blast Wave Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize cyberEmpOrange material with glowing plasma orange', () => {
    const mat = materialFactory.get('cyberEmpOrange');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0xff5500);
    expect(mat.emissive.getHex()).toBe(0xff2200);
  });

  it('should create 3D EMP Bomb item mesh group in TunnelSegment', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.EMP_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    expect(segment.obstacles.length).toBe(1);
    const empItem = segment.obstacles[0];

    expect(empItem.type).toBe('emp_powerup');
    expect(empItem.active).toBe(true);
    expect(empItem.isCollectible).toBe(true);
    expect(empItem.mesh.name).toBe('CyberEmp');
  });

  it('should clear all active screen obstacles when clearAllScreenObstacles is called', () => {
    const scene = new THREE.Scene();
    const sceneFactory = new SceneFactory(scene);
    const tunnelManager = sceneFactory.tunnelManager;

    tunnelManager.activeSegments[0].addObstacleFromConfig({ type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 });

    const clearedCount = tunnelManager.clearAllScreenObstacles();
    expect(clearedCount).toBeGreaterThan(0);

    const activeObstaclesAfter = tunnelManager.activeSegments.flatMap(s => s.obstacles || []).filter(o => o.active && !o.isCollectible);
    expect(activeObstaclesAfter.length).toBe(0); // All cleared by EMP shockwave!
  });

  it('should detect emp_powerup collection in CollisionSystem', () => {
    const collisionSystem = new CollisionSystem();
    const mockPlayer = {
      position: { x: 0, y: 0.25, z: 2.0, lane: 2 },
      currentLane: 2
    };

    const segment = new TunnelSegment(materialFactory);
    segment.meshGroup.position.z = 2.0;
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.EMP_POWERUP,
      lane: 2,
      relativeZ: 0
    });

    const empObstacle = segment.obstacles[0];
    const result = collisionSystem.checkCollisions(mockPlayer, [segment]);

    expect(result).toBeDefined();
    expect(result.hit).toBe(true);
    expect(result.type).toBe('emp_powerup');
    expect(empObstacle.active).toBe(false); // Collected!
  });

  it('should register emp_powerup_center pattern in PatternLibrary', () => {
    const library = new PatternLibrary();
    const empPattern = library.getPattern('emp_powerup_center');

    expect(empPattern).toBeDefined();
    expect(empPattern.difficulty).toBe(1);
  });
});
