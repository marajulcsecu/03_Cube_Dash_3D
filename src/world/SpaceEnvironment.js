/**
 * Authoritative Space Environment System for Cube Dash 3D
 * Renders a breathtaking 3D outer space backdrop featuring:
 * 1. 1,500+ twinkling multi-colored starfield particles (cyan, magenta, white, gold)
 * 2. Giant ringed gas planet (Saturn-like sci-fi giant) with glowing tilted rings
 * 3. Cratered glowing alien moon
 * 4. Gravitational Black Hole with swirling glowing accretion disk
 * 5. Dynamic ambient passing spaceships zooming through deep space with neon warp trails
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

  _buildStarfield() {
    const starCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const palette = [
      new THREE.Color(0x00f3ff), // Cyan
      new THREE.Color(0xff007f), // Magenta
      new THREE.Color(0x8a2be2), // Violet
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xffcc00)  // Golden
    ];

    for (let i = 0; i < starCount; i++) {
      // Radius between 110 and 190
      const radius = 110 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 1.0 + Math.random() * 2.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(geometry, material);
    this.group.add(this.starfield);
  }

  _buildRingedPlanet() {
    this.planetGroup = new THREE.Group();
    // Positioned in upper right deep background
    this.planetGroup.position.set(70, 32, -140);

    // Planet Body (Gas Giant with bands)
    const planetGeo = new THREE.SphereGeometry(24, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1b1438,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x090518,
      emissiveIntensity: 0.5
    });

    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.planetGroup.add(planetMesh);

    // Outer Cyan/Magenta Glowing Rings
    const ringGeo = new THREE.RingGeometry(30, 44, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.45;
    ringMesh.rotation.y = Math.PI * 0.15;
    this.planetGroup.add(ringMesh);

    // Inner Secondary Ring
    const innerRingGeo = new THREE.RingGeometry(46, 50, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
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
    // Positioned in lower left deep background
    this.moonGroup.position.set(-60, -22, -110);

    const moonGeo = new THREE.SphereGeometry(10, 24, 24);
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
    // Positioned straight ahead high in space at end of tunnel
    this.blackHoleGroup.position.set(0, 38, -160);

    // Dark Event Horizon Void Sphere
    const voidGeo = new THREE.SphereGeometry(14, 32, 32);
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x010206 });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    this.blackHoleGroup.add(voidMesh);

    // Swirling Accretion Disk Ring
    const diskGeo = new THREE.RingGeometry(16, 36, 48);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.blackHoleDisk = new THREE.Mesh(diskGeo, diskMat);
    this.blackHoleDisk.rotation.x = Math.PI * 0.4;
    this.blackHoleGroup.add(this.blackHoleDisk);

    // Secondary Cyan Energy Halo
    const haloGeo = new THREE.RingGeometry(37, 42, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
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
    const bodyGeo = new THREE.ConeGeometry(0.8, 3.5, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x141e38,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.3
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.rotation.x = Math.PI * 0.5;
    shipGroup.add(bodyMesh);

    // Swept Wings
    const wingGeo = new THREE.BoxGeometry(3.2, 0.1, 1.2);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0x660033,
      emissiveIntensity: 0.6
    });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, 0, 0.4);
    shipGroup.add(wingMesh);

    // Neon Plasma Thruster Glow
    const thrusterGeo = new THREE.SphereGeometry(0.5, 12, 12);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const thrusterMesh = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh.position.set(0, 0, -1.8);
    shipGroup.add(thrusterMesh);

    // Randomize trajectory (e.g. fly from left to right or top to bottom across deep space)
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -90 : 90;
    const endX = fromLeft ? 90 : -90;
    const startY = 15 + Math.random() * 30;
    const startZ = -40 - Math.random() * 60;

    shipGroup.position.set(startX, startY, startZ);
    // Orient ship along travel direction
    shipGroup.lookAt(endX, startY, startZ);

    this.scene.add(shipGroup);

    this.spaceships.push({
      group: shipGroup,
      startX,
      endX,
      startY,
      startZ,
      speed: 70 + Math.random() * 50, // High velocity flyby
      progress: 0
    });
  }

  update(delta, elapsed = 0) {
    // 1. Slow rotation of Planet and Black Hole Accretion Disk
    if (this.planetGroup) {
      this.planetGroup.rotation.y += delta * 0.04;
    }

    if (this.blackHoleDisk) {
      this.blackHoleDisk.rotation.z += delta * 0.35;
    }

    if (this.moonGroup) {
      this.moonGroup.rotation.y += delta * 0.02;
    }

    // 2. Starfield Twinkle
    if (this.starfield) {
      this.starfield.rotation.y += delta * 0.005;
      this.starfield.rotation.z += delta * 0.002;
    }

    // 3. Ambient Passing Spaceship Spawning & Trajectory Movement
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextShipSpawnTime) {
      this.spawnTimer = 0;
      this.nextShipSpawnTime = 6.0 + Math.random() * 6.0; // Spawn every 6-12 seconds
      this.spawnPassingSpaceship();
    }

    // Update active passing spaceships
    for (let i = this.spaceships.length - 1; i >= 0; i--) {
      const ship = this.spaceships[i];
      const distance = Math.abs(ship.endX - ship.startX);
      ship.progress += (ship.speed * delta) / distance;

      ship.group.position.x = THREE.MathUtils.lerp(ship.startX, ship.endX, ship.progress);

      // Despawn once out of sight
      if (ship.progress >= 1.0) {
        this.scene.remove(ship.group);
        // Clean up geometry & materials
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
