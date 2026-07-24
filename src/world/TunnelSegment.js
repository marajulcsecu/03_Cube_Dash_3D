/**
 * Authoritative Tunnel Segment Representation
 * Encapsulates segment geometry, 5-lane coordinates, obstacles, and floor gaps.
 */

import * as THREE from 'three';

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
        if (obstacle.type === 'shard' && obstacle.active && obstacle.mesh) {
          obstacle.mesh.rotation.y += delta * 3.5;
          obstacle.mesh.rotation.z += delta * 1.5;
        }
      }
    }
  }

  getLaneX(laneIndex) {
    const idx = Math.max(0, Math.min(4, laneIndex));
    return this.laneXPositions[idx];
  }
}
