/**
 * Scene Factory for Cube Dash 3D
 * Creates and initializes the 3D Scene, Camera, Fog, Lighting hierarchy,
 * and dynamic camera language (speed FOV scaling, lane camera sway, impact shake).
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

    // Camera Juicing & Motion State
    this.baseFov = 70;
    this.targetFov = 70;
    this.cameraShakeIntensity = 0;
    this.reducedMotion = false;

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

  triggerCameraShake(intensity = 0.3) {
    if (this.reducedMotion) return;
    this.cameraShakeIntensity = Math.min(0.5, intensity);
  }

  update(delta, elapsed) {
    // Update endless pooled tunnel segments
    if (this.tunnelManager) {
      this.tunnelManager.update(delta);
    }

    // Update player controller physics and visual squash/stretch
    if (this.playerController) {
      this.playerController.update(delta);
    }

    this._updateCameraJuice(delta);
  }

  _updateCameraJuice(delta) {
    if (!this.camera) return;

    const currentSpeed = this.tunnelManager?.difficultyDirector?.currentSpeed || 20;
    const playerX = this.playerController?.position.x || 0;
    const playerY = this.playerController?.position.y || 0.5;

    const aspect = this.camera.aspect || (window.innerWidth / window.innerHeight);

    // Responsive aspect ratio adjustment for mobile portrait viewports
    // When aspect < 1.6 (portrait mobile/tablet), pull camera back & scale FOV to keep outer lanes visible
    const portraitFactor = Math.max(0, Math.min(1.0, (1.6 - aspect) / 1.15));
    const baseCamZ = 6.5 + portraitFactor * 4.5;
    const baseCamY = 2.8 + portraitFactor * 1.5;

    if (this.reducedMotion) {
      this.camera.position.set(0, baseCamY, baseCamZ);
      this.camera.fov = 70 + portraitFactor * 18.0;
      this.camera.updateProjectionMatrix();
      return;
    }

    // 1. Dynamic Speed FOV Scaling (70 -> 78 degrees base, plus portrait adaptation)
    const speedRatio = Math.min(1.0, (currentSpeed - 15) / 15);
    this.targetFov = (70 + speedRatio * 8.0) + (portraitFactor * 18.0);
    this.camera.fov += (this.targetFov - this.camera.fov) * Math.min(1.0, delta * 3.0);
    this.camera.updateProjectionMatrix();

    // 2. Damped Camera X Sway following player lane (sway scaled down on tight portrait screens)
    const swayScale = 0.2 * (1.0 - portraitFactor * 0.5);
    const targetCamX = playerX * swayScale;
    const targetCamY = baseCamY + (playerY - 0.5) * 0.15;

    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1.0, delta * 6.0);
    this.camera.position.y += (targetCamY - this.camera.position.y) * Math.min(1.0, delta * 6.0);
    this.camera.position.z += (baseCamZ - this.camera.position.z) * Math.min(1.0, delta * 6.0);

    // 3. Capped Camera Shake Decay
    if (this.cameraShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;

      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 2.0);
    }

    this.camera.lookAt(playerX * 0.05, 1.0, -30);
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
