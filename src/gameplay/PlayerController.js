/**
 * Authoritative Player Controller
 * Handles 5-lane movement, deterministic jump physics, coyote timing, and squash/stretch visuals.
 */

import * as THREE from 'three';

export class PlayerController {
  constructor(scene, materialFactory) {
    this.scene = scene;
    this.materialFactory = materialFactory;

    // 5-Lane System (-4.0, -2.0, 0.0, 2.0, 4.0)
    this.laneXPositions = [-4.0, -2.0, 0.0, 2.0, 4.0];
    this.currentLane = 2; // Center lane
    this.targetLane = 2;
    this.queuedMove = 0; // -1 for left, +1 for right, 0 for none

    // Eased Lane Movement properties
    this.currentX = 0.0;
    this.startX = 0.0;
    this.laneChangeTimer = 0.0;
    this.laneChangeDuration = 0.15; // 150ms

    // Jump Physics
    this.y = 0.5; // Ground level (center Y = 0.5 for 1x1x1 cube)
    this.groundY = 0.5;
    this.verticalVelocity = 0.0;
    this.gravity = -25.0;
    this.jumpImpulse = 8.5; // Reaches ~2.5m apex height
    this.isGrounded = true;
    this.coyoteTimer = 0.0;
    this.coyoteWindow = 0.1; // 100ms

    // Visual Mesh Rig & Squash/Stretch
    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'PlayerCubeGroup';
    this.visualMesh = null;
    this.wireframeMesh = null;

    // Scale animation values
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
    this.scene.add(this.meshGroup);
  }

  moveLeft() {
    if (this.targetLane > 0) {
      if (this.currentLane === this.targetLane) {
        this._startLaneChange(this.targetLane - 1);
      } else if (this.queuedMove === 0 && this.targetLane - 1 >= 0) {
        // Queue single move
        this.queuedMove = -1;
      }
    }
  }

  moveRight() {
    if (this.targetLane < 4) {
      if (this.currentLane === this.targetLane) {
        this._startLaneChange(this.targetLane + 1);
      } else if (this.queuedMove === 0 && this.targetLane + 1 <= 4) {
        // Queue single move
        this.queuedMove = 1;
      }
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
    }
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

        // Process queued lane change
        if (this.queuedMove !== 0) {
          const nextLane = this.currentLane + this.queuedMove;
          this.queuedMove = 0;
          if (nextLane >= 0 && nextLane <= 4) {
            this._startLaneChange(nextLane);
          }
        }
      }
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
    this.queuedMove = 0;
    this.currentX = 0.0;
    this.startX = 0.0;
    this.laneChangeTimer = 0.0;

    this.y = this.groundY;
    this.verticalVelocity = 0.0;
    this.isGrounded = true;
    this.coyoteTimer = 0.0;
    this.currentScale.set(1, 1, 1);

    if (this.meshGroup) {
      this.meshGroup.position.set(0, this.groundY, 2.0);
    }
  }

  get position() {
    return { x: this.currentX, y: this.y, z: 2.0 };
  }

  dispose() {
    if (this.meshGroup && this.scene) {
      this.scene.remove(this.meshGroup);
    }
  }
}
