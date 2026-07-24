/**
 * Scene Factory for Cube Dash 3D
 * Creates and initializes the 3D Scene, Camera, Fog, Lighting hierarchy,
 * and dynamic camera language (speed FOV scaling, lane camera sway, impact shake).
 */

import * as THREE from 'three';
import { MaterialFactory } from './Materials.js';
import { TunnelManager } from '../world/TunnelManager.js';
import { PlayerController } from '../gameplay/PlayerController.js';
import { SpaceEnvironment } from '../world/SpaceEnvironment.js';

export const CAMERA_MODES = {
  THIRD_PERSON: '3RD',
  FIRST_PERSON: '1ST'
};

export class SceneFactory {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.materialFactory = new MaterialFactory();
    this.lights = [];
    this.tunnelManager = null;
    this.playerController = null;
    this.spaceEnvironment = null;

    // Camera Juicing, Modes & Motion State
    this.cameraMode = CAMERA_MODES.THIRD_PERSON;
    this.baseFov = 70;
    this.targetFov = 70;
    this.cameraShakeIntensity = 0;
    this.reducedMotion = false;

    this._initScene();
  }

  _initScene() {
    // Atmospheric Deep Space Fog (subtle for star & planet readability)
    this.scene.background = new THREE.Color(0x040612);
    this.scene.fog = new THREE.FogExp2(0x040612, 0.002);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 300);
    this.camera.position.set(0, 2.3, 5.2);
    this.camera.lookAt(0, 0.8, -30);

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

    // Build Space Environment, endless tunnel manager & player controller
    this.spaceEnvironment = new SpaceEnvironment(this.scene);
    this.tunnelManager = new TunnelManager(this.scene, this.materialFactory, 42);
    this.playerController = new PlayerController(this.scene, this.materialFactory);
  }

  cycleCameraMode() {
    const modes = [CAMERA_MODES.THIRD_PERSON, CAMERA_MODES.FIRST_PERSON];
    const currentIndex = modes.indexOf(this.cameraMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.cameraMode = modes[nextIndex];
    return this.cameraMode;
  }

  setCameraMode(mode) {
    if (Object.values(CAMERA_MODES).includes(mode)) {
      this.cameraMode = mode;
    }
  }

  triggerCameraShake(intensity = 0.3) {
    if (this.reducedMotion) return;
    this.cameraShakeIntensity = Math.min(0.5, intensity);
  }

  update(delta, elapsed) {
    // Update cosmic outer space backdrop
    if (this.spaceEnvironment) {
      this.spaceEnvironment.update(delta, elapsed);
    }

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
    const playerY = this.playerController?.position.y || 0.25;

    const aspect = this.camera.aspect || (window.innerWidth / window.innerHeight);
    const portraitFactor = Math.max(0, Math.min(1.0, (1.6 - aspect) / 1.15));

    // Handle Rider & Bike Mesh Visibility per Camera Mode
    if (this.playerController && this.playerController.alienGroup) {
      const isFirstPerson = this.cameraMode === CAMERA_MODES.FIRST_PERSON;
      // Hide rider body in 1st person so rider geometry never blocks the screen view!
      this.playerController.alienGroup.visible = !isFirstPerson;
    }

    let targetCamX = 0;
    let targetCamY = 2.3;
    let targetCamZ = 5.2;
    let lookTargetX = playerX * 0.1;
    let lookTargetY = 0.8;
    let lookTargetZ = -30;
    let desiredFov = 70;

    const speedRatio = Math.min(1.0, Math.max(0, (currentSpeed - 15) / 15));

    switch (this.cameraMode) {
      case CAMERA_MODES.FIRST_PERSON:
        // ── 1ST PERSON / ALIEN EYE COCKPIT VIEW ──────────────────────────────
        // Camera sits inside alien helmet looking down tunnel through visor over steering console
        targetCamX = playerX;
        targetCamY = playerY + 0.65; // Alien Eye Height
        targetCamZ = 1.90;          // Cockpit / Handlebars level
        lookTargetX = playerX;
        lookTargetY = playerY + 0.60;
        lookTargetZ = -50;
        desiredFov = 82 + speedRatio * 10;
        break;

      case CAMERA_MODES.THIRD_PERSON:
      default:
        // ── 3RD PERSON CHASE CAM (ALWAYS VISIBLE IN ALL 5 LANES ON MOBILE) ──
        // Camera X tracks player X closely on mobile portrait screens (swayScale up to 0.85)
        // so the vehicle NEVER gets cut off or lost off the screen edges in Lane 0 (-4.0) or Lane 4 (+4.0)!
        const swayScale = THREE.MathUtils.lerp(0.25, 0.85, portraitFactor);
        const baseCamZ = 5.4 + portraitFactor * 0.8;
        const baseCamY = 2.4 + portraitFactor * 0.4;

        targetCamX = playerX * swayScale;
        targetCamY = baseCamY + (playerY - 0.25) * 0.15;
        targetCamZ = baseCamZ;

        lookTargetX = playerX * (0.15 * (1.0 - portraitFactor) + 0.80 * portraitFactor);
        lookTargetY = 0.8;
        lookTargetZ = -30;
        desiredFov = 70 + speedRatio * 8.0 + portraitFactor * 10.0;
        break;
    }

    if (this.reducedMotion) {
      this.camera.position.set(targetCamX, targetCamY, targetCamZ);
      this.camera.fov = desiredFov;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
      return;
    }

    // Dynamic Speed FOV Scaling
    this.targetFov = desiredFov;
    this.camera.fov += (this.targetFov - this.camera.fov) * Math.min(1.0, delta * 4.0);
    this.camera.updateProjectionMatrix();

    // Damped Camera Position Movement
    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1.0, delta * 8.0);
    this.camera.position.y += (targetCamY - this.camera.position.y) * Math.min(1.0, delta * 8.0);
    this.camera.position.z += (targetCamZ - this.camera.position.z) * Math.min(1.0, delta * 8.0);

    // Impact Camera Shake
    if (this.cameraShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;

      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 2.0);
    }

    this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
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
