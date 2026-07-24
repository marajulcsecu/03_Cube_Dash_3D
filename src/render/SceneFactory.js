/**
 * Scene Factory for Cube Dash 3D
 * Creates and initializes the 3D Scene, Camera, Fog, and Lighting hierarchy.
 */

import * as THREE from 'three';
import { MaterialFactory } from './Materials.js';

export class SceneFactory {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.materialFactory = new MaterialFactory();
    this.lights = [];
    this.decorativeTunnelGroup = new THREE.Group();

    this._initScene();
  }

  _initScene() {
    // Atmospheric Fog
    this.scene.background = new THREE.Color(0x070913);
    this.scene.fog = new THREE.FogExp2(0x070913, 0.018);

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 150);
    this.camera.position.set(0, 2.2, 6);
    this.camera.lookAt(0, 0, -20);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2035, 1.0);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional Cyan Key Light
    const keyLight = new THREE.DirectionalLight(0x00f3ff, 1.5);
    keyLight.position.set(0, 15, -10);
    this.scene.add(keyLight);
    this.lights.push(keyLight);

    // Point Light near Player
    const playerLight = new THREE.PointLight(0x9d4edd, 2.5, 25);
    playerLight.position.set(0, 2, 4);
    this.scene.add(playerLight);
    this.lights.push(playerLight);

    // Add decorative tunnel ring test geometry
    this._buildDecorativeTunnel();
    this.scene.add(this.decorativeTunnelGroup);
  }

  _buildDecorativeTunnel() {
    const ringGeometry = new THREE.CylinderGeometry(8, 8, 2, 6, 1, true);
    const wallMat = this.materialFactory.get('tunnelWall');
    const gridMat = this.materialFactory.get('cyanNeonGrid');

    for (let i = 0; i < 20; i++) {
      const ringGroup = new THREE.Group();
      
      const mesh = new THREE.Mesh(ringGeometry, wallMat);
      mesh.rotation.x = Math.PI / 2;
      ringGroup.add(mesh);

      const gridMesh = new THREE.Mesh(ringGeometry, gridMat);
      gridMesh.rotation.x = Math.PI / 2;
      gridMesh.scale.set(0.99, 1.01, 0.99);
      ringGroup.add(gridMesh);

      ringGroup.position.z = -i * 6;
      this.decorativeTunnelGroup.add(ringGroup);
    }
  }

  update(delta, elapsed) {
    // Rotate decorative tunnel rings for motion verification
    this.decorativeTunnelGroup.children.forEach((ring, idx) => {
      ring.rotation.z = (elapsed * 0.2) + (idx * 0.05);
      ring.position.z += delta * 15;
      if (ring.position.z > 10) {
        ring.position.z -= 120;
      }
    });
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
