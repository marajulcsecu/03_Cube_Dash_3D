/**
 * Interactive Step-by-Step Tutorial Manager
 * Manages 3 guided micro-sequences (Lane Shift, Jump, Shard Pickup) with slow-mo time control,
 * animated key hints, action validation, and instant skip button handling.
 */

export const TUTORIAL_STEPS = [
  {
    id: 'LANE_SHIFT',
    title: 'STEP 1: SHIFT LANES',
    text: 'Move Left or Right to change lanes',
    keys: ['A', 'D', '←', '→'],
    gestureHint: 'SWIPE HORIZONTALLY OR PRESS A / D'
  },
  {
    id: 'JUMP',
    title: 'STEP 2: LEAP BARRIER',
    text: 'Jump over the low barrier ahead',
    keys: ['SPACE', 'W', '↑'],
    gestureHint: 'SWIPE UP OR PRESS SPACE / W'
  },
  {
    id: 'SHARD',
    title: 'STEP 3: COLLECT SHARDS',
    text: 'Collect Cyan Energy Shard for Score & Multiplier',
    keys: [],
    gestureHint: 'RUN INTO THE GLOWING SHARD'
  }
];

export class TutorialManager {
  constructor() {
    this.completed = this._loadTutorialState();
    this.currentStepIndex = 0;
    this.active = false;
    this.feedbackText = null;
    this.feedbackTimer = 0;
  }

  startTutorial() {
    this.active = true;
    this.currentStepIndex = 0;
    this.feedbackText = null;
    this.feedbackTimer = 0;
  }

  completeTutorial() {
    this.active = false;
    this.completed = true;
    this._saveTutorialState(true);
  }

  getCurrentStep() {
    if (!this.active || this.currentStepIndex >= TUTORIAL_STEPS.length) {
      return null;
    }
    return TUTORIAL_STEPS[this.currentStepIndex];
  }

  getCurrentStepPrompt() {
    return this.getCurrentStep();
  }

  advanceStep(feedbackMsg = '✓ PERFECT!') {
    this.feedbackText = feedbackMsg;
    this.feedbackTimer = 1.0; // Show feedback badge for 1.0s

    this.currentStepIndex++;
    if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
      this.completeTutorial();
      return true; // Finished all steps!
    }
    return false;
  }

  update(delta) {
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= delta;
      if (this.feedbackTimer <= 0) {
        this.feedbackText = null;
      }
    }
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
