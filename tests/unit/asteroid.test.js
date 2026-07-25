import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';

describe('Step 1: Cosmic Asteroid 3D Obstacle Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize asteroidRock material with molten orange lava emissive core', () => {
    const mat = materialFactory.get('asteroidRock');
    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0x2e2836);
    expect(mat.emissive.getHex()).toBe(0xff4400);
  });

  it('should create dynamic 3D craggy asteroid mesh with tumbling rotation vectors', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.ASTEROID,
      lane: 2,
      relativeZ: 0,
      scale: 1.0
    });

    expect(segment.obstacles.length).toBe(1);
    const asteroid = segment.obstacles[0];

    expect(asteroid.type).toBe('asteroid');
    expect(asteroid.active).toBe(true);
    expect(asteroid.rotSpeedX).toBeDefined();
    expect(asteroid.rotSpeedY).toBeDefined();
    expect(asteroid.rotSpeedZ).toBeDefined();
  });

  it('should update 3D tumbling rotation angles frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.ASTEROID,
      lane: 0,
      relativeZ: -5,
      scale: 1.2
    });

    const asteroid = segment.obstacles[0];
    const initialRotX = asteroid.mesh.rotation.x;
    const initialRotY = asteroid.mesh.rotation.y;

    segment.update(0.016); // 16ms delta frame

    expect(asteroid.mesh.rotation.x).not.toBe(initialRotX);
    expect(asteroid.mesh.rotation.y).not.toBe(initialRotY);
  });

  it('should register asteroid patterns in PatternLibrary across difficulty tiers', () => {
    const library = new PatternLibrary();
    const centerAsteroid = library.getPattern('single_asteroid_center');
    const twinAsteroids = library.getPattern('asteroid_outer_pair');
    const asteroidApocalypse = library.getPattern('asteroid_apocalypse_blitz');

    expect(centerAsteroid).toBeDefined();
    expect(centerAsteroid.difficulty).toBe(1);

    expect(twinAsteroids).toBeDefined();
    expect(twinAsteroids.difficulty).toBe(2);

    expect(asteroidApocalypse).toBeDefined();
    expect(asteroidApocalypse.difficulty).toBe(4);
  });
});
