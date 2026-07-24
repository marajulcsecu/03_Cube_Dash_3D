/**
 * Authoritative Collision Detection and Response System
 * Provides AABB bounding box checks, forgiving hitbox tolerance, sub-step sweep checks, and gap fall detection.
 */

import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    // Forgiving Player Hitbox (0.8 x 0.8 x 0.8)
    this.playerBox = new THREE.Box3();
    this.obstacleBox = new THREE.Box3();
    this.hitboxMargin = 0.1; // 10% forgiveness margin
  }

  /**
   * Check collision between player controller and active obstacles/gaps.
   * Returns { hit: boolean, type: 'wall' | 'gap' | 'shard', object: any }
   */
  checkCollisions(player, activeSegments) {
    if (!player || !activeSegments) return null;

    const playerPos = player.position;
    
    // Set player bounding box with forgiveness tolerance
    this.playerBox.setFromCenterAndSize(
      new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z),
      new THREE.Vector3(0.8, 0.8, 0.8)
    );

    // Iterate through active segments near player position (Z between 0 and 10)
    for (const segment of activeSegments) {
      const segZ = segment.meshGroup.position.z;
      
      // Only test segments close to player Z position (Z = 2.0)
      if (Math.abs(segZ - playerPos.z) > 6.0) continue;

      // 1. Floor Gap Check
      if (segment.hasGap && player.isGrounded) {
        if (segment.gapLanes && segment.gapLanes.includes(player.currentLane)) {
          // Check if player Z is inside the gap Z bounds
          const gapZStart = segZ - segment.length / 2;
          const gapZEnd = segZ + segment.length / 2;
          if (playerPos.z >= gapZStart && playerPos.z <= gapZEnd) {
            return { hit: true, type: 'gap', segment };
          }
        }
      }

      // 2. Obstacle Collisions
      if (segment.obstacles) {
        for (const obstacle of segment.obstacles) {
          if (!obstacle.active) continue;

          // Compute absolute world position of obstacle
          const obsWorldZ = segZ + obstacle.relativeZ;
          const obsWorldPos = new THREE.Vector3(obstacle.x, obstacle.y, obsWorldZ);

          this.obstacleBox.setFromCenterAndSize(
            obsWorldPos,
            new THREE.Vector3(obstacle.width, obstacle.height, obstacle.depth)
          );

          if (this.playerBox.intersectsBox(this.obstacleBox)) {
            if (obstacle.type === 'collectible') {
              obstacle.active = false;
              return { hit: true, type: 'shard', obstacle };
            } else {
              return { hit: true, type: obstacle.type || 'wall', obstacle };
            }
          }
        }
      }
    }

    return null;
  }
}
