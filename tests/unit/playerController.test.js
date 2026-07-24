import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerController } from '../../src/gameplay/PlayerController.js';
import { MaterialFactory } from '../../src/render/Materials.js';
import * as THREE from 'three';

describe('PlayerController Unit Tests', () => {
  let player;
  let scene;
  let materialFactory;

  beforeEach(() => {
    scene = new THREE.Scene();
    materialFactory = new MaterialFactory();
    player = new PlayerController(scene, materialFactory);
  });

  it('should initialize player at center lane 2 with X = 0.0 and Y = 0.5', () => {
    expect(player.currentLane).toBe(2);
    expect(player.targetLane).toBe(2);
    expect(player.currentX).toBe(0.0);
    expect(player.y).toBe(0.5);
  });

  it('should change lanes left and enforce lane 0 boundary', () => {
    player.moveLeft(); // Lane 2 -> 1
    expect(player.targetLane).toBe(1);

    player.update(0.2); // Complete lane change transition
    expect(player.currentLane).toBe(1);
    expect(player.currentX).toBe(-2.0);

    player.moveLeft(); // Lane 1 -> 0
    player.update(0.2);
    expect(player.currentLane).toBe(0);
    expect(player.currentX).toBe(-4.0);

    player.moveLeft(); // Attempt past lane 0
    player.update(0.2);
    expect(player.currentLane).toBe(0); // Clamped at boundary
  });

  it('should change lanes right and enforce lane 4 boundary', () => {
    player.moveRight(); // Lane 2 -> 3
    player.update(0.2);
    expect(player.currentLane).toBe(3);
    expect(player.currentX).toBe(2.0);

    player.moveRight(); // Lane 3 -> 4
    player.update(0.2);
    expect(player.currentLane).toBe(4);
    expect(player.currentX).toBe(4.0);

    player.moveRight(); // Attempt past lane 4
    player.update(0.2);
    expect(player.currentLane).toBe(4); // Clamped at boundary
  });

  it('should perform deterministic jump and land cleanly back on ground', () => {
    expect(player.isGrounded).toBe(true);
    player.jump();
    expect(player.isGrounded).toBe(false);

    // Update jump apex over 10 frames (~0.16s)
    for (let i = 0; i < 10; i++) player.update(0.016);
    expect(player.y).toBeGreaterThan(0.5);

    // Update through landing over 40 more frames (~0.64s)
    for (let i = 0; i < 40; i++) player.update(0.016);
    expect(player.y).toBe(0.5);
    expect(player.isGrounded).toBe(true);
  });

  it('should queue at most one extra lane move during fast swipes', () => {
    player.moveRight(); // Initiate 2 -> 3
    player.moveRight(); // Queue 3 -> 4
    player.moveRight(); // Ignored (max 1 queued)

    expect(player.targetLane).toBe(3);
    expect(player.queuedMove).toBe(1);

    player.update(0.2); // Finishes 2 -> 3, picks up queued move 3 -> 4
    expect(player.targetLane).toBe(4);

    player.update(0.2); // Finishes 3 -> 4
    expect(player.currentLane).toBe(4);
  });

  it('should produce identical movement outcomes at 30 Hz vs 60 Hz vs 120 Hz', () => {
    const player30Hz = new PlayerController(scene, materialFactory);
    const player120Hz = new PlayerController(scene, materialFactory);

    player30Hz.moveRight();
    player120Hz.moveRight();

    // 30 Hz: 5 steps of 1/30s = 0.166s total
    for (let i = 0; i < 5; i++) player30Hz.update(1 / 30);

    // 120 Hz: 20 steps of 1/120s = 0.166s total
    for (let i = 0; i < 20; i++) player120Hz.update(1 / 120);

    expect(player30Hz.currentLane).toBe(3);
    expect(player120Hz.currentLane).toBe(3);
    expect(player30Hz.currentX).toBeCloseTo(player120Hz.currentX, 2);
  });
});
