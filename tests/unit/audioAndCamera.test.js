import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../../src/services/AudioManager.js';
import { SceneFactory } from '../../src/render/SceneFactory.js';

describe('AudioManager & Camera Language Unit Tests', () => {
  let audio;
  let sceneFactory;

  beforeEach(() => {
    audio = new AudioManager();
    sceneFactory = new SceneFactory();
    // Default test aspect ratio to 16:9 landscape desktop
    sceneFactory.camera.aspect = 16 / 9;
  });

  it('should initialize AudioManager and support window.setAudioMuted bridge', () => {
    expect(window.setAudioMuted).toBeDefined();
    expect(audio.muted).toBe(false);

    window.setAudioMuted(true);
    expect(audio.muted).toBe(true);

    window.setAudioMuted(false);
    expect(audio.muted).toBe(false);
  });

  it('should scale camera FOV smoothly based on runner speed in landscape mode', () => {
    const initialFov = sceneFactory.camera.fov;
    expect(initialFov).toBe(70);

    // Simulate update at speed 30 m/s (Mastery tier)
    sceneFactory.tunnelManager.difficultyDirector.setTierDirectly(5);
    sceneFactory.update(1.0, 1.0);

    expect(sceneFactory.camera.fov).toBeGreaterThan(70);
    expect(sceneFactory.camera.fov).toBeLessThanOrEqual(78);
  });

  it('should maintain punchy prominent camera distance in mobile portrait viewports (400x840)', () => {
    // Mobile portrait aspect ratio: 400 / 840 = 0.476
    sceneFactory.camera.aspect = 400 / 840;
    sceneFactory.update(1.0, 1.0);

    // Camera Z is kept close (5.2 - 6.2) so bike remains large and prominent
    expect(sceneFactory.camera.position.z).toBeGreaterThanOrEqual(5.0);
    expect(sceneFactory.camera.position.z).toBeLessThanOrEqual(6.5);
  });

  it('should support cycling between 3RD (Chase) and 1ST (Alien Eye Cockpit) camera modes', () => {
    expect(sceneFactory.cameraMode).toBe('3RD');

    // Cycle to 1ST Person (Cockpit Alien Eye View)
    expect(sceneFactory.cycleCameraMode()).toBe('1ST');

    sceneFactory.update(1.0, 1.0);
    // Camera moves inside helmet cockpit at alien eye level
    expect(sceneFactory.camera.position.z).toBeLessThan(3.0);

    // Cycle back to 3RD Person Chase View
    expect(sceneFactory.cycleCameraMode()).toBe('3RD');
  });

  it('should trigger and decay camera shake on impact', () => {
    sceneFactory.triggerCameraShake(0.4);
    expect(sceneFactory.cameraShakeIntensity).toBe(0.4);

    sceneFactory.update(0.5, 0.5);
    expect(sceneFactory.cameraShakeIntensity).toBeLessThan(0.4);
  });

  it('should respect reduced motion mode and disable camera shake / FOV shifts', () => {
    sceneFactory.reducedMotion = true;
    sceneFactory.triggerCameraShake(0.5);
    expect(sceneFactory.cameraShakeIntensity).toBe(0); // Blocked by reduced motion!

    sceneFactory.update(1.0, 1.0);
    expect(sceneFactory.camera.fov).toBe(70);
  });
});
