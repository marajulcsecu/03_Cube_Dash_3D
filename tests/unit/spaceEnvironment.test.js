import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { SpaceEnvironment } from '../../src/world/SpaceEnvironment.js';

describe('SpaceEnvironment Unit Tests', () => {
  let scene;
  let spaceEnv;

  beforeEach(() => {
    scene = new THREE.Scene();
    spaceEnv = new SpaceEnvironment(scene);
  });

  it('should initialize starfield, ringed gas planet, cratered moon, and black hole', () => {
    expect(spaceEnv.starfield).toBeDefined();
    expect(spaceEnv.planetGroup).toBeDefined();
    expect(spaceEnv.moonGroup).toBeDefined();
    expect(spaceEnv.blackHoleGroup).toBeDefined();
    expect(spaceEnv.blackHoleDisk).toBeDefined();

    expect(scene.children.length).toBeGreaterThan(0);
  });

  it('should update celestial rotations and spawn passing spaceships', () => {
    const initialPlanetRotY = spaceEnv.planetGroup.rotation.y;

    spaceEnv.update(1.0, 1.0);

    expect(spaceEnv.planetGroup.rotation.y).toBeGreaterThan(initialPlanetRotY);

    // Force ship spawn timer trigger
    spaceEnv.spawnTimer = spaceEnv.nextShipSpawnTime + 1;
    spaceEnv.update(0.1, 1.1);

    expect(spaceEnv.spaceships.length).toBeGreaterThan(0);
    const ship = spaceEnv.spaceships[0];
    expect(ship.group).toBeDefined();
  });

  it('should cleanly dispose all meshes, geometry, and materials', () => {
    spaceEnv.spawnPassingSpaceship();
    expect(spaceEnv.spaceships.length).toBeGreaterThan(0);

    spaceEnv.dispose();

    expect(spaceEnv.spaceships.length).toBe(0);
  });
});
