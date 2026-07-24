import { describe, it, expect, beforeEach } from 'vitest';
import { TutorialManager } from '../../src/gameplay/TutorialManager.js';

describe('TutorialManager Unit Tests', () => {
  let tutorialManager;

  beforeEach(() => {
    localStorage.clear();
    tutorialManager = new TutorialManager();
  });

  it('should initialize with completed = false on first run', () => {
    expect(tutorialManager.completed).toBe(false);
  });

  it('should progress through 3 tutorial steps and complete', () => {
    tutorialManager.startTutorial();

    // Step 1: LANE_SHIFT
    expect(tutorialManager.getCurrentStepPrompt().id).toBe('LANE_SHIFT');
    let finished = tutorialManager.advanceStep();
    expect(finished).toBe(false);

    // Step 2: JUMP
    expect(tutorialManager.getCurrentStepPrompt().id).toBe('JUMP');
    finished = tutorialManager.advanceStep();
    expect(finished).toBe(false);

    // Step 3: SHARD
    expect(tutorialManager.getCurrentStepPrompt().id).toBe('SHARD');
    finished = tutorialManager.advanceStep();
    expect(finished).toBe(true); // Completed!

    expect(tutorialManager.completed).toBe(true);
    expect(localStorage.getItem('cube_dash_3d_tutorial_done')).toBe('true');
  });

  it('should allow skipping tutorial and persisting state', () => {
    tutorialManager.startTutorial();
    tutorialManager.completeTutorial();

    expect(tutorialManager.completed).toBe(true);
    expect(localStorage.getItem('cube_dash_3d_tutorial_done')).toBe('true');

    // Re-instantiate manager
    const newManager = new TutorialManager();
    expect(newManager.completed).toBe(true);
  });
});
