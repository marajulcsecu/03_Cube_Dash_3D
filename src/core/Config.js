/**
 * Configuration & Constants for Cube Dash 3D
 */

export const STATES = {
  BOOT: 'BOOT',
  MENU: 'MENU',
  TUTORIAL: 'TUTORIAL',
  COUNTDOWN: 'COUNTDOWN',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  FATAL_ERROR: 'FATAL_ERROR'
};

export const DEFAULT_CONFIG = {
  version: '1.0.0',
  lanes: 5,
  tunnelWidth: 10.0,
  speed: {
    initial: 20.0,
    max: 50.0,
    acceleration: 0.2
  },
  player: {
    jumpDuration: 0.6,
    jumpHeight: 2.5,
    coyoteTime: 0.1,
    laneChangeDuration: 0.15
  },
  graphics: {
    dprCap: 2.0,
    preset: 'high' // 'low' | 'medium' | 'high'
  },
  audio: {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muted: false
  },
  debug: false
};

export class ConfigManager {
  constructor(initialConfig = {}) {
    this.config = this.validate(initialConfig);
  }

  validate(customConfig) {
    const merged = { ...DEFAULT_CONFIG, ...customConfig };

    if (typeof merged.lanes !== 'number' || merged.lanes < 3 || merged.lanes > 7) {
      throw new Error(`Invalid Config: lanes must be a number between 3 and 7. Got ${merged.lanes}`);
    }

    if (typeof merged.tunnelWidth !== 'number' || merged.tunnelWidth <= 0) {
      throw new Error(`Invalid Config: tunnelWidth must be positive number. Got ${merged.tunnelWidth}`);
    }

    if (merged.speed.initial <= 0 || merged.speed.max < merged.speed.initial) {
      throw new Error(`Invalid Config: speed settings out of range.`);
    }

    return Object.freeze(merged);
  }

  get(key) {
    return this.config[key];
  }
}
