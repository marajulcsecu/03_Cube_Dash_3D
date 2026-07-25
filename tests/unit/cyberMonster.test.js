import { describe, it, expect } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { TunnelSegment } from '../../src/world/TunnelSegment.js';
import { PatternLibrary, OBSTACLE_TYPES } from '../../src/world/PatternLibrary.js';

describe('Step 2: Cyber-Alien Space Monster 3D Obstacle Unit Tests', () => {
  const materialFactory = new MaterialFactory();

  it('should initialize alienMonsterBio material with deep violet hull and neon magenta emissive glow', () => {
    const mat = materialFactory.get('alienMonsterBio');
    expect(mat).toBeDefined();
    expect(mat.color.getHex()).toBe(0x1f0c38);
    expect(mat.emissive.getHex()).toBe(0xff0066);
  });

  it('should create 3D Cyber-Alien Monster mesh group with bioluminescent eye dome and side tentacles', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.ALIEN_MONSTER,
      lane: 2,
      relativeZ: 0,
      scale: 1.0
    });

    expect(segment.obstacles.length).toBe(1);
    const monster = segment.obstacles[0];

    expect(monster.type).toBe('alien_monster');
    expect(monster.active).toBe(true);
    expect(monster.mesh.name).toBe('CyberAlienMonster');
    expect(monster.eyeMesh).toBeDefined();
  });

  it('should animate fly-in entry from deep space and hover oscillation frame by frame', () => {
    const segment = new TunnelSegment(materialFactory);
    segment.addObstacleFromConfig({
      type: OBSTACLE_TYPES.ALIEN_MONSTER,
      lane: 2,
      relativeZ: -10,
      scale: 1.0
    });

    const monster = segment.obstacles[0];
    const initialX = monster.mesh.position.x;
    const initialY = monster.mesh.position.y;

    segment.update(0.05); // 50ms frame

    expect(monster.mesh.position.x).not.toBe(initialX);
    expect(monster.mesh.position.y).not.toBe(initialY);
  });

  it('should register Cyber-Alien Monster patterns in PatternLibrary', () => {
    const library = new PatternLibrary();
    const hoverCenter = library.getPattern('alien_monster_hover_center');
    const flankPair = library.getPattern('alien_monster_flank_pair');

    expect(hoverCenter).toBeDefined();
    expect(hoverCenter.difficulty).toBe(2);

    expect(flankPair).toBeDefined();
    expect(flankPair.difficulty).toBe(3);
  });
});
