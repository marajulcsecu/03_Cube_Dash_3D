/**
 * Scene Factory for Cube Dash 3D
 * Creates and initializes the 3D Scene, Camera, Fog, and Lighting hierarchy.
 */

import * as THREE from 'three';
import { MaterialFactory } from './Materials.js';
import { TunnelManager } from '../world/TunnelManager.js';
import { PlayerController } from '../gameplay/PlayerController.js';

export class SceneFactory {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.materialFactory = new MaterialFactory();
    this.lights = [];
    this.tunnelManager = null;
    this.playerController = null;

    this._initScene();
  }

  _initScene() {
    // Atmospheric Fog (subtle for long distance depth readability)
    this.scene.background = new THREE.Color(0x070913);
    this.scene.fog = new THREE.FogExp2(0x070913, 0.007);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 200);
    this.camera.position.set(0, 2.8, 6.5);
    this.camera.lookAt(0, 1.0, -30);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2035, 1.2);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional Cyan Key Light
    const keyLight = new THREE.DirectionalLight(0x00f3ff, 2.0);
    keyLight.position.set(0, 20, -10);
    this.scene.add(keyLight);
    this.lights.push(keyLight);

    // Point Light near Player Position
    const playerLight = new THREE.PointLight(0x00ffff, 3.0, 30);
    playerLight.position.set(0, 2, 3);
    this.scene.add(playerLight);
    this.lights.push(playerLight);

    // Build pooled endless tunnel manager & player controller
    this.tunnelManager = new TunnelManager(this.scene, this.materialFactory, 42);
    this.playerController = new PlayerController(this.scene, this.materialFactory);
  }

  update(delta, elapsed) {
    // Update endless pooled tunnel segments
    if (this.tunnelManager) {
      this.tunnelManager.update(delta, 20);
    }

    // Update player controller physics and visual squash/stretch
    if (this.playerController) {
      this.playerController.update(delta);
    }
  }

  updateAspect(width, height) {
    if (this.camera && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  dispose() {
    this.materialFactory.dispose();
  }
}
