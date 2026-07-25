import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';

describe('Step 4: Spinning Plasma Blade Rotor 3D Obstacle Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize plasmaRotorBlade material with electric amber emissive glow', () => {
    const mat = materialFactory.get('plasmaRotorBlade');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0xff6600);
    expect(mat.emissive.getHex()).toBe(0xffaa00);
  });

  it('should create 3D Plasma Saw Rotor mesh group with 3 blades and electric core', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.PLASMA_ROTOR,
      lane: 2,
      spinSpeed: 6.5
    });

    expect(segment.obstacles.length).toBe(1);
    const rotor = segment.obstacles[0];

    expect(rotor.type).toBe('plasma_rotor');
    expect(rotor.active).toBe(true);
    expect(rotor.mesh.name).toBe('PlasmaSawRotor');
    expect(rotor.spinningRotorMesh).toBeDefined();
    expect(rotor.spinningRotorMesh.children.length).toBe(3);
  });

  it('should update 360-degree high-speed rotation angles frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.PLASMA_ROTOR,
      lane: 0,
      spinSpeed: 6.5
    });

    const rotor = segment.obstacles[0];
    const initialRotZ = rotor.spinningRotorMesh.rotation.z;

    segment.update(0.05); // 50ms frame

    expect(rotor.spinningRotorMesh.rotation.z).not.toBe(initialRotZ);
  });

  it('should register Plasma Rotor patterns in PatternLibrary', () => {
    const library = new PatternLibrary();
    const centerSaw = library.getPattern('plasma_rotor_center_saw');

    expect(centerSaw).toBeDefined();
    expect(centerSaw.difficulty).toBe(3);
  });
});
