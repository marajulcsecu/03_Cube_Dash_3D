/**
 * Procedural Materials and Shaders for Cube Dash 3D
 * Custom neon emissive and grid materials without external texture assets.
 */

import * as THREE from 'three';

export class MaterialFactory {
  constructor() {
    this.materials = new Map();
    this._initMaterials();
  }

  _initMaterials() {
    // Deep Space Tunnel Wall Material
    this.materials.set('tunnelWall', new THREE.MeshStandardMaterial({
      color: 0x0a0f24,
      roughness: 0.8,
      metalness: 0.2,
      flatShading: true
    }));

    // Cyan Neon Wireframe / Grid Material
    this.materials.set('cyanNeonGrid', new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    }));

    // Violet Neon Accents
    this.materials.set('violetEmissive', new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      emissive: 0x9d4edd,
      emissiveIntensity: 0.8,
      roughness: 0.3
    }));

    // Warm Amber Hazard Material
    this.materials.set('amberEmissive', new THREE.MeshStandardMaterial({
      color: 0xff9e00,
      emissive: 0xff9e00,
      emissiveIntensity: 0.9,
      roughness: 0.2
    }));

    // Luminous Player Cube Material
    this.materials.set('playerCube', new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00a8ff,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.8
    }));

    // Energy Shard Material
    this.materials.set('energyShard', new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.0,
      roughness: 0.1
    }));
  }

  get(name) {
    if (!this.materials.has(name)) {
      throw new Error(`MaterialFactory: Unknown material '${name}'`);
    }
    return this.materials.get(name);
  }

  dispose() {
    this.materials.forEach(mat => mat.dispose());
    this.materials.clear();
  }
}
