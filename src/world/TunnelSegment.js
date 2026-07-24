/**
 * Authoritative Tunnel Segment Representation
 * Encapsulates segment geometry, 5-lane coordinates, and hazard anchor points.
 */

import * as THREE from 'three';

export class TunnelSegment {
  constructor(materialFactory) {
    this.length = 10;
    this.segmentIndex = 0;
    this.isRestSegment = false;
    this.hazardAnchors = new Array(5).fill(null); // 5 Lanes
    this.laneXPositions = [-4.0, -2.0, 0.0, 2.0, 4.0];

    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'TunnelSegment';

    this.wallMesh = null;
    this.gridMesh = null;
    this.laneLineGroup = null;

    this._buildSegmentMesh(materialFactory);
  }

  _buildSegmentMesh(materialFactory) {
    // Octagonal Tunnel Outer Ring
    const geo = new THREE.CylinderGeometry(5.5, 5.5, this.length, 8, 1, true);
    
    this.wallMesh = new THREE.Mesh(geo, materialFactory.get('tunnelWall'));
    this.wallMesh.rotation.x = Math.PI / 2;
    this.meshGroup.add(this.wallMesh);

    // Neon Wireframe Grid
    this.gridMesh = new THREE.Mesh(geo, materialFactory.get('cyanNeonGrid'));
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

  reset(segmentIndex = 0, isRest = false) {
    this.segmentIndex = segmentIndex;
    this.isRestSegment = isRest;
    this.hazardAnchors.fill(null);
    this.meshGroup.position.set(0, 0, 0);
    this.meshGroup.rotation.set(0, 0, 0);
  }

  getLaneX(laneIndex) {
    const idx = Math.max(0, Math.min(4, laneIndex));
    return this.laneXPositions[idx];
  }

  setDebugColor(isRecycled) {
    if (this.gridMesh && this.gridMesh.material) {
      this.gridMesh.material.color.setHex(isRecycled ? 0x00ff66 : 0x00f3ff);
    }
  }
}
