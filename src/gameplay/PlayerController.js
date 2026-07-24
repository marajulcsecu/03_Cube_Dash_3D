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
    // Position at top of cube surface (cube is 1 unit tall, centered at 0, so top face is at +0.5)
    this.alienGroup.position.set(0, 0.5, 0);

    // ── Skin & material palette ──────────────────────────────────────────────
    const skinMat   = new THREE.MeshStandardMaterial({ color: 0x3de8c8, roughness: 0.5, metalness: 0.1 });
    const suitMat   = new THREE.MeshStandardMaterial({ color: 0x1a0a3a, roughness: 0.6 });
    const suitTrimMat = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.4, metalness: 0.3 });
    const visorMat  = new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00a8ff, emissiveIntensity: 1.2, transparent: true, opacity: 0.85, roughness: 0.05 });
    const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const orbMat    = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const darkMat   = new THREE.MeshStandardMaterial({ color: 0x0a0320, roughness: 0.8 });

    // ── LEGS (two short cylinders, standing on cube) ─────────────────────────
    [[-0.12, 0], [0.12, 0]].forEach(([lx]) => {
      const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.22, 8);
      const leg = new THREE.Mesh(legGeo, suitMat);
      leg.position.set(lx, 0.11, 0);
      this.alienGroup.add(leg);

      // Boot
      const bootGeo = new THREE.BoxGeometry(0.12, 0.06, 0.16);
      const boot = new THREE.Mesh(bootGeo, darkMat);
      boot.position.set(lx, 0.00, 0.02);
      this.alienGroup.add(boot);
    });

    // ── TORSO (slightly flared box with suit trim) ───────────────────────────
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.28, 0.22);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.set(0, 0.36, 0);
    this.alienGroup.add(torso);

    // Chest trim stripe
    const trimGeo = new THREE.BoxGeometry(0.38, 0.04, 0.23);
    const trim = new THREE.Mesh(trimGeo, suitTrimMat);
    trim.position.set(0, 0.38, 0);
    this.alienGroup.add(trim);

    // Chest panel glow
    const panelGeo = new THREE.BoxGeometry(0.12, 0.10, 0.24);
    const panel = new THREE.Mesh(panelGeo, visorMat);
    panel.position.set(0, 0.35, 0);
    this.alienGroup.add(panel);

    // ── ARMS (angled outward) ────────────────────────────────────────────────
    [[-1, -0.22], [1, 0.22]].forEach(([side, xPos]) => {
      const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.24, 8);
      const arm = new THREE.Mesh(armGeo, suitMat);
      arm.rotation.z = side * 0.6;
      arm.position.set(xPos, 0.32, 0);
      this.alienGroup.add(arm);

      // Glove
      const gloveGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const glove = new THREE.Mesh(gloveGeo, skinMat);
      glove.position.set(xPos + side * 0.08, 0.22, 0);
      this.alienGroup.add(glove);
    });

    // ── NECK ─────────────────────────────────────────────────────────────────
    const neckGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.08, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.54, 0);
    this.alienGroup.add(neck);

    // ── HEAD (slightly oval) ─────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(1, 1.15, 0.95);
    head.position.set(0, 0.74, 0);
    this.alienGroup.add(head);

    // ── VISOR (flat ellipse across face front) ───────────────────────────────
    const visorGeo = new THREE.BoxGeometry(0.32, 0.12, 0.06);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.74, 0.19);
    this.alienGroup.add(visor);

    // ── EYES (glowing dots inside visor) ────────────────────────────────────
    [-0.08, 0.08].forEach(ex => {
      const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const eye = new THREE.Mesh(eyeGeo, eyeGlowMat);
      eye.position.set(ex, 0.74, 0.22);
      this.alienGroup.add(eye);
    });

    // ── HELMET RIM ───────────────────────────────────────────────────────────
    const rimGeo = new THREE.TorusGeometry(0.22, 0.025, 8, 24, Math.PI);
    const rim = new THREE.Mesh(rimGeo, suitTrimMat);
    rim.position.set(0, 0.74, 0);
    rim.rotation.y = Math.PI / 2;
    this.alienGroup.add(rim);

    // ── ANTENNAE ─────────────────────────────────────────────────────────────
    [[-0.12, 0.1], [0.12, -0.1]].forEach(([ax, az]) => {
      const antBase = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
      const ant = new THREE.Mesh(antBase, suitTrimMat);
      ant.position.set(ax, 1.01, az);
      ant.rotation.z = ax < 0 ? -0.25 : 0.25;
      this.alienGroup.add(ant);

      // Glowing orb tip
      const orbGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(ax + (ax < 0 ? -0.05 : 0.05), 1.12, az);
      this.alienGroup.add(orb);
    });

    // ── EAR FINS (pointed alien ears) ────────────────────────────────────────
    [-1, 1].forEach(side => {
      const earGeo = new THREE.ConeGeometry(0.06, 0.18, 6);
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.rotation.z = side * (Math.PI / 2 + 0.3);
      ear.position.set(side * 0.28, 0.76, 0);
      this.alienGroup.add(ear);
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
