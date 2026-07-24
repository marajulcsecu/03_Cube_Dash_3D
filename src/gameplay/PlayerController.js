/**
 * Authoritative Player Controller
 * Encapsulates 5-lane position calculations (-4.0 to +4.0 X coordinates),
 * instant responsive lane changes, jump physics (gravity & initial impulse),
 * coyote timing window, and visual squash/stretch deformations.
 */

import * as THREE from 'three';

export class PlayerController {
  constructor(scene, materialFactory) {
    this.scene = scene;
    this.materialFactory = materialFactory;

    // 5 Discrete Lanes: X = [-4.0, -2.0, 0.0, 2.0, 4.0]
    this.laneXPositions = [-4.0, -2.0, 0.0, 2.0, 4.0];
    this.currentLane = 2; // Center lane
    this.targetLane = 2;

    // Movement & Easing
    this.currentX = 0.0;
    this.startX = 0.0;
    this.laneChangeDuration = 0.12; // 120ms ultra-snappy lane transition
    this.laneChangeTimer = 0.0;

    // Jump Physics
    this.groundY = 0.5; // Half of 1x1x1 cube height
    this.y = this.groundY;
    this.verticalVelocity = 0.0;
    this.gravity = -25.0;
    this.jumpImpulse = 8.5;
    this.isGrounded = true;
    this.coyoteWindow = 0.1; // 100ms
    this.coyoteTimer = 0.0;

    // Visual Deformations (Squash & Stretch)
    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'PlayerController';
    this.visualMesh = null;
    this.wireframeMesh = null;
    this.targetScale = new THREE.Vector3(1, 1, 1);
    this.currentScale = new THREE.Vector3(1, 1, 1);

    this._buildMesh();
  }

  _buildMesh() {
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = this.materialFactory.get('playerCube');

    this.visualMesh = new THREE.Mesh(cubeGeo, cubeMat);

    // Outline wireframe
    const wireGeo = new THREE.WireframeGeometry(cubeGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    this.wireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
    this.visualMesh.add(this.wireframeMesh);

    this.meshGroup.add(this.visualMesh);
    this.meshGroup.position.set(0, this.y, 2.0); // Fixed Z position

    this._buildAlienRider();

    this.scene.add(this.meshGroup);
  }

  _buildAlienRider() {
    this.alienGroup = new THREE.Group();
    this.alienGroup.name = 'AlienRider';
    this.alienGroup.position.set(0, 0.5, 0); // Mounted on top of cube top face

    // Load generated Alien Pilot Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/alien_pilot.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.5, 1.5, 1.5);
      sprite.position.set(0, 0.65, 0);
      this.alienGroup.add(sprite);
    }, undefined, () => {
      // Fallback Procedural Neon Alien Mesh
      const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        emissive: 0x00a8ff,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(0, 0.4, 0);
      this.alienGroup.add(headMesh);

      // Antennae with glowing orb tips
      [-0.15, 0.15].forEach(xOffset => {
        const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
        const antMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
        const antMesh = new THREE.Mesh(antGeo, antMat);
        antMesh.position.set(xOffset, 0.6, 0);
        this.alienGroup.add(antMesh);

        const orbGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const orbMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const orbMesh = new THREE.Mesh(orbGeo, orbMat);
        orbMesh.position.set(xOffset, 0.75, 0);
        this.alienGroup.add(orbMesh);
      });
    });

    this.visualMesh.add(this.alienGroup);
  }

  moveLeft() {
    const nextLane = Math.max(0, this.targetLane - 1);
    if (nextLane !== this.targetLane) {
      this._startLaneChange(nextLane);
    }
  }

  moveRight() {
    const nextLane = Math.min(4, this.targetLane + 1);
    if (nextLane !== this.targetLane) {
      this._startLaneChange(nextLane);
    }
  }

  _startLaneChange(newLane) {
    this.startX = this.currentX;
    this.targetLane = newLane;
    this.laneChangeTimer = 0.0;
  }

  jump() {
    // Check if grounded or within coyote window
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.isGrounded = false;
      this.coyoteTimer = 0.0;
      this.verticalVelocity = this.jumpImpulse;
      
      // Visual Stretch on takeoff
      this.currentScale.set(0.75, 1.35, 0.75);
      return true;
    }
    return false;
  }

  update(delta) {
    this._updateLaneMovement(delta);
    this._updateJumpPhysics(delta);
    this._updateVisualDeformation(delta);

    // Sync 3D mesh position with logical (currentX, y, 2.0)
    this.meshGroup.position.x = this.currentX;
    this.meshGroup.position.y = this.y;
  }

  _updateLaneMovement(delta) {
    const targetX = this.laneXPositions[this.targetLane];

    if (this.currentX !== targetX) {
      this.laneChangeTimer += delta;
      const progress = Math.min(1.0, this.laneChangeTimer / this.laneChangeDuration);
      
      // Smooth cubic ease-out interpolation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      this.currentX = THREE.MathUtils.lerp(this.startX, targetX, easedProgress);

      if (progress >= 1.0) {
        this.currentX = targetX;
        this.currentLane = this.targetLane;
      }
    } else {
      this.currentLane = this.targetLane;
    }
  }

  _updateJumpPhysics(delta) {
    if (!this.isGrounded) {
      this.y += this.verticalVelocity * delta;
      this.verticalVelocity += this.gravity * delta;

      // Landing detection
      if (this.y <= this.groundY) {
        this.y = this.groundY;
        this.verticalVelocity = 0.0;
        this.isGrounded = true;
        this.coyoteTimer = 0.0;

        // Visual Squash on landing
        this.currentScale.set(1.35, 0.65, 1.35);
      }
    } else {
      // Refresh coyote timer while grounded
      this.coyoteTimer = this.coyoteWindow;
    }
  }

  _updateVisualDeformation(delta) {
    // Recover scale smoothly back to target (1.0, 1.0, 1.0)
    this.currentScale.lerp(this.targetScale, Math.min(1.0, delta * 12));
    if (this.visualMesh) {
      this.visualMesh.scale.copy(this.currentScale);
    }
  }

  reset() {
    this.currentLane = 2;
    this.targetLane = 2;
    this.currentX = 0.0;
    this.startX = 0.0;
    this.laneChangeTimer = 0.0;

    this.y = this.groundY;
    this.verticalVelocity = 0.0;
    this.isGrounded = true;
    this.coyoteTimer = 0.0;

    this.currentScale.set(1, 1, 1);
    if (this.visualMesh) {
      this.visualMesh.scale.set(1, 1, 1);
    }
    this.meshGroup.position.set(0, this.groundY, 2.0);
  }

  get position() {
    return {
      x: this.currentX,
      y: this.y,
      z: 2.0,
      lane: this.currentLane
    };
  }

  getLaneX(laneIndex) {
    const idx = Math.max(0, Math.min(4, laneIndex));
    return this.laneXPositions[idx];
  }
}
