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
    this.groundY = 0.25; // Half of 0.5-height cube
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

    // Fly-off death animation
    this._flyOffActive  = false;
    this._flyOffVel     = new THREE.Vector3();
    this._flyOffAngVel  = new THREE.Vector3();
    this._flyOffTimer   = 0;
    this._flyOffDuration = 1.6; // seconds until alien fully gone

    this._buildMesh();
  }

  _buildMesh() {
    // Thinner slab cube — 1 wide × 0.5 tall × 1 deep
    const cubeGeo = new THREE.BoxGeometry(1, 0.5, 1);
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
    // ── Clean up any previous alien rider instances from visualMesh and scene ─
    if (this.visualMesh) {
      for (let i = this.visualMesh.children.length - 1; i >= 0; i--) {
        if (this.visualMesh.children[i].name === 'AlienRider') {
          this.visualMesh.remove(this.visualMesh.children[i]);
        }
      }
    }
    if (this.scene) {
      for (let i = this.scene.children.length - 1; i >= 0; i--) {
        if (this.scene.children[i].name === 'AlienRider') {
          this.scene.remove(this.scene.children[i]);
        }
      }
    }
    this.alienGroup = null;

    this.alienGroup = new THREE.Group();
    this.alienGroup.name = 'AlienRider';
    // Sit on top of the 0.5-tall cube — top face is at +0.25
    this.alienGroup.position.set(0, 0.25, 0);

    // ── Running animation clock ───────────────────────────────────────────────
    this._animTime = 0;

    // ── Material palette ─────────────────────────────────────────────────────
    const skinMat     = new THREE.MeshStandardMaterial({ color: 0x3de8c8, roughness: 0.45, metalness: 0.15 });
    const suitMat     = new THREE.MeshStandardMaterial({ color: 0x1a0a3a, roughness: 0.6 });
    const suitTrimMat = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.35, metalness: 0.4 });
    const visorMat    = new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00a8ff, emissiveIntensity: 1.4, transparent: true, opacity: 0.82, roughness: 0.04 });
    const eyeGlowMat  = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const orbMat      = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const darkMat     = new THREE.MeshStandardMaterial({ color: 0x0a0320, roughness: 0.8 });

    // ── UPPER BODY GROUP (bobs during run) ───────────────────────────────────
    this._bodyGroup = new THREE.Group();
    this._bodyGroup.position.set(0, 0, 0);
    this.alienGroup.add(this._bodyGroup);

    // ── LEFT LEG pivot ───────────────────────────────────────────────────────
    this._legL = new THREE.Group();
    this._legL.position.set(-0.12, 0.22, 0);
    this.alienGroup.add(this._legL);

    const legLGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.26, 8);
    this._legL.add(new THREE.Mesh(legLGeo, suitMat));
    const bootLGeo = new THREE.BoxGeometry(0.13, 0.07, 0.18);
    const bootL = new THREE.Mesh(bootLGeo, darkMat);
    bootL.position.set(0, -0.15, 0.02);
    this._legL.add(bootL);

    // ── RIGHT LEG pivot ──────────────────────────────────────────────────────
    this._legR = new THREE.Group();
    this._legR.position.set(0.12, 0.22, 0);
    this.alienGroup.add(this._legR);

    const legRGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.26, 8);
    this._legR.add(new THREE.Mesh(legRGeo, suitMat));
    const bootRGeo = new THREE.BoxGeometry(0.13, 0.07, 0.18);
    const bootR = new THREE.Mesh(bootRGeo, darkMat);
    bootR.position.set(0, -0.15, 0.02);
    this._legR.add(bootR);

    // ── TORSO ────────────────────────────────────────────────────────────────
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.28, 0.22);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.set(0, 0.52, 0);
    this._bodyGroup.add(torso);

    // Chest trim stripe
    const trimGeo = new THREE.BoxGeometry(0.38, 0.04, 0.235);
    const trim = new THREE.Mesh(trimGeo, suitTrimMat);
    trim.position.set(0, 0.54, 0);
    this._bodyGroup.add(trim);

    // Chest reactor glow
    const panelGeo = new THREE.BoxGeometry(0.11, 0.09, 0.24);
    const panel = new THREE.Mesh(panelGeo, visorMat);
    panel.position.set(0, 0.51, 0);
    this._bodyGroup.add(panel);

    // ── LEFT ARM pivot (shoulder socket at torso edge) ───────────────────────
    this._armL = new THREE.Group();
    this._armL.position.set(-0.22, 0.56, 0);
    this._bodyGroup.add(this._armL);

    const armLGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.26, 8);
    const armLMesh = new THREE.Mesh(armLGeo, suitMat);
    armLMesh.position.set(0, -0.13, 0);
    this._armL.add(armLMesh);

    const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), skinMat);
    gloveL.position.set(0, -0.27, 0);
    this._armL.add(gloveL);

    // ── RIGHT ARM pivot ──────────────────────────────────────────────────────
    this._armR = new THREE.Group();
    this._armR.position.set(0.22, 0.56, 0);
    this._bodyGroup.add(this._armR);

    const armRGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.26, 8);
    const armRMesh = new THREE.Mesh(armRGeo, suitMat);
    armRMesh.position.set(0, -0.13, 0);
    this._armR.add(armRMesh);

    const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), skinMat);
    gloveR.position.set(0, -0.27, 0);
    this._armR.add(gloveR);

    // ── NECK ─────────────────────────────────────────────────────────────────
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.085, 0.09, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.70, 0);
    this._bodyGroup.add(neck);

    // ── HEAD GROUP (bobs with body + slight independent head bob) ────────────
    this._headGroup = new THREE.Group();
    this._headGroup.position.set(0, 0.92, 0);
    this._bodyGroup.add(this._headGroup);

    const headGeo = new THREE.SphereGeometry(0.215, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(1, 1.12, 0.93);
    this._headGroup.add(head);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.31, 0.11, 0.07);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0, 0.19);
    this._headGroup.add(visor);

    // Eyes
    [-0.075, 0.075].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeGlowMat);
      eye.position.set(ex, 0, 0.215);
      this._headGroup.add(eye);
    });

    // Helmet rim
    const rimGeo = new THREE.TorusGeometry(0.215, 0.022, 8, 24, Math.PI);
    const rim = new THREE.Mesh(rimGeo, suitTrimMat);
    rim.rotation.y = Math.PI / 2;
    this._headGroup.add(rim);

    // Ear fins
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.17, 6), skinMat);
      ear.rotation.z = side * (Math.PI / 2 + 0.3);
      ear.position.set(side * 0.265, 0, 0);
      this._headGroup.add(ear);
    });

    // ── ANTENNAE (stored for wobble) ─────────────────────────────────────────
    this._antL = new THREE.Group();
    this._antL.position.set(-0.10, 0.22, 0.05);
    this._headGroup.add(this._antL);
    this._antL.add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), suitTrimMat));
    const orbL = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), orbMat);
    orbL.position.set(0, 0.13, 0);
    this._antL.add(orbL);

    this._antR = new THREE.Group();
    this._antR.position.set(0.10, 0.22, -0.05);
    this._headGroup.add(this._antR);
    this._antR.add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), suitTrimMat));
    const orbR = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), orbMat);
    orbR.position.set(0, 0.13, 0);
    this._antR.add(orbR);

    this.visualMesh.add(this.alienGroup);
  }

  /**
   * Procedural running animation — driven by elapsed time.
   * Arms swing fore/back on Z, legs alternate on X, body bobs on Y,
   * antennae wobble. On jump: arms raise up, legs tuck forward.
   */
  _updateAlienAnimation(delta) {
    if (!this.alienGroup) return;

    this._animTime += delta;
    const t = this._animTime;
    const RUN_FREQ  = 6.5;  // cycles per second
    const ARM_AMP   = 0.75; // radians arm swing
    const LEG_AMP   = 0.60; // radians leg stride
    const BOB_AMP   = 0.018; // Y bob amplitude
    const ANT_AMP   = 0.18; // antennae wobble

    if (this.isGrounded) {
      // ── Running cycle ─────────────────────────────────────────────────────
      const phase = t * RUN_FREQ;
      const swing = Math.sin(phase);
      const swingAlt = -swing; // opposite phase for alternating limbs

      // Arms swing fore/back (Z rotation around shoulder pivot)
      if (this._armL) this._armL.rotation.x = swing * ARM_AMP;
      if (this._armR) this._armR.rotation.x = swingAlt * ARM_AMP;

      // Legs alternate stride (X-axis kick at hip)
      if (this._legL) this._legL.rotation.x = swingAlt * LEG_AMP;
      if (this._legR) this._legR.rotation.x = swing * LEG_AMP;

      // Body bob (double frequency — two bobs per stride cycle)
      const bob = Math.abs(Math.sin(phase)) * BOB_AMP;
      if (this._bodyGroup) this._bodyGroup.position.y = bob;

      // Head slight counter-bob for naturalness
      if (this._headGroup) this._headGroup.rotation.x = swing * 0.04;

      // Antennae wobble (slight lag behind body)
      if (this._antL) this._antL.rotation.z = Math.sin(phase + 0.5) * ANT_AMP;
      if (this._antR) this._antR.rotation.z = Math.sin(phase - 0.5) * -ANT_AMP;

    } else {
      // ── Jump pose — arms up, legs tucked ─────────────────────────────────
      const jumpProgress = Math.min(1, Math.abs(this.verticalVelocity) / this.jumpImpulse);
      const rising = this.verticalVelocity > 0;

      if (this._armL) this._armL.rotation.x = THREE.MathUtils.lerp(this._armL.rotation.x, rising ? -1.1 : 0.3, 0.2);
      if (this._armR) this._armR.rotation.x = THREE.MathUtils.lerp(this._armR.rotation.x, rising ? -1.1 : 0.3, 0.2);
      if (this._legL) this._legL.rotation.x = THREE.MathUtils.lerp(this._legL.rotation.x, rising ? 0.6 : -0.3, 0.2);
      if (this._legR) this._legR.rotation.x = THREE.MathUtils.lerp(this._legR.rotation.x, rising ? 0.6 : -0.3, 0.2);

      // Head tilts up on ascent, forward on descent
      if (this._headGroup) this._headGroup.rotation.x = rising ? -0.15 : 0.12;

      // Antennae trail back on jump
      if (this._antL) this._antL.rotation.z = rising ? -0.35 : 0.2;
      if (this._antR) this._antR.rotation.z = rising ? 0.35 : -0.2;
    }
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
    if (this._flyOffActive) {
      this._updateFlyOff(delta);
      return; // freeze cube movement during death
    }
    this._updateLaneMovement(delta);
    this._updateJumpPhysics(delta);
    this._updateVisualDeformation(delta);
    this._updateAlienAnimation(delta);

    // Sync 3D mesh position with logical (currentX, y, 2.0)
    this.meshGroup.position.x = this.currentX;
    this.meshGroup.position.y = this.y;
  }

  /**
   * Trigger fly-off death animation.
   * Detaches alienGroup from visualMesh into world space,
   * launches it with upward + randomised lateral velocity,
   * applies rapid tumble spin, and fades it out over ~1.6s.
   */
  triggerFlyOff() {
    if (this._flyOffActive || !this.alienGroup) return;
    this._flyOffActive = true;
    this._flyOffTimer  = 0;

    // ── Detach alien from cube: reparent to scene in world space ──────────────
    // Compute world position of alienGroup before reparenting
    const worldPos = new THREE.Vector3();
    this.alienGroup.getWorldPosition(worldPos);

    if (this.alienGroup.parent) {
      this.alienGroup.parent.remove(this.alienGroup);
    }
    this.scene.add(this.alienGroup);
    this.alienGroup.position.copy(worldPos);

    // Thoroughly remove any remaining AlienRider children from visualMesh
    if (this.visualMesh) {
      for (let i = this.visualMesh.children.length - 1; i >= 0; i--) {
        if (this.visualMesh.children[i].name === 'AlienRider') {
          this.visualMesh.remove(this.visualMesh.children[i]);
        }
      }
    }

    // ── Launch velocity: up + slight forward + random left/right ──────────────
    const lateralSign = Math.random() > 0.5 ? 1 : -1;
    this._flyOffVel.set(
      lateralSign * (1.8 + Math.random() * 1.4),  // X: random side
      5.5 + Math.random() * 1.5,                   // Y: strong upward
      -(1.0 + Math.random() * 0.8)                 // Z: fly toward camera
    );

    // ── Tumble angular velocity (random axis) ─────────────────────────────────
    this._flyOffAngVel.set(
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 16
    );
  }

  _updateFlyOff(delta) {
    if (!this._flyOffActive || !this.alienGroup) return;

    this._flyOffTimer += delta;
    const t = this._flyOffTimer;

    // Gravity pulls alien down
    this._flyOffVel.y -= 18 * delta;

    // Move alien
    this.alienGroup.position.x += this._flyOffVel.x * delta;
    this.alienGroup.position.y += this._flyOffVel.y * delta;
    this.alienGroup.position.z += this._flyOffVel.z * delta;

    // Tumble spin
    this.alienGroup.rotation.x += this._flyOffAngVel.x * delta;
    this.alienGroup.rotation.y += this._flyOffAngVel.y * delta;
    this.alienGroup.rotation.z += this._flyOffAngVel.z * delta;

    // Fade out all meshes (opacity ramps down after halfway)
    const fadeStart = this._flyOffDuration * 0.45;
    if (t > fadeStart) {
      const fadeProgress = Math.min(1, (t - fadeStart) / (this._flyOffDuration - fadeStart));
      const opacity = 1 - fadeProgress;
      this.alienGroup.traverse(obj => {
        if (obj.isMesh && obj.material) {
          obj.material.transparent = true;
          obj.material.opacity = opacity;
        }
      });
    }

    // Remove alien from scene when animation completes
    if (t >= this._flyOffDuration) {
      this.scene.remove(this.alienGroup);
      this.alienGroup = null;
      this._flyOffActive = false;
    }
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
    // Cancel any active fly-off
    if (this._flyOffActive && this.alienGroup) {
      this.scene.remove(this.alienGroup);
    }
    this._flyOffActive = false;
    this._flyOffTimer  = 0;
    this.alienGroup    = null;

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

    // Rebuild the alien rider fresh for next run
    this._buildAlienRider();
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
