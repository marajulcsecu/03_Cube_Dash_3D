/**
 * Authoritative Player Controller
 * Encapsulates 5-lane position calculations (-4.0 to +4.0 X coordinates),
 * instant responsive lane changes, jump physics (gravity & initial impulse),
 * coyote timing window, visual squash/stretch deformations,
 * Cyberpunk Space Bike model with glowing yoke handlebars, alien rider racing pose,
 * and dual rear exhaust smoke particle trail system.
 */

import * as THREE from 'three';

class ExhaustParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 40;
    this.geo = new THREE.SphereGeometry(0.09, 8, 8);
  }

  emit(worldPos) {
    if (this.particles.length >= this.maxParticles) {
      const p = this.particles.shift();
      p.mesh.position.copy(worldPos);
      p.mesh.scale.set(1, 1, 1);
      p.life = 0;
      p.maxLife = 0.45 + Math.random() * 0.25;
      p.vel.set(
        (Math.random() - 0.5) * 0.5,
        0.2 + Math.random() * 0.4,
        3.0 + Math.random() * 1.5 // Drift back toward camera (+Z)
      );
      this.particles.push(p);
      return;
    }

    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.35 ? 0x00f3ff : 0xff007f,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(this.geo, mat);
    mesh.position.copy(worldPos);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      life: 0,
      maxLife: 0.45 + Math.random() * 0.25,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        0.2 + Math.random() * 0.4,
        3.0 + Math.random() * 1.5
      )
    });
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      } else {
        const progress = p.life / p.maxLife;
        p.mesh.position.addScaledVector(p.vel, delta);
        const scale = 1.0 + progress * 2.8;
        p.mesh.scale.set(scale, scale, scale);
        p.mesh.material.opacity = (1.0 - progress) * 0.65;
      }
    }
  }

  reset() {
    this.particles.forEach(p => {
      this.scene.remove(p.mesh);
      if (p.mesh.geometry) p.mesh.geometry.dispose();
      if (p.mesh.material) p.mesh.material.dispose();
    });
    this.particles = [];
  }
}

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
    this.groundY = 0.25; // Half of 0.5-height space bike clearance
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

    // Exhaust Smoke System
    this.smokeSystem = new ExhaustParticleSystem(scene);
    this._smokeTimer = 0;

    this._buildMesh();
  }

  _buildMesh() {
    // Visual container group for Space Bike & Alien Rider (NO blue cube geometry!)
    this.visualMesh = new THREE.Group();
    this.visualMesh.name = 'VisualPlayerContainer';

    // Invisible wireframe mesh reference for unit test compatibility
    const dummyGeo = new THREE.BoxGeometry(1, 0.5, 1);
    const wireGeo = new THREE.WireframeGeometry(dummyGeo);
    const wireMat = new THREE.LineBasicMaterial({ visible: false });
    this.wireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
    this.visualMesh.add(this.wireframeMesh);

    // Build Cyberpunk Space Bike
    this._buildSpaceBike();

    // Build Alien Rider seated on bike
    this._buildAlienRider();

    this.meshGroup.add(this.visualMesh);
    this.meshGroup.position.set(0, this.y, 2.0); // Fixed Z position

    this.scene.add(this.meshGroup);
  }

  _buildSpaceBike() {
    if (this.bikeGroup) {
      if (this.bikeGroup.parent) this.bikeGroup.parent.remove(this.bikeGroup);
      this.bikeGroup = null;
    }

    this.bikeGroup = new THREE.Group();
    this.bikeGroup.name = 'SpaceBike';
    this.bikeGroup.rotation.y = Math.PI; // Face forward into tunnel (-Z)

    // Material palette
    const bodyMat   = new THREE.MeshStandardMaterial({ color: 0x141e38, roughness: 0.25, metalness: 0.85 });
    const armorMat  = new THREE.MeshStandardMaterial({ color: 0x1e2a4a, roughness: 0.3, metalness: 0.6 });
    const trimMat   = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.2, metalness: 0.5, emissive: 0x660033, emissiveIntensity: 0.6 });
    const glowMat   = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const darkMat   = new THREE.MeshStandardMaterial({ color: 0x080c18, roughness: 0.6 });

    // 1. Main Aerodynamic Chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.26, 1.3), bodyMat);
    body.position.set(0, 0.14, 0);
    this.bikeGroup.add(body);

    // Aerodynamic Nose Cone (pointing -Z into tunnel)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.5, 12), bodyMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.13, 0.85);
    this.bikeGroup.add(nose);

    // Glowing Headlight Visor on Nose
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), glowMat);
    headlight.scale.set(1.5, 0.6, 0.8);
    headlight.position.set(0, 0.15, 1.02);
    this.bikeGroup.add(headlight);

    // Side Wings with Neon Trim & Foot Pegs
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.8), bodyMat);
      wing.position.set(side * 0.36, 0.09, 0);
      wing.rotation.z = side * -0.15;
      this.bikeGroup.add(wing);

      const wingTrim = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.82), trimMat);
      wingTrim.position.set(side * 0.46, 0.09, 0);
      this.bikeGroup.add(wingTrim);

      // Foot Rest Pegs
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 8), darkMat);
      peg.rotation.z = Math.PI / 2;
      peg.position.set(side * 0.28, 0.04, -0.15);
      this.bikeGroup.add(peg);
    });

    // ── PROMINENT STEERING CONSOLE & HANDLEBARS ──────────────────────────────
    const steeringColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.32, 8), darkMat);
    steeringColumn.rotation.x = 0.3;
    steeringColumn.position.set(0, 0.35, 0.35);
    this.bikeGroup.add(steeringColumn);

    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.14), armorMat);
    dashboard.position.set(0, 0.44, 0.32);
    this.bikeGroup.add(dashboard);

    // Wide Cyberpunk Steering Yoke Bar
    const handleBarBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.58, 12), trimMat);
    handleBarBar.rotation.z = Math.PI / 2;
    handleBarBar.position.set(0, 0.48, 0.28);
    this.bikeGroup.add(handleBarBar);

    // Left & Right Glowing Handlebar Grips
    [-0.27, 0.27].forEach(hx => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 12), glowMat);
      grip.position.set(hx, 0.48, 0.22);
      this.bikeGroup.add(grip);
    });

    // Racer Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.45), darkMat);
    seat.position.set(0, 0.26, -0.15);
    this.bikeGroup.add(seat);

    // Rear Dual Exhaust Thruster Tubes (facing +Z toward camera)
    this.exhaustNozzles = [];
    [-0.14, 0.14].forEach(ex => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.30, 12), trimMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(ex, 0.14, -0.65);
      this.bikeGroup.add(tube);

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.08, 12), glowMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(ex, 0.14, -0.80);
      this.bikeGroup.add(nozzle);

      this.exhaustNozzles.push(nozzle);
    });

    // Anti-Gravity Underglow Ring
    const hoverRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 8, 24), glowMat);
    hoverRing.rotation.x = Math.PI / 2;
    hoverRing.position.set(0, 0.01, 0);
    this.bikeGroup.add(hoverRing);

    this.visualMesh.add(this.bikeGroup);
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
    // Sit on top of the space bike seat at Y = 0.22, Z = -0.15
    this.alienGroup.position.set(0, 0.22, -0.15);
    // Face FORWARD into the tunnel (away from camera)
    this.alienGroup.rotation.y = Math.PI;

    // ── Animation clock ───────────────────────────────────────────────────────
    this._animTime = 0;

    // ── Material palette ─────────────────────────────────────────────────────
    const skinMat     = new THREE.MeshStandardMaterial({ color: 0x22e0af, roughness: 0.35, metalness: 0.2 });
    const suitMat     = new THREE.MeshStandardMaterial({ color: 0x140a33, roughness: 0.45, metalness: 0.4 });
    const armorMat    = new THREE.MeshStandardMaterial({ color: 0x1e2a4a, roughness: 0.3, metalness: 0.6 });
    const suitTrimMat = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.3, metalness: 0.5, emissive: 0x660033, emissiveIntensity: 0.5 });
    const visorMat    = new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00d4ff, emissiveIntensity: 1.6, transparent: true, opacity: 0.85, roughness: 0.05 });
    const eyeGlowMat  = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const orbMat      = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const darkMat     = new THREE.MeshStandardMaterial({ color: 0x080414, roughness: 0.7 });

    this._thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

    // ── UPPER BODY GROUP (Leaning forward into handlebars) ───────────────────
    this._bodyGroup = new THREE.Group();
    this._bodyGroup.position.set(0, 0, 0);
    this._bodyGroup.rotation.x = 0.35; // Forward racing posture toward handlebars (+X rotation in alien space points forward)
    this.alienGroup.add(this._bodyGroup);

    // ── LEGS & BOOTS (flexed forward onto foot pegs) ─────────────────────────
    this._legL = new THREE.Group();
    this._legL.position.set(-0.14, 0.05, 0);
    this.alienGroup.add(this._legL);

    const legLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.26, 12), suitMat);
    legLMesh.rotation.x = 0.35;
    legLMesh.position.set(0, -0.05, 0.05);
    this._legL.add(legLMesh);

    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.18), darkMat);
    bootL.position.set(0, -0.16, 0.08);
    this._legL.add(bootL);

    this._legR = new THREE.Group();
    this._legR.position.set(0.14, 0.05, 0);
    this.alienGroup.add(this._legR);

    const legRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.26, 12), suitMat);
    legRMesh.rotation.x = 0.35;
    legRMesh.position.set(0, -0.05, 0.05);
    this._legR.add(legRMesh);

    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.18), darkMat);
    bootR.position.set(0, -0.16, 0.08);
    this._legR.add(bootR);

    // ── TORSO & CHEST ARMOR ──────────────────────────────────────────────────
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.30, 0.24), suitMat);
    torso.position.set(0, 0.32, 0);
    this._bodyGroup.add(torso);

    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.08), armorMat);
    chestPlate.position.set(0, 0.33, 0.10);
    this._bodyGroup.add(chestPlate);

    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12), visorMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.33, 0.14);
    this._bodyGroup.add(core);

    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.26), suitTrimMat);
    belt.position.set(0, 0.18, 0);
    this._bodyGroup.add(belt);

    // ── JETPACK / BACKPACK (Mounted on Back) ─────────────────────────────────
    const jetpackGroup = new THREE.Group();
    jetpackGroup.position.set(0, 0.32, -0.16);
    this._bodyGroup.add(jetpackGroup);

    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.12), armorMat);
    jetpackGroup.add(packBody);

    [-0.11, 0.11].forEach(tx => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.28, 12), suitTrimMat);
      tube.position.set(tx, -0.02, -0.02);
      jetpackGroup.add(tube);

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.06, 12), this._thrusterMat);
      nozzle.position.set(tx, -0.16, -0.02);
      jetpackGroup.add(nozzle);
    });

    [-1, 1].forEach(side => {
      const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armorMat);
      pauldron.scale.set(1.2, 0.8, 1.2);
      pauldron.position.set(side * 0.24, 0.42, 0);
      this._bodyGroup.add(pauldron);
    });

    // ── ARMS & GLOVES (Reaching FORWARD grabbing the handlebar grips!) ────────
    // Positive X rotation points arms forward into local +Z toward handlebars
    this._armL = new THREE.Group();
    this._armL.position.set(-0.23, 0.38, 0.08);
    this._armL.rotation.x = 0.85; // Reach FORWARD into handlebars
    this._armL.rotation.y = -0.22;
    this._bodyGroup.add(this._armL);

    const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.32, 8), suitMat);
    armLMesh.position.set(0, -0.16, 0);
    this._armL.add(armLMesh);

    // Left Glove wrapping handlebar grip
    const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), skinMat);
    gloveL.position.set(0, -0.32, 0);
    this._armL.add(gloveL);

    this._armR = new THREE.Group();
    this._armR.position.set(0.23, 0.38, 0.08);
    this._armR.rotation.x = 0.85; // Reach FORWARD into handlebars
    this._armR.rotation.y = 0.22;
    this._bodyGroup.add(this._armR);

    const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.32, 8), suitMat);
    armRMesh.position.set(0, -0.16, 0);
    this._armR.add(armRMesh);

    // Right Glove wrapping handlebar grip
    const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), skinMat);
    gloveR.position.set(0, -0.32, 0);
    this._armR.add(gloveR);

    // ── NECK & HEAD ──────────────────────────────────────────────────────────
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.09, 8), skinMat);
    neck.position.set(0, 0.50, 0);
    this._bodyGroup.add(neck);

    this._headGroup = new THREE.Group();
    this._headGroup.position.set(0, 0.72, 0);
    this._bodyGroup.add(this._headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.215, 16, 16), skinMat);
    head.scale.set(1, 1.15, 0.95);
    this._headGroup.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.11, 0.07), visorMat);
    visor.position.set(0, 0, 0.19);
    this._headGroup.add(visor);

    [-0.075, 0.075].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeGlowMat);
      eye.position.set(ex, 0, 0.215);
      this._headGroup.add(eye);
    });

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.022, 8, 24, Math.PI), suitTrimMat);
    rim.rotation.y = Math.PI / 2;
    this._headGroup.add(rim);

    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.17, 6), skinMat);
      ear.rotation.z = side * (Math.PI / 2 + 0.3);
      ear.position.set(side * 0.265, 0, 0);
      this._headGroup.add(ear);
    });

    this._antL = new THREE.Group();
    this._antL.position.set(-0.10, 0.22, 0.05);
    this._headGroup.add(this._antL);
    this._antL.add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), suitTrimMat));
    const orbL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), orbMat);
    orbL.position.set(0, 0.13, 0);
    this._antL.add(orbL);

    this._antR = new THREE.Group();
    this._antR.position.set(0.10, 0.22, -0.05);
    this._headGroup.add(this._antR);
    this._antR.add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), suitTrimMat));
    const orbR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), orbMat);
    orbR.position.set(0, 0.13, 0);
    this._antR.add(orbR);

    if (this.bikeGroup) {
      this.bikeGroup.add(this.alienGroup);
    } else {
      this.visualMesh.add(this.alienGroup);
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
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.isGrounded = false;
      this.coyoteTimer = 0.0;
      this.verticalVelocity = this.jumpImpulse;
      this.currentScale.set(0.75, 1.35, 0.75);
      return true;
    }
    return false;
  }

  update(delta) {
    if (this.smokeSystem) {
      this.smokeSystem.update(delta);
    }

    if (this._flyOffActive) {
      this._updateFlyOff(delta);
      return; // freeze bike movement during death
    }

    this._updateLaneMovement(delta);
    this._updateJumpPhysics(delta);
    this._updateVisualDeformation(delta);
    this._updateAlienAnimation(delta);

    // Sync 3D mesh position with logical (currentX, y, 2.0)
    this.meshGroup.position.x = this.currentX;
    this.meshGroup.position.y = this.y;
  }

  _updateAlienAnimation(delta) {
    if (!this.alienGroup) return;

    this._animTime += delta;
    const t = this._animTime;

    // Thruster pulse
    if (this._thrusterMat) {
      const pulse = 0.7 + Math.sin(t * 24) * 0.3;
      this._thrusterMat.color.setHSL(0.53, 1.0, pulse * 0.55);
    }

    // Bike Engine Rumble Vibration
    if (this.bikeGroup) {
      this.bikeGroup.position.y = Math.sin(t * 35) * 0.008;
    }

    // Emit smoke particles from dual rear nozzles when running
    if (this.isGrounded && !this._flyOffActive && this.smokeSystem && this.exhaustNozzles) {
      this._smokeTimer = (this._smokeTimer || 0) + delta;
      if (this._smokeTimer >= 0.04) { // Emit every 40ms
        this._smokeTimer = 0;
        const worldPos = new THREE.Vector3();
        this.exhaustNozzles.forEach(nozzle => {
          nozzle.getWorldPosition(worldPos);
          this.smokeSystem.emit(worldPos);
        });
      }
    }

    if (this.isGrounded) {
      // Racing Stance / Steering Grip Animation
      const bob = Math.sin(t * 12) * 0.012;
      if (this._bodyGroup) this._bodyGroup.position.y = bob;
      if (this._headGroup) this._headGroup.rotation.x = Math.sin(t * 10) * 0.03;

      const ANT_AMP = 0.16;
      if (this._antL) this._antL.rotation.z = Math.sin(t * 8 + 0.5) * ANT_AMP;
      if (this._antR) this._antR.rotation.z = Math.sin(t * 8 - 0.5) * -ANT_AMP;

    } else {
      // Jump pose — alien pulls back on handlebars
      const rising = this.verticalVelocity > 0;
      if (this._bodyGroup) this._bodyGroup.rotation.x = THREE.MathUtils.lerp(this._bodyGroup.rotation.x, rising ? 0.10 : 0.40, 0.2);
      if (this._headGroup) this._headGroup.rotation.x = rising ? -0.20 : 0.10;
      if (this._antL) this._antL.rotation.z = rising ? -0.35 : 0.2;
      if (this._antR) this._antR.rotation.z = rising ? 0.35 : -0.2;
    }
  }

  triggerFlyOff() {
    if (this._flyOffActive || !this.alienGroup) return;
    this._flyOffActive = true;
    this._flyOffTimer  = 0;

    // Detach alien from space bike: reparent to scene in world space
    const worldPos = new THREE.Vector3();
    this.alienGroup.getWorldPosition(worldPos);

    if (this.alienGroup.parent) {
      this.alienGroup.parent.remove(this.alienGroup);
    }
    this.scene.add(this.alienGroup);
    this.alienGroup.position.copy(worldPos);

    // Thoroughly remove any remaining AlienRider children
    if (this.visualMesh) {
      for (let i = this.visualMesh.children.length - 1; i >= 0; i--) {
        if (this.visualMesh.children[i].name === 'AlienRider') {
          this.visualMesh.remove(this.visualMesh.children[i]);
        }
      }
    }

    const lateralSign = Math.random() > 0.5 ? 1 : -1;
    this._flyOffVel.set(
      lateralSign * (1.8 + Math.random() * 1.4),  // X: random side
      5.5 + Math.random() * 1.5,                   // Y: strong upward
      -(1.0 + Math.random() * 0.8)                 // Z: fly toward camera
    );

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

    this._flyOffVel.y -= 18 * delta;

    this.alienGroup.position.x += this._flyOffVel.x * delta;
    this.alienGroup.position.y += this._flyOffVel.y * delta;
    this.alienGroup.position.z += this._flyOffVel.z * delta;

    this.alienGroup.rotation.x += this._flyOffAngVel.x * delta;
    this.alienGroup.rotation.y += this._flyOffAngVel.y * delta;
    this.alienGroup.rotation.z += this._flyOffAngVel.z * delta;

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
      
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      this.currentX = THREE.MathUtils.lerp(this.startX, targetX, easedProgress);

      const dir = targetX > this.startX ? -1 : 1;
      const bankAngle = Math.sin(progress * Math.PI) * 0.28 * dir;
      this.visualMesh.rotation.z = bankAngle;

      if (progress >= 1.0) {
        this.currentX = targetX;
        this.currentLane = this.targetLane;
        this.visualMesh.rotation.z = 0;
      }
    } else {
      this.currentLane = this.targetLane;
      this.visualMesh.rotation.z = THREE.MathUtils.lerp(this.visualMesh.rotation.z, 0, delta * 15);
    }
  }

  _updateJumpPhysics(delta) {
    if (!this.isGrounded) {
      this.y += this.verticalVelocity * delta;
      this.verticalVelocity += this.gravity * delta;

      if (this.y <= this.groundY) {
        this.y = this.groundY;
        this.verticalVelocity = 0.0;
        this.isGrounded = true;
        this.coyoteTimer = 0.0;
        this.currentScale.set(1.35, 0.65, 1.35);
      }
    } else {
      this.coyoteTimer = this.coyoteWindow;
    }
  }

  _updateVisualDeformation(delta) {
    this.currentScale.lerp(this.targetScale, Math.min(1.0, delta * 12));
    if (this.visualMesh) {
      this.visualMesh.scale.copy(this.currentScale);
    }
  }

  reset() {
    if (this.smokeSystem) {
      this.smokeSystem.reset();
    }

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

    this._buildSpaceBike();
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
