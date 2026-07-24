import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../../src/services/AudioManager.js';
import { SceneFactory } from '../../src/render/SceneFactory.js';

describe('AudioManager & Camera Language Unit Tests', () => {
  let audio;
  let sceneFactory;

  beforeEach(() => {
    audio = new AudioManager();
    sceneFactory = new SceneFactory();
  });

  it('should initialize AudioManager and support window.setAudioMuted bridge', () => {
    expect(window.setAudioMuted).toBeDefined();
    expect(audio.muted).toBe(false);

    window.setAudioMuted(true);
    expect(audio.muted).toBe(true);

    window.setAudioMuted(false);
    expect(audio.muted).toBe(false);
  });

  it('should scale camera FOV smoothly based on runner speed', () => {
    const initialFov = sceneFactory.camera.fov;
    expect(initialFov).toBe(70);

    // Simulate update at speed 30 m/s (Mastery tier)
    sceneFactory.tunnelManager.difficultyDirector.setTierDirectly(5);
    sceneFactory.update(1.0, 1.0);

    expect(sceneFactory.camera.fov).toBeGreaterThan(70);
    expect(sceneFactory.camera.fov).toBeLessThanOrEqual(78);
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
