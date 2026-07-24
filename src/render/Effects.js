/**
 * Procedural Particle System and Visual Effects Manager
 */

import * as THREE from 'three';

export class EffectsManager {
  constructor(scene, preset = 'high') {
    this.scene = scene;
    this.preset = preset;
    this.particleSystem = null;
    this.particleCount = this._getParticleCountForPreset(preset);
    this.positions = null;

    this._initParticles();
  }

  _getParticleCountForPreset(preset) {
    switch (preset) {
      case 'low': return 40;
      case 'medium': return 120;
      case 'high': default: return 250;
    }
  }

  setPreset(preset) {
    this.preset = preset;
    const newCount = this._getParticleCountForPreset(preset);
    if (newCount !== this.particleCount) {
      this._destroyParticles();
      this.particleCount = newCount;
      this._initParticles();
    }
  }

  _initParticles() {
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      this.positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      this.positions[i * 3 + 2] = -Math.random() * 80;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.2,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  update(delta, speed = 20) {
    if (!this.particleSystem || !this.positions) return;

    const positions = this.particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3 + 2] += delta * speed * 2;
      if (positions[i * 3 + 2] > 10) {
        positions[i * 3 + 2] = -80;
        positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      }
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  _destroyParticles() {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
      this.particleSystem = null;
    }
  }

  dispose() {
    this._destroyParticles();
  }
}
