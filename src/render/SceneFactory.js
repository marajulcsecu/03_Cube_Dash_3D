/**
 * Scene Factory for Cube Dash 3D
 * Creates and initializes the 3D Scene, Camera, Fog, and Lighting hierarchy.
 */

import * as THREE from 'three';
import { MaterialFactory } from './Materials.js';
import { TunnelManager } from '../world/TunnelManager.js';

export class SceneFactory {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.materialFactory = new MaterialFactory();
    this.lights = [];
    this.tunnelManager = null;
    this.playerPreviewMesh = null;

    this._initScene();
  }

  _initScene() {
    // Atmospheric Fog (subtle for long distance depth readability)
    this.scene.background = new THREE.Color(0x070913);
    this.scene.fog = new THREE.FogExp2(0x070913, 0.007);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 200);
    this.camera.position.set(0, 2.5, 6);
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

    // Build pooled endless tunnel manager
    this.tunnelManager = new TunnelManager(this.scene, this.materialFactory, 42);
    this._buildPlayerPreview();
  }

  _buildPlayerPreview() {
    // Glowing Beveled Cube preview for player
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = this.materialFactory.get('playerCube');
    this.playerPreviewMesh = new THREE.Mesh(cubeGeo, cubeMat);
    this.playerPreviewMesh.position.set(0, 0.5, 2);

    // Add glowing wireframe outline to player cube
    const wireGeo = new THREE.WireframeGeometry(cubeGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    this.playerPreviewMesh.add(wireframe);

    this.scene.add(this.playerPreviewMesh);
  }

  update(delta, elapsed) {
    // Update endless pooled tunnel segments
    if (this.tunnelManager) {
      this.tunnelManager.update(delta, 20);
    }

    // Subtle floating & rotation on player preview cube
    if (this.playerPreviewMesh) {
      this.playerPreviewMesh.position.y = 0.5 + Math.sin(elapsed * 3) * 0.1;
      this.playerPreviewMesh.rotation.y = Math.sin(elapsed * 1.5) * 0.15;
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
