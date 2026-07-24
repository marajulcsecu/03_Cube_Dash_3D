import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MaterialFactory } from '../../src/render/Materials.js';
import { EffectsManager } from '../../src/render/Effects.js';
import * as THREE from 'three';

describe('ResponsiveRenderer & Scene Architecture Unit Tests', () => {
  it('should initialize MaterialFactory with required neon materials', () => {
    const factory = new MaterialFactory();
    expect(factory.get('tunnelWall')).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(factory.get('cyanNeonGrid')).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(factory.get('playerCube')).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('should adjust particle counts based on quality preset', () => {
    const scene = new THREE.Scene();
    const effects = new EffectsManager(scene, 'high');
    expect(effects.particleCount).toBe(250);

    effects.setPreset('low');
    expect(effects.particleCount).toBe(40);

    effects.setPreset('medium');
    expect(effects.particleCount).toBe(120);
  });
});
