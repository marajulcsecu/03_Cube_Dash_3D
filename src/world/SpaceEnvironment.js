/**
 * Authoritative Space Environment System for Cube Dash 3D
 * Renders a breathtaking 3D outer space backdrop featuring:
 * 1. Soft glowing circular starfield particles (using radial sprite texture, NO square pixel dots!)
 * 2. Saturn-like gas giant planet, cratered moon, and spinning black hole
 * 3. Dynamic Parallax World Motion: Celestial objects travel continuously past the player as you fly down the tunnel!
 * 4. Ambient passing spaceships zooming through deep space
 */

import * as THREE from 'three';

export class SpaceEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'SpaceEnvironmentGroup';
    this.scene.add(this.group);

    // Celestial components
    this.starfield = null;
    this.planetGroup = null;
    this.moonGroup = null;
    this.blackHoleGroup = null;
    this.blackHoleDisk = null;

    // Passing ambient spaceships pool
    this.spaceships = [];
    this.nextShipSpawnTime = 3.0;
    this.spawnTimer = 0;

    this._buildStarfield();
    this._buildRingedPlanet();
    this._buildMoon();
    this._buildBlackHole();
  }

  _createStarTexture() {
    if (typeof document === 'undefined') return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) return null;

      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.3, 'rgba(0, 243, 255, 0.7)');
      gradient.addColorStop(0.7, 'rgba(138, 43, 226, 0.25)');
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);

      return new THREE.CanvasTexture(canvas);
    } catch (e) {
      return null;
    }
  }

  _buildStarfield() {
    const starCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f3ff), // Cyan
      new THREE.Color(0xff007f), // Magenta
      new THREE.Color(0x8a2be2), // Violet
      new THREE.Color(0xffffff), // Soft White
      new THREE.Color(0xffcc00)  // Gold
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 80 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starTexture = this._createStarTexture();

    const matConfig = {
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    };
    if (starTexture) matConfig.map = starTexture;

    const material = new THREE.PointsMaterial(matConfig);

    this.starfield = new THREE.Points(geometry, material);
    this.group.add(this.starfield);
  }

  _buildRingedPlanet() {
    this.planetGroup = new THREE.Group();
    // Scaled for mobile viewports, placed in sky upper-right background
    this.planetGroup.position.set(38, 22, -130);

    // Planet Body (Gas Giant)
    const planetGeo = new THREE.SphereGeometry(10, 24, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1b1438,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x0c0824,
      emissiveIntensity: 0.6
    });

    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.planetGroup.add(planetMesh);

    // Outer Cyan Glowing Rings
    const ringGeo = new THREE.RingGeometry(13, 20, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.45;
    ringMesh.rotation.y = Math.PI * 0.15;
    this.planetGroup.add(ringMesh);

    // Inner Pink Glow Ring
    const innerRingGeo = new THREE.RingGeometry(21, 23, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.rotation.x = Math.PI * 0.45;
    innerRingMesh.rotation.y = Math.PI * 0.15;
    this.planetGroup.add(innerRingMesh);

    this.group.add(this.planetGroup);
  }

  _buildMoon() {
    this.moonGroup = new THREE.Group();
    // Scaled for mobile viewports, placed in lower-left background
    this.moonGroup.position.set(-32, -16, -95);

    const moonGeo = new THREE.SphereGeometry(4.5, 20, 20);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0x102030,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });

    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonGroup.add(moonMesh);

    this.group.add(this.moonGroup);
  }

  _buildBlackHole() {
    this.blackHoleGroup = new THREE.Group();
    // Scaled for mobile viewports, placed in sky upper-left background
    this.blackHoleGroup.position.set(-36, 26, -145);

    // Dark Event Horizon Void Sphere
    const voidGeo = new THREE.SphereGeometry(6, 24, 24);
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x010206 });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    this.blackHoleGroup.add(voidMesh);

    // Swirling Accretion Disk Ring
    const diskGeo = new THREE.RingGeometry(7, 16, 36);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.blackHoleDisk = new THREE.Mesh(diskGeo, diskMat);
    this.blackHoleDisk.rotation.x = Math.PI * 0.4;
    this.blackHoleGroup.add(this.blackHoleDisk);

    // Secondary Cyan Energy Halo
    const haloGeo = new THREE.RingGeometry(17, 20, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI * 0.4;
    this.blackHoleGroup.add(haloMesh);

    this.group.add(this.blackHoleGroup);
  }

  spawnPassingSpaceship() {
    const shipGroup = new THREE.Group();

    // Fuselage / Cockpit
    const bodyGeo = new THREE.ConeGeometry(0.5, 2.2, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x141e38,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.4
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.rotation.x = Math.PI * 0.5;
    shipGroup.add(bodyMesh);

    // Swept Wings
    const wingGeo = new THREE.BoxGeometry(2.2, 0.08, 0.8);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0x660033,
      emissiveIntensity: 0.6
    });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, 0, 0.3);
    shipGroup.add(wingMesh);

    // Thruster Light
    const thrusterGeo = new THREE.SphereGeometry(0.35, 10, 10);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const thrusterMesh = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh.position.set(0, 0, -1.2);
    shipGroup.add(thrusterMesh);

    // Random trajectory across space sky
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -65 : 65;
    const endX = fromLeft ? 65 : -65;
    const startY = 10 + Math.random() * 25;
    const startZ = -30 - Math.random() * 50;

    shipGroup.position.set(startX, startY, startZ);
    shipGroup.lookAt(endX, startY, startZ);

    this.scene.add(shipGroup);

    this.spaceships.push({
      group: shipGroup,
      startX,
      endX,
      startY,
      startZ,
      speed: 60 + Math.random() * 40,
      progress: 0
    });
  }

  update(delta, currentSpeed = 15) {
    // 1. Dynamic Parallax Space Travel: Celestial objects move continuously along Z as player flies forward!
    const travelSpeed = currentSpeed * 0.15;

    if (this.planetGroup) {
      this.planetGroup.rotation.y += delta * 0.05;
      this.planetGroup.position.z += delta * travelSpeed;
      if (this.planetGroup.position.z > 25) {
        this.planetGroup.position.z = -160;
        this.planetGroup.position.x = 30 + Math.random() * 20;
      }
    }

    if (this.moonGroup) {
      this.moonGroup.rotation.y += delta * 0.03;
      this.moonGroup.position.z += delta * (travelSpeed * 1.2);
      if (this.moonGroup.position.z > 25) {
        this.moonGroup.position.z = -150;
        this.moonGroup.position.x = -25 - Math.random() * 20;
      }
    }

    if (this.blackHoleGroup) {
      if (this.blackHoleDisk) this.blackHoleDisk.rotation.z += delta * 0.5;
      this.blackHoleGroup.position.z += delta * (travelSpeed * 0.8);
      if (this.blackHoleGroup.position.z > 25) {
        this.blackHoleGroup.position.z = -170;
        this.blackHoleGroup.position.x = -35 + Math.random() * 20;
      }
    }

    // 2. Starfield Twinkle & Slow Rotation
    if (this.starfield) {
      this.starfield.rotation.y += delta * 0.008;
    }

    // 3. Ambient Passing Spaceship Spawning & Trajectory Movement
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextShipSpawnTime) {
      this.spawnTimer = 0;
      this.nextShipSpawnTime = 4.0 + Math.random() * 5.0; // Spawn ship every 4-9 seconds
      this.spawnPassingSpaceship();
    }

    // Update active passing spaceships
    for (let i = this.spaceships.length - 1; i >= 0; i--) {
      const ship = this.spaceships[i];
      const distance = Math.abs(ship.endX - ship.startX);
      ship.progress += (ship.speed * delta) / distance;

      ship.group.position.x = THREE.MathUtils.lerp(ship.startX, ship.endX, ship.progress);

      if (ship.progress >= 1.0) {
        this.scene.remove(ship.group);
        ship.group.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
          }
        });
        this.spaceships.splice(i, 1);
      }
    }
  }

  dispose() {
    this.spaceships.forEach(ship => {
      this.scene.remove(ship.group);
    });
    this.spaceships.length = 0;

    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }
  }
}
