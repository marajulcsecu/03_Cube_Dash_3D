/**
 * Authoritative Tunnel Segment Representation
 * Encapsulates segment geometry, 5-lane coordinates, obstacle families, and floor gaps.
 */

import * as THREE from 'three';
import { OBSTACLE_TYPES } from './PatternLibrary.js';

export class TunnelSegment {
  constructor(materialFactory) {
    this.materialFactory = materialFactory;
    this.length = 10;
    this.segmentIndex = 0;
    this.isRestSegment = false;
    this.laneXPositions = [-4.0, -2.0, 0.0, 2.0, 4.0];

    this.hasGap = false;
    this.gapLanes = [];
    this.obstacles = [];

    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'TunnelSegment';

    this.wallMesh = null;
    this.gridMesh = null;
    this.laneLineGroup = null;
    this.obstacleGroup = new THREE.Group();

    this._buildSegmentMesh();
    this.meshGroup.add(this.obstacleGroup);
  }

  _buildSegmentMesh() {
    // Octagonal Tunnel Outer Ring
    const geo = new THREE.CylinderGeometry(5.5, 5.5, this.length, 8, 1, true);
    
    this.wallMesh = new THREE.Mesh(geo, this.materialFactory.get('tunnelWall'));
    this.wallMesh.rotation.x = Math.PI / 2;
    this.meshGroup.add(this.wallMesh);

    // Neon Wireframe Grid
    this.gridMesh = new THREE.Mesh(geo, this.materialFactory.get('cyanNeonGrid'));
    this.gridMesh.rotation.x = Math.PI / 2;
    this.gridMesh.scale.set(0.99, 1.01, 0.99);
    this.meshGroup.add(this.gridMesh);

    // 5 Lane Floor Line Markers
    this.laneLineGroup = new THREE.Group();
    const lineGeo = new THREE.BoxGeometry(0.08, 0.02, this.length);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, opacity: 0.6, transparent: true });

    // Dividers between lanes
    [-3.0, -1.0, 1.0, 3.0].forEach(x => {
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(x, -2.5, 0);
      this.laneLineGroup.add(lineMesh);
    });

    this.meshGroup.add(this.laneLineGroup);
  }

  addObstacleFromConfig(hazardConfig) {
    const type = hazardConfig.type;
    const relativeZ = hazardConfig.relativeZ || 0;

    switch (type) {
      case OBSTACLE_TYPES.LANE_WALL:
        this.addObstacle('wall', hazardConfig.lane, relativeZ);
        break;
      case OBSTACLE_TYPES.LOW_BARRIER:
        this.addObstacle('low_barrier', hazardConfig.lane || 2, relativeZ);
        break;
      case OBSTACLE_TYPES.MOVING_GATE:
        this._addMovingGate(hazardConfig.minLane || 1, hazardConfig.maxLane || 3, hazardConfig.speed || 2.5, relativeZ);
        break;
      case OBSTACLE_TYPES.PULSE_WALL:
        this._addPulseWall(hazardConfig.lane || 2, relativeZ, hazardConfig.pulseFrequency || 3.0);
        break;
      case OBSTACLE_TYPES.CRUSHER_FRAME:
        this._addCrusherFrame(hazardConfig.lane || 2, relativeZ);
        break;
      case OBSTACLE_TYPES.SHARD_TRAIL:
        this.addObstacle('shard', hazardConfig.lane || 2, relativeZ);
        break;
      case OBSTACLE_TYPES.FLOOR_GAP:
        this.addFloorGap(hazardConfig.gapLanes || [0, 1]);
        break;
      case OBSTACLE_TYPES.ASTEROID:
        this._addAsteroid(hazardConfig.lane || 2, relativeZ, hazardConfig.scale || 1.0);
        break;
      case OBSTACLE_TYPES.ALIEN_MONSTER:
        this._addAlienMonster(hazardConfig.lane || 2, relativeZ, hazardConfig.scale || 1.0);
        break;
      case OBSTACLE_TYPES.LASER_GRID:
        this._addLaserGrid(hazardConfig.lane || 2, relativeZ, hazardConfig.heightY || 1.1, hazardConfig.isSweeping || false);
        break;
      case OBSTACLE_TYPES.PLASMA_ROTOR:
        this._addPlasmaRotor(hazardConfig.lane || 2, relativeZ, hazardConfig.spinSpeed || 6.5);
        break;
      case OBSTACLE_TYPES.WORMHOLE_VOID:
        this._addWormholeVoid(hazardConfig.lane || 2, relativeZ, hazardConfig.scale || 1.0);
        break;
      case OBSTACLE_TYPES.COIN_TRAIL:
        this._addCoinTrail(hazardConfig.lane || 2, relativeZ, hazardConfig.count || 3);
        break;
      case OBSTACLE_TYPES.COIN:
        this._addSingleCoin(this.getLaneX(hazardConfig.lane || 2), hazardConfig.y || 1.0, relativeZ);
        break;
    }
  }

  addObstacle(type, laneIndex, relativeZ = 0) {
    const x = this.getLaneX(laneIndex);
    let width = 1.8, height = 2.2, depth = 0.8, y = 1.1;
    let mat = this.materialFactory.get('amberEmissive');

    if (type === 'low_barrier') {
      height = 0.6;
      y = 0.3;
    } else if (type === 'shard') {
      width = 0.5; height = 0.5; depth = 0.5; y = 0.6;
      mat = this.materialFactory.get('energyShard');
    }

    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, relativeZ);

    this.obstacleGroup.add(mesh);

    const obstacleObj = {
      x, y, relativeZ, width, height, depth,
      type, active: true, mesh
    };
    this.obstacles.push(obstacleObj);
  }

  _addMovingGate(minLane, maxLane, oscSpeed, relativeZ) {
    const minX = this.getLaneX(minLane);
    const maxX = this.getLaneX(maxLane);

    const width = 1.8, height = 2.2, depth = 0.8, y = 1.1;
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = this.materialFactory.get('amberEmissive');
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(minX, y, relativeZ);

    this.obstacleGroup.add(mesh);

    const obstacleObj = {
      x: minX, y, relativeZ, width, height, depth,
      type: 'moving_gate', active: true, mesh,
      minX, maxX, oscSpeed, phase: 0
    };
    this.obstacles.push(obstacleObj);
  }

  _addPulseWall(laneIndex, relativeZ, frequency) {
    const x = this.getLaneX(laneIndex);
    const width = 1.8, height = 2.2, depth = 0.8, y = 1.1;
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = this.materialFactory.get('amberEmissive');
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, relativeZ);

    this.obstacleGroup.add(mesh);

    const obstacleObj = {
      x, y, relativeZ, width, height, depth,
      type: 'pulse_wall', active: true, mesh,
      frequency, phase: 0
    };
    this.obstacles.push(obstacleObj);
  }

  _addCrusherFrame(laneIndex, relativeZ) {
    const x = this.getLaneX(laneIndex);
    const width = 1.8, height = 2.2, depth = 0.8, y = 1.1;
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = this.materialFactory.get('amberEmissive');
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, relativeZ);

    this.obstacleGroup.add(mesh);

    const obstacleObj = {
      x, y, relativeZ, width, height, depth,
      type: 'crusher_frame', active: true, mesh
    };
    this.obstacles.push(obstacleObj);
  }

  _addAsteroid(laneIndex, relativeZ = 0, sizeScale = 1.0) {
    const x = this.getLaneX(laneIndex);
    const radius = 0.95 * sizeScale;
    const y = radius + 0.15;

    const width = radius * 2.0, height = radius * 2.0, depth = radius * 2.0;

    // Create craggy 3D asteroid geometry with perturbed vertices
    const geo = new THREE.DodecahedronGeometry(radius, 1);
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const noise = 1.0 + (Math.sin(vx * 3.0 + vy * 5.0 + vz * 2.0) * 0.15);
      posAttr.setXYZ(i, vx * noise, vy * noise, vz * noise);
    }
    geo.computeVertexNormals();

    const mat = this.materialFactory.get('asteroidRock');
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, relativeZ);

    // Give mesh a molten orange wireframe rim
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xff6600, wireframe: true, transparent: true, opacity: 0.35 });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.scale.set(1.02, 1.02, 1.02);
    mesh.add(wireMesh);

    // Initial random rotation angles
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    this.obstacleGroup.add(mesh);

    const obstacleObj = {
      x, y, relativeZ, width, height, depth,
      type: 'asteroid', active: true, mesh,
      rotSpeedX: (Math.random() - 0.5) * 2.5,
      rotSpeedY: (Math.random() - 0.5) * 3.5,
      rotSpeedZ: (Math.random() - 0.5) * 2.0
    };
    this.obstacles.push(obstacleObj);
  }

  _addAlienMonster(laneIndex, relativeZ = 0, scale = 1.0) {
    const targetX = this.getLaneX(laneIndex);
    const width = 1.8 * scale, height = 2.0 * scale, depth = 1.6 * scale;
    const y = 1.25 * scale;

    const monsterGroup = new THREE.Group();
    monsterGroup.name = 'CyberAlienMonster';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x1f0c38,
      emissive: 0x3d004d,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.7,
      flatShading: true
    });

    const mawMat = new THREE.MeshStandardMaterial({
      color: 0x550011,
      emissive: 0x990022,
      emissiveIntensity: 1.2,
      roughness: 0.5
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffaa00,
      emissiveIntensity: 2.5,
      roughness: 0.1
    });

    const fangMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffeeaa,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });

    // 1. Spiked Main Head Skull (Dodecahedron)
    const headGeo = new THREE.DodecahedronGeometry(0.6 * scale, 1);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.scale.set(1.0, 0.9, 1.2);
    monsterGroup.add(headMesh);

    // 2. Open Roaring Mouth Cavity (Dark Crimson Box)
    const mouthGeo = new THREE.BoxGeometry(0.7 * scale, 0.4 * scale, 0.5 * scale);
    const mouthMesh = new THREE.Mesh(mouthGeo, mawMat);
    mouthMesh.position.set(0, -0.1 * scale, 0.35 * scale);
    monsterGroup.add(mouthMesh);

    // 3. Sharp Upper & Lower Fangs/Teeth (Cones)
    const upperJawGroup = new THREE.Group();
    [-0.22, -0.07, 0.07, 0.22].forEach(fx => {
      const fangGeo = new THREE.ConeGeometry(0.04 * scale, 0.22 * scale, 4);
      const topFang = new THREE.Mesh(fangGeo, fangMat);
      topFang.rotation.x = Math.PI;
      topFang.position.set(fx * scale, 0.08 * scale, 0.55 * scale);
      upperJawGroup.add(topFang);

      const botFang = new THREE.Mesh(fangGeo, fangMat);
      botFang.position.set(fx * scale, -0.25 * scale, 0.55 * scale);
      upperJawGroup.add(botFang);
    });
    monsterGroup.add(upperJawGroup);

    // 4. Dual Glowing Yellow Predator Eyes (Spheres set in sockets)
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 8, 8), eyeMat);
    leftEye.position.set(-0.25 * scale, 0.22 * scale, 0.48 * scale);
    monsterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 8, 8), eyeMat);
    rightEye.position.set(0.25 * scale, 0.22 * scale, 0.48 * scale);
    monsterGroup.add(rightEye);

    // 5. Menacing Side Horns / Spikes (Cones)
    [-0.6, 0.6].forEach(hx => {
      const hornGeo = new THREE.ConeGeometry(0.08 * scale, 0.65 * scale, 5);
      const hornMesh = new THREE.Mesh(hornGeo, skinMat);
      hornMesh.rotation.z = hx > 0 ? -Math.PI / 3 : Math.PI / 3;
      hornMesh.rotation.x = -Math.PI / 6;
      hornMesh.position.set(hx * scale, 0.35 * scale, 0.1 * scale);
      monsterGroup.add(hornMesh);
    });

    // 6. Threat Aura Wireframe Ring (Red Warning Glow)
    const auraGeo = new THREE.RingGeometry(0.85 * scale, 0.95 * scale, 12);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xff0044, wireframe: true, side: THREE.DoubleSide });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.rotation.x = Math.PI / 2;
    auraMesh.position.set(0, -0.6 * scale, 0);
    monsterGroup.add(auraMesh);

    // Start flying in from deep space on far left/right!
    const startX = targetX >= 0 ? 14.0 : -14.0;
    monsterGroup.position.set(startX, y, relativeZ);

    this.obstacleGroup.add(monsterGroup);

    const obstacleObj = {
      x: startX, targetX, y, relativeZ, width, height, depth,
      type: 'alien_monster', active: true, mesh: monsterGroup,
      leftEye, rightEye, upperJawGroup,
      hoverPhase: Math.random() * Math.PI * 2,
      entryProgress: 0.0
    };
    this.obstacles.push(obstacleObj);
  }

  _addLaserGrid(laneIndex, relativeZ = 0, heightY = 1.1, isSweeping = false) {
    const x = this.getLaneX(laneIndex);
    const width = 1.9, height = 0.4, depth = 0.3;

    const laserGroup = new THREE.Group();
    laserGroup.name = 'CyberLaserGrid';

    // 1. Twin Metallic Side Emitter Towers
    const pylonGeo = new THREE.CylinderGeometry(0.12, 0.16, 2.2, 8);
    const pylonMat = this.materialFactory.get('tunnelWall');

    const leftPylon = new THREE.Mesh(pylonGeo, pylonMat);
    leftPylon.position.set(-0.95, 1.1, 0);
    laserGroup.add(leftPylon);

    const rightPylon = new THREE.Mesh(pylonGeo, pylonMat);
    rightPylon.position.set(0.95, 1.1, 0);
    laserGroup.add(rightPylon);

    // Glowing Emitter Nodes on top of pylons
    const nodeGeo = new THREE.SphereGeometry(0.15, 10, 10);
    const nodeMat = this.materialFactory.get('cyanNeonGrid');

    const leftNode = new THREE.Mesh(nodeGeo, nodeMat);
    leftNode.position.set(-0.95, 2.1, 0);
    laserGroup.add(leftNode);

    const rightNode = new THREE.Mesh(nodeGeo, nodeMat);
    rightNode.position.set(0.95, 2.1, 0);
    laserGroup.add(rightNode);

    // 2. High-Tech Horizontal Plasma Laser Beam
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.9, 8);
    beamGeo.rotateZ(Math.PI / 2);
    const coreMat = this.materialFactory.get('laserBeamCore');
    const beamMesh = new THREE.Mesh(beamGeo, coreMat);
    beamMesh.position.set(0, heightY, 0);
    laserGroup.add(beamMesh);

    // Outer Laser Sheath / Aura
    const sheathGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.9, 8);
    sheathGeo.rotateZ(Math.PI / 2);
    const sheathMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.7 });
    const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
    sheathMesh.position.set(0, heightY, 0);
    laserGroup.add(sheathMesh);

    laserGroup.position.set(x, 0, relativeZ);
    this.obstacleGroup.add(laserGroup);

    const obstacleObj = {
      x, y: heightY, relativeZ, width, height, depth,
      type: 'laser_grid', active: true, mesh: laserGroup,
      beamMesh, sheathMesh,
      heightY, isSweeping,
      sweepPhase: Math.random() * Math.PI * 2
    };
    this.obstacles.push(obstacleObj);
  }

  _addPlasmaRotor(laneIndex, relativeZ = 0, spinSpeed = 6.5) {
    const x = this.getLaneX(laneIndex);
    const radius = 1.1;
    const width = radius * 2.0, height = radius * 2.0, depth = 0.4;
    const y = 1.1;

    const rotorGroup = new THREE.Group();
    rotorGroup.name = 'PlasmaSawRotor';

    // 1. Central Mechanical Axle Hub (Cylinder)
    const hubGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 12);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = this.materialFactory.get('tunnelWall');
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    rotorGroup.add(hubMesh);

    // Glowing Yellow Electric Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 2.5,
      roughness: 0.1
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rotorGroup.add(coreMesh);

    // 2. 3 High-Speed Plasma Saw Blades (Angled Cones spaced 120deg)
    const bladeMat = this.materialFactory.get('plasmaRotorBlade');
    const spinningRotorMesh = new THREE.Group();

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const bladeGeo = new THREE.ConeGeometry(0.22, 1.05, 4);
      bladeGeo.rotateX(Math.PI / 2);
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);

      bladeMesh.position.set(Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0);
      bladeMesh.rotation.z = angle + Math.PI / 2;
      spinningRotorMesh.add(bladeMesh);
    }
    rotorGroup.add(spinningRotorMesh);

    // 3. Outer Protective Energy Sheath Ring
    const ringGeo = new THREE.RingGeometry(1.05, 1.12, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    rotorGroup.add(ringMesh);

    rotorGroup.position.set(x, y, relativeZ);
    this.obstacleGroup.add(rotorGroup);

    const obstacleObj = {
      x, y, relativeZ, width, height, depth,
      type: 'plasma_rotor', active: true, mesh: rotorGroup,
      spinningRotorMesh, coreMesh,
      spinSpeed
    };
    this.obstacles.push(obstacleObj);
  }

  _addWormholeVoid(laneIndex, relativeZ = 0, scale = 1.0) {
    const x = this.getLaneX(laneIndex);
    const radius = 1.25 * scale;
    const width = radius * 2.0, height = 0.2, depth = radius * 2.0;
    const y = 0.05;

    const voidGroup = new THREE.Group();
    voidGroup.name = 'CosmicWormholeVoid';

    // 1. Accretion Disk Ring (Rotating Cyan/Magenta Mesh)
    const ringGeo = new THREE.RingGeometry(0.5 * scale, 1.25 * scale, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    voidGroup.add(ringMesh);

    // 2. Abyssal Portal Core (Dark Circle)
    const coreGeo = new THREE.CircleGeometry(0.55 * scale, 16);
    const coreMat = this.materialFactory.get('wormholeVortex');
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.x = -Math.PI / 2;
    coreMesh.position.y = -0.02;
    voidGroup.add(coreMesh);

    // 3. Swirling Gravitational Particle Accretion Spec Group
    const particleGroup = new THREE.Group();
    const specMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    for (let i = 0; i < 8; i++) {
      const specAngle = (i * Math.PI * 2) / 8;
      const specRadius = (0.7 + (i % 3) * 0.15) * scale;
      const specGeo = new THREE.SphereGeometry(0.06 * scale, 6, 6);
      const specMesh = new THREE.Mesh(specGeo, specMat);
      specMesh.position.set(Math.cos(specAngle) * specRadius, Math.sin(specAngle) * specRadius, 0);
      particleGroup.add(specMesh);
    }
    particleGroup.rotation.x = Math.PI / 2;
    voidGroup.add(particleGroup);

    voidGroup.position.set(x, y, relativeZ);
    this.obstacleGroup.add(voidGroup);

    // Also mark lane as floor gap in collision system!
    this.addFloorGap([laneIndex]);

    const obstacleObj = {
      x, y, relativeZ, width, height, depth,
      type: 'wormhole_void', active: true, mesh: voidGroup,
      ringMesh, particleGroup
    };
    this.obstacles.push(obstacleObj);
  }

  _addCoinTrail(laneIndex, relativeZ = 0, count = 3) {
    const x = this.getLaneX(laneIndex);
    const spacing = 1.8;

    for (let i = 0; i < count; i++) {
      const z = relativeZ - (i * spacing);
      this._addSingleCoin(x, 1.0, z);
    }
  }

  _addSingleCoin(x, y, z) {
    const coinGroup = new THREE.Group();
    coinGroup.name = 'CyberCoin';

    // 1. Gold Metallic Coin Disc (Cylinder)
    const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
    coinGeo.rotateX(Math.PI / 2);
    const goldMat = this.materialFactory.get('cyberCoinGold');
    const coinMesh = new THREE.Mesh(coinGeo, goldMat);
    coinGroup.add(coinMesh);

    // 2. Inner Neon Cyan Emissive Core Node
    const coreGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.09, 8);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 2.0
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coinGroup.add(coreMesh);

    coinGroup.position.set(x, y, z);
    this.obstacleGroup.add(coinGroup);

    const obstacleObj = {
      x, y, relativeZ: z, width: 0.7, height: 0.7, depth: 0.7,
      type: 'coin', active: true, isCollectible: true, mesh: coinGroup,
      coinMesh
    };
    this.obstacles.push(obstacleObj);
  }

  addFloorGap(laneIndices = [0]) {
    this.hasGap = true;
    this.gapLanes = laneIndices;
  }

  reset(segmentIndex = 0, isRest = false) {
    this.segmentIndex = segmentIndex;
    this.isRestSegment = isRest;
    this.hasGap = false;
    this.gapLanes.length = 0;
    
    // Clear obstacle group meshes
    while (this.obstacleGroup.children.length > 0) {
      const child = this.obstacleGroup.children.pop();
      if (child.geometry) child.geometry.dispose();
    }
    this.obstacles.length = 0;

    this.meshGroup.position.set(0, 0, 0);
    this.meshGroup.rotation.set(0, 0, 0);
  }

  update(delta) {
    if (this.obstacles) {
      for (const obstacle of this.obstacles) {
        if (!obstacle.active) continue;

        if (obstacle.type === 'shard' && obstacle.mesh) {
          obstacle.mesh.rotation.y += delta * 3.5;
          obstacle.mesh.rotation.z += delta * 1.5;
        } else if (obstacle.type === 'moving_gate' && obstacle.mesh) {
          obstacle.phase = (obstacle.phase || 0) + delta * obstacle.oscSpeed;
          const t = (Math.sin(obstacle.phase) + 1) / 2; // 0..1
          obstacle.x = THREE.MathUtils.lerp(obstacle.minX, obstacle.maxX, t);
          obstacle.mesh.position.x = obstacle.x;
        } else if (obstacle.type === 'pulse_wall' && obstacle.mesh) {
          obstacle.phase = (obstacle.phase || 0) + delta * obstacle.frequency;
          const scaleY = 1.0 + Math.sin(obstacle.phase) * 0.25;
          obstacle.mesh.scale.set(1.0, scaleY, 1.0);
        } else if (obstacle.type === 'asteroid' && obstacle.mesh) {
          obstacle.mesh.rotation.x += delta * obstacle.rotSpeedX;
          obstacle.mesh.rotation.y += delta * obstacle.rotSpeedY;
          obstacle.mesh.rotation.z += delta * obstacle.rotSpeedZ;
        } else if (obstacle.type === 'alien_monster' && obstacle.mesh) {
          // Smooth fly-in entry animation from deep space
          if (obstacle.entryProgress < 1.0) {
            obstacle.entryProgress = Math.min(1.0, obstacle.entryProgress + delta * 2.5);
            const easeT = 1 - Math.pow(1 - obstacle.entryProgress, 3);
            obstacle.x = THREE.MathUtils.lerp(obstacle.x, obstacle.targetX, easeT);
            obstacle.mesh.position.x = obstacle.x;
          }

          // Continuous floating hover & jaws champing animation
          obstacle.hoverPhase += delta * 3.5;
          obstacle.mesh.position.y = obstacle.y + Math.sin(obstacle.hoverPhase) * 0.25;

          // Roaring jaw champing
          if (obstacle.upperJawGroup) {
            obstacle.upperJawGroup.position.y = Math.sin(obstacle.hoverPhase * 2.5) * 0.08;
          }

          // Eye pulse
          if (obstacle.leftEye && obstacle.leftEye.material) {
            const pulse = 2.0 + Math.sin(obstacle.hoverPhase * 3.0) * 0.8;
            obstacle.leftEye.material.emissiveIntensity = pulse;
            if (obstacle.rightEye && obstacle.rightEye.material) {
              obstacle.rightEye.material.emissiveIntensity = pulse;
            }
          }
        } else if (obstacle.type === 'laser_grid' && obstacle.mesh) {
          obstacle.sweepPhase = (obstacle.sweepPhase || 0) + delta * 3.0;
          
          // Laser beam intensity pulsation
          if (obstacle.sheathMesh && obstacle.sheathMesh.material) {
            obstacle.sheathMesh.material.opacity = 0.5 + Math.sin(obstacle.sweepPhase * 4.0) * 0.3;
          }

          // Vertical beam sweeping (if enabled)
          if (obstacle.isSweeping && obstacle.beamMesh && obstacle.sheathMesh) {
            const sweepY = 0.5 + (Math.sin(obstacle.sweepPhase * 1.5) + 1.0) * 0.65;
            obstacle.y = sweepY;
            obstacle.beamMesh.position.y = sweepY;
            obstacle.sheathMesh.position.y = sweepY;
          }
        } else if (obstacle.type === 'plasma_rotor' && obstacle.mesh) {
          // Continuous 360-degree high-speed plasma saw rotation
          if (obstacle.spinningRotorMesh) {
            obstacle.spinningRotorMesh.rotation.z += delta * obstacle.spinSpeed;
          }
          if (obstacle.coreMesh && obstacle.coreMesh.material) {
            obstacle.coreMesh.material.emissiveIntensity = 2.0 + Math.sin(performance.now() * 0.01) * 0.8;
          }
        } else if (obstacle.type === 'wormhole_void' && obstacle.mesh) {
          // Continuous swirling accretion rotation
          if (obstacle.ringMesh) {
            obstacle.ringMesh.rotation.z += delta * 2.5;
          }
          if (obstacle.particleGroup) {
            obstacle.particleGroup.rotation.z -= delta * 4.0;
          }
        } else if (obstacle.type === 'coin' && obstacle.mesh) {
          // Spin golden coins continuously
          obstacle.mesh.rotation.y += delta * 4.0;
        }
      }
    }
  }

  getLaneX(laneIndex) {
    const idx = Math.max(0, Math.min(4, laneIndex));
    return this.laneXPositions[idx];
  }
}
