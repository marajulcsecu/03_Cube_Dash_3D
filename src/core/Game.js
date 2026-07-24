/**
 * Main Game Controller and Engine Lifecycle Manager
 */

import { ConfigManager, STATES } from './Config.js';
import { StateMachine } from './StateMachine.js';
import { Clock } from './Clock.js';
import { logger } from '../services/Logger.js';
import { DebugOverlay } from '../ui/DebugOverlay.js';
import { ResponsiveRenderer } from '../render/ResponsiveRenderer.js';

export class Game {
  constructor(customConfig = {}) {
    this.initialized = false;
    this.running = false;
    this.configManager = new ConfigManager(customConfig);
    this.stateMachine = new StateMachine(STATES.BOOT);
    this.clock = new Clock();
    this.renderer = null;
    this.debugOverlay = null;
    this.animationFrameId = null;

    this._setupStateHandlers();
    this._setupLifecycleHooks();
  }

  init(containerEl) {
    if (this.initialized) {
      logger.warn('Game already initialized, skipping duplicate init call.');
      return;
    }

    this.containerEl = containerEl || document.getElementById('app-container');
    if (!this.containerEl) {
      this.triggerFatalError('App container element missing during init.');
      return;
    }

    const canvasEl = document.getElementById('game-canvas');
    if (!canvasEl) {
      this.triggerFatalError('Game canvas element missing during init.');
      return;
    }

    try {
      const graphicsConfig = this.configManager.get('graphics');
      this.renderer = new ResponsiveRenderer(canvasEl, graphicsConfig.preset, graphicsConfig.dprCap);

      this.debugOverlay = new DebugOverlay(this.containerEl, this);
      
      if (this.configManager.get('debug')) {
        this.debugOverlay.show();
      }

      this.initialized = true;
      logger.info('Game core and renderer successfully initialized.');

      // Auto transition to MENU from BOOT after initialization
      this.stateMachine.transitionTo(STATES.MENU);

    } catch (err) {
      this.triggerFatalError(`Initialization failed: ${err.message}`);
    }
  }

  setQualityPreset(preset) {
    if (this.renderer) {
      this.renderer.updateQualityPreset(preset);
      logger.info(`Graphics quality preset set to: ${preset}`);
    }
  }

  startLoop() {
    if (this.running) return;
    this.running = true;
    this.clock.start();

    const loop = (time) => {
      if (!this.running) return;

      try {
        const delta = this.clock.update(time);
        this.update(delta);
        this.render(delta);
      } catch (err) {
        logger.error(`Error in main game loop: ${err.message}`);
        this.triggerFatalError(`Runtime error: ${err.message}`);
        return;
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopLoop() {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  update(delta) {
    if (this.debugOverlay) {
      this.debugOverlay.update(this.clock, this.stateMachine);
    }
  }

  render(delta = 0) {
    if (this.renderer) {
      this.renderer.render(delta, this.clock.elapsedSeconds);
    }
  }

  _setupStateHandlers() {
    this.stateMachine.onEnter(STATES.BOOT, () => {
      this._updateUIState('boot-shell', true);
    });

    this.stateMachine.onLeave(STATES.BOOT, () => {
      this._updateUIState('boot-shell', false);
    });

    this.stateMachine.onEnter(STATES.MENU, () => {
      this._updateUIState('menu-shell', true);
      this.clock.pause();
    });

    this.stateMachine.onEnter(STATES.RUNNING, () => {
      this.clock.resume();
    });

    this.stateMachine.onEnter(STATES.PAUSED, () => {
      this.clock.pause();
    });

    this.stateMachine.onEnter(STATES.FATAL_ERROR, (prev, payload) => {
      this.stopLoop();
      this.clock.pause();
      this._showFatalErrorUI(payload.message || 'System Anomaly Encountered.');
    });
  }

  _setupLifecycleHooks() {
    // Safely handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logger.info('Tab hidden: pausing active simulation loop.');
        if (this.stateMachine.getState() === STATES.RUNNING) {
          this.stateMachine.transitionTo(STATES.PAUSED, { reason: 'visibilitychange' });
        }
      }
    });

    // Safely handle unload / page hide
    window.addEventListener('pagehide', () => {
      logger.info('Pagehide triggered: tearing down active loops.');
      this.stopLoop();
    });
  }

  _updateUIState(elementId, visible) {
    const el = document.getElementById(elementId);
    if (el) {
      el.style.display = visible ? 'flex' : 'none';
    }
  }

  triggerFatalError(message) {
    logger.error(`FATAL ERROR TRIGGERED: ${message}`);
    if (this.stateMachine.canTransitionTo(STATES.FATAL_ERROR)) {
      this.stateMachine.transitionTo(STATES.FATAL_ERROR, { message });
    } else {
      this._showFatalErrorUI(message);
    }
  }

  _showFatalErrorUI(msg) {
    const bootShell = document.getElementById('boot-shell');
    const menuShell = document.getElementById('menu-shell');
    const errorShell = document.getElementById('error-shell');
    const errorMsg = document.getElementById('error-message');

    if (bootShell) bootShell.style.display = 'none';
    if (menuShell) menuShell.style.display = 'none';
    if (errorShell) errorShell.style.display = 'flex';
    if (errorMsg) errorMsg.textContent = msg;
  }
}
