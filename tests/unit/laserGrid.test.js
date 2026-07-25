import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';

describe('Step 3: Cyberpunk Energy Laser Grid 3D Obstacle Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize laserBeamCore and laserBeamTelegraph materials', () => {
    const coreMat = materialFactory.get('laserBeamCore');
    const telMat = materialFactory.get('laserBeamTelegraph');

    expect(coreMat).toBeDefined();
    expect(coreMat.color.getHex()).toBe(0x00ffff);

    expect(telMat).toBeDefined();
    expect(telMat.color.getHex()).toBe(0xff0044);
  });

  it('should create 3D Cyberpunk Laser Grid mesh group with twin pylons and plasma beam core', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.LASER_GRID,
      lane: 2,
      heightY: 1.1,
      isSweeping: false
    });

    expect(segment.obstacles.length).toBe(1);
    const laser = segment.obstacles[0];

    expect(laser.type).toBe('laser_grid');
    expect(laser.active).toBe(true);
    expect(laser.mesh.name).toBe('CyberLaserGrid');
    expect(laser.beamMesh).toBeDefined();
    expect(laser.sheathMesh).toBeDefined();
  });

  it('should update vertical beam sweeping and sheath intensity pulsation frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.LASER_GRID,
      lane: 0,
      heightY: 1.1,
      isSweeping: true
    });

    const laser = segment.obstacles[0];
    const initialY = laser.beamMesh.position.y;
    const initialOpacity = laser.sheathMesh.material.opacity;

    segment.update(0.05); // 50ms frame

    expect(laser.beamMesh.position.y).not.toBe(initialY);
    expect(laser.sheathMesh.material.opacity).not.toBe(initialOpacity);
  });

  it('should register Cyberpunk Laser Grid patterns in PatternLibrary', () => {
    const library = new PatternLibrary();
    const singleLaser = library.getPattern('laser_grid_single_lane');
    const twinSweepers = library.getPattern('laser_grid_sweeper_pair');

    expect(singleLaser).toBeDefined();
    expect(singleLaser.difficulty).toBe(2);

    expect(twinSweepers).toBeDefined();
    expect(twinSweepers.difficulty).toBe(3);
  });
});
