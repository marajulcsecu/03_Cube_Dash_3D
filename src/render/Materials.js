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
    // Deep Space Tunnel Wall Material with bright emissive lines
    this.materials.set('tunnelWall', new THREE.MeshStandardMaterial({
      color: 0x0d122b,
      roughness: 0.5,
      metalness: 0.5,
      flatShading: true
    }));

    // Cyan Neon Wireframe / Grid Material
    this.materials.set('cyanNeonGrid', new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    }));

    // Violet Neon Accents
    this.materials.set('violetEmissive', new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    }));

    // Warm Amber Hazard Material
    this.materials.set('amberEmissive', new THREE.MeshStandardMaterial({
      color: 0xff9e00,
      emissive: 0xff9e00,
      emissiveIntensity: 1.2,
      roughness: 0.2
    }));

    // Luminous Player Cube Material
    this.materials.set('playerCube', new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00a8ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.8
    }));

    // Energy Shard Material
    this.materials.set('energyShard', new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
      roughness: 0.1
    }));

    // Meteorite Asteroid Material with molten orange lava core and dark rock surface
    this.materials.set('asteroidRock', new THREE.MeshStandardMaterial({
      color: 0x2e2836,
      emissive: 0xff4400,
      emissiveIntensity: 0.6,
      roughness: 0.8,
      metalness: 0.3,
      flatShading: true
    }));

    // Biomechanical Alien Monster Material (deep violet hull with neon magenta eye glow)
    this.materials.set('alienMonsterBio', new THREE.MeshStandardMaterial({
      color: 0x1f0c38,
      emissive: 0xff0066,
      emissiveIntensity: 1.1,
      roughness: 0.2,
      metalness: 0.7,
      flatShading: true
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
