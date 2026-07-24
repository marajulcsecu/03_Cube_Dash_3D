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
        }
      }
    }
  }

  getLaneX(laneIndex) {
    const idx = Math.max(0, Math.min(4, laneIndex));
    return this.laneXPositions[idx];
  }
}
