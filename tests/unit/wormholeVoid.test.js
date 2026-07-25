import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';

describe('Step 5: Cosmic Wormhole Floor Void 3D Obstacle Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize wormholeVortex material with deep abyssal emissive glow', () => {
    const mat = materialFactory.get('wormholeVortex');

    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0x050014);
    expect(mat.emissive.getHex()).toBe(0x6600cc);
  });

  it('should create 3D Cosmic Wormhole Void mesh group with accretion ring and particle specs', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.WORMHOLE_VOID,
      lane: 2,
      scale: 1.0
    });

    expect(segment.obstacles.length).toBe(1);
    const voidObs = segment.obstacles[0];

    expect(voidObs.type).toBe('wormhole_void');
    expect(voidObs.active).toBe(true);
    expect(voidObs.mesh.name).toBe('CosmicWormholeVoid');
    expect(voidObs.ringMesh).toBeDefined();
    expect(voidObs.particleGroup).toBeDefined();
    expect(segment.hasGap).toBe(true);
  });

  it('should update swirling accretion rotation angles frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.WORMHOLE_VOID,
      lane: 2,
      scale: 1.0
    });

    const voidObs = segment.obstacles[0];
    const initialRingZ = voidObs.ringMesh.rotation.z;
    const initialParticleZ = voidObs.particleGroup.rotation.z;

    segment.update(0.05); // 50ms frame

    expect(voidObs.ringMesh.rotation.z).not.toBe(initialRingZ);
    expect(voidObs.particleGroup.rotation.z).not.toBe(initialParticleZ);
  });

  it('should register Cosmic Wormhole Void patterns in PatternLibrary', () => {
    const library = new PatternLibrary();
    const centerPit = library.getPattern('wormhole_void_center_pit');

    expect(centerPit).toBeDefined();
    expect(centerPit.difficulty).toBe(3);
  });
});
