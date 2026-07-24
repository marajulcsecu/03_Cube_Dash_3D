/**
 * First-Run Protected Interactive Tutorial Manager
 * Guides new players through 3 interactive micro-sequences (Lane Shift, Jump, Shard Pickup).
 * Prevents unfair death during tutorial and persists completion state in localStorage.
 */

export const TUTORIAL_STEPS = [
  { id: 'LANE_SHIFT', text: 'SWIPE LEFT / RIGHT OR PRESS A / D TO SHIFT LANES', targetLane: -2 },
  { id: 'JUMP', text: 'SWIPE UP OR PRESS SPACE / W TO LEAP OVER BARRIERS', targetJump: true },
  { id: 'SHARD', text: 'COLLECT CYAN ENERGY SHARDS FOR SCORE BOOSTS', targetShard: true }
];

export class TutorialManager {
  constructor() {
    this.completed = this._loadTutorialState();
    this.currentStepIndex = 0;
    this.active = false;
  }

  startTutorial() {
    this.active = true;
    this.currentStepIndex = 0;
  }

  completeTutorial() {
    this.active = false;
    this.completed = true;
    this._saveTutorialState(true);
  }

  getCurrentStepPrompt() {
    if (!this.active || this.currentStepIndex >= TUTORIAL_STEPS.length) {
      return null;
    }
    return TUTORIAL_STEPS[this.currentStepIndex];
  }

  advanceStep() {
    this.currentStepIndex++;
    if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
      this.completeTutorial();
      return true; // Complete!
    }
    return false;
  }

  _loadTutorialState() {
    try {
      return localStorage.getItem('cube_dash_3d_tutorial_done') === 'true';
    } catch (e) {
      return false;
    }
  }

  _saveTutorialState(val) {
    try {
      localStorage.setItem('cube_dash_3d_tutorial_done', val ? 'true' : 'false');
    } catch (e) {
      // Ignored
    }
  }
}
