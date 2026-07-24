/**
 * Main Game Controller and Engine Lifecycle Manager
 */

import { ConfigManager, STATES } from './Config.js';
import { StateMachine } from './StateMachine.js';
import { Clock } from './Clock.js';
import { logger } from '../services/Logger.js';
import { DebugOverlay } from '../ui/DebugOverlay.js';
import { ResponsiveRenderer } from '../render/ResponsiveRenderer.js';
import { InputManager } from '../gameplay/InputManager.js';
import { CollisionSystem } from '../gameplay/CollisionSystem.js';
import { ScoreSystem } from '../gameplay/ScoreSystem.js';
import { MissionManager } from '../gameplay/MissionManager.js';
import { TutorialManager } from '../gameplay/TutorialManager.js';
import { audioManager } from '../services/AudioManager.js';
import { gameBridge } from '../services/GameBridgeAdapter.js';

export class Game {
  constructor(customConfig = {}) {
    this.initialized = false;
    this.running = false;
    this.configManager = new ConfigManager(customConfig);
    this.stateMachine = new StateMachine(STATES.BOOT);
    this.clock = new Clock();
    this.renderer = null;
    this.inputManager = null;
    this.collisionSystem = new CollisionSystem();
    this.scoreSystem = new ScoreSystem();
    this.missionManager = new MissionManager();
    this.tutorialManager = new TutorialManager();
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

      this.inputManager = new InputManager(this.containerEl);
      this._setupInputListeners();

      this.debugOverlay = new DebugOverlay(this.containerEl, this);
      
      if (this.configManager.get('debug')) {
        this.debugOverlay.show();
      }

      this.initialized = true;
      logger.info('Game core, renderer, input manager, and collision system successfully initialized.');

      // Auto transition to MENU from BOOT after initialization
      this.stateMachine.transitionTo(STATES.MENU);

    } catch (err) {
      this.triggerFatalError(`Initialization failed: ${err.message}`);
    }
  }

  startRun(forceTutorial = false) {
    if (!this.renderer || !this.renderer.sceneFactory) return;

    this.shardsCollected = 0;
    this.scoreSystem.reset();

    // Reset world and player (preserve manually selected debug tier if any)
    if (this.renderer.sceneFactory.tunnelManager) {
      const hasManualTier = this.renderer.sceneFactory.tunnelManager.manualTierOverride !== null;
      this.renderer.sceneFactory.tunnelManager.initWorld(hasManualTier);
    }
    if (this.renderer.sceneFactory.playerController) {
      this.renderer.sceneFactory.playerController.reset();
    }

    if (forceTutorial || !this.tutorialManager.completed) {
      this.tutorialManager.startTutorial();
      this.stateMachine.transitionTo(STATES.TUTORIAL);
    } else {
      gameBridge.onRunStart(1);
      this.stateMachine.transitionTo(STATES.RUNNING);
    }
  }

  _setupInputListeners() {
    if (!this.inputManager) return;

    this.inputManager.onAction((action, payload) => {
      const state = this.stateMachine.getState();
      if (state !== STATES.RUNNING && state !== STATES.TUTORIAL) return;

      if (!this.renderer || !this.renderer.sceneFactory || !this.renderer.sceneFactory.playerController) return;

      const player = this.renderer.sceneFactory.playerController;

      switch (action) {
        case 'MOVE_LEFT':
          player.moveLeft();
          this._checkTutorialAdvance('LANE_SHIFT');
          break;
        case 'MOVE_RIGHT':
          player.moveRight();
          this._checkTutorialAdvance('LANE_SHIFT');
          break;
        case 'JUMP':
          if (player.jump()) {
            audioManager.playJump();
            this._checkTutorialAdvance('JUMP');
          }
          break;
      }
    });
  }

  _checkTutorialAdvance(actionType) {
    if (this.stateMachine.getState() !== STATES.TUTORIAL) return;

    const currentStep = this.tutorialManager.getCurrentStep();
    if (currentStep && currentStep.id === actionType) {
      const feedbackMsg = actionType === 'LANE_SHIFT' ? '✓ EXCELLENT LANE SHIFT!' : actionType === 'JUMP' ? '✓ PERFECT JUMP!' : '✓ SHARD COLLECTED!';
      const finished = this.tutorialManager.advanceStep(feedbackMsg);
      this._updateTutorialPrompt();

      if (finished) {
        setTimeout(() => {
          if (this.stateMachine.getState() === STATES.TUTORIAL) {
            this.stateMachine.transitionTo(STATES.RUNNING);
          }
        }, 800);
      }
    }
  }

  _updateTutorialPrompt() {
    const step = this.tutorialManager.getCurrentStep();
    const badgeEl = document.getElementById('tutorial-badge');
    const titleEl = document.getElementById('tutorial-title');
    const keysEl = document.getElementById('tutorial-keys');
    const hintEl = document.getElementById('tutorial-hint');
    const feedbackEl = document.getElementById('tutorial-feedback');

    if (feedbackEl) {
      if (this.tutorialManager.feedbackText) {
        feedbackEl.textContent = this.tutorialManager.feedbackText;
        feedbackEl.style.display = 'block';
      } else {
        feedbackEl.style.display = 'none';
      }
    }

    if (step) {
      if (badgeEl) badgeEl.textContent = step.title;
      if (titleEl) titleEl.textContent = step.text;
      if (hintEl) hintEl.textContent = step.gestureHint;
      if (keysEl) {
        keysEl.innerHTML = step.keys.map(k => `<span class="key-badge">${k}</span>`).join('');
      }
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

    // Active gameplay collision & scoring check (RUNNING or TUTORIAL)
    const currentState = this.stateMachine.getState();
    if (currentState === STATES.TUTORIAL) {
      this.tutorialManager.update(delta);
      this._updateTutorialPrompt();
    }

    if (currentState === STATES.RUNNING || currentState === STATES.TUTORIAL) {
      if (this.renderer && this.renderer.sceneFactory) {
        const player = this.renderer.sceneFactory.playerController;
        const tunnelManager = this.renderer.sceneFactory.tunnelManager;

        if (player && tunnelManager) {
          // Update real-time distance score
          const distanceMeters = tunnelManager.difficultyDirector.distanceCovered;
          this.scoreSystem.updateDistance(distanceMeters);

          // Update mission progress
          this.missionManager.updateProgress({
            shards: this.scoreSystem.shardsCount,
            distance: Math.floor(distanceMeters),
            multiplier: this.scoreSystem.multiplier
          });

          // Update HUD DOM Elements
          this._updateHUD();

          const hitResult = this.collisionSystem.checkCollisions(player, tunnelManager.activeSegments);
          
          if (hitResult && hitResult.hit) {
            if (hitResult.type === 'shard') {
              this.scoreSystem.collectShard();
              audioManager.playShard();
              this._checkTutorialAdvance('SHARD');
              logger.info(`Collected Energy Shard! Total: ${this.scoreSystem.shardsCount}`);
            } else if (currentState === STATES.RUNNING) {
              // Terminal collision (wall or gap)
              audioManager.playCollision();
              this.renderer.sceneFactory.triggerCameraShake(0.4);
              logger.info(`Terminal Collision: ${hitResult.type}`);
              this.stateMachine.transitionTo(STATES.GAME_OVER, {
                reason: hitResult.type === 'gap' ? 'Floor Gap Fall' : 'Obstacle Impact'
              });
            } else {
              // Safe non-terminal collision during tutorial
              audioManager.playCollision();
              player.reset();
            }
          }
        }
      }
    }
  }

  _updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    const multEl = document.getElementById('hud-multiplier');
    const shardsEl = document.getElementById('hud-shards');

    if (scoreEl) scoreEl.textContent = this.scoreSystem.score.toLocaleString();
    if (multEl) multEl.textContent = `${this.scoreSystem.multiplier}x`;
    if (shardsEl) shardsEl.textContent = this.scoreSystem.shardsCount.toString();
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
      this._updateUIState('hud-shell', false);
      this._updateUIState('gameover-shell', false);
      this.clock.pause();
    });

    this.stateMachine.onLeave(STATES.MENU, () => {
      this._updateUIState('menu-shell', false);
    });

    this.stateMachine.onEnter(STATES.TUTORIAL, () => {
      this._updateUIState('menu-shell', false);
      this._updateUIState('hud-shell', true);
      this._updateUIState('tutorial-shell', true);
      this._updateUIState('gameover-shell', false);
      this.clock.resume();
      this._updateTutorialPrompt();
    });

    this.stateMachine.onLeave(STATES.TUTORIAL, () => {
      this._updateUIState('tutorial-shell', false);
    });

    this.stateMachine.onEnter(STATES.RUNNING, () => {
      this._updateUIState('menu-shell', false);
      this._updateUIState('pause-shell', false);
      this._updateUIState('hud-shell', true);
      this._updateUIState('tutorial-shell', false);
      this._updateUIState('gameover-shell', false);
      this.clock.resume();
    });

    this.stateMachine.onLeave(STATES.RUNNING, () => {
      this._updateUIState('hud-shell', false);
    });

    this.stateMachine.onEnter(STATES.PAUSED, () => {
      this.clock.pause();
      this._updateUIState('pause-shell', true);
    });

    this.stateMachine.onLeave(STATES.PAUSED, () => {
      this._updateUIState('pause-shell', false);
    });

    this.stateMachine.onEnter(STATES.GAME_OVER, (prev, payload) => {
      this.clock.pause();
      this._updateUIState('hud-shell', false);
      this._updateUIState('gameover-shell', true);

      // Report run completion payload to MegaGameBox host bridge
      gameBridge.onRunEnd(this.scoreSystem.score, 1, 'game_over');

      const reasonEl = document.getElementById('gameover-reason');
      if (reasonEl) {
        reasonEl.textContent = payload.reason || 'Obstacle Impact';
      }

      // Populate Stats Breakdown
      const goScore = document.getElementById('go-score');
      const goHigh = document.getElementById('go-highscore');
      const goDist = document.getElementById('go-distance');
      const goShards = document.getElementById('go-shards');
      const goMissions = document.getElementById('go-missions');

      const distance = this.renderer?.sceneFactory?.tunnelManager?.difficultyDirector?.distanceCovered || 0;

      if (goScore) goScore.textContent = this.scoreSystem.score.toLocaleString();
      if (goHigh) goHigh.textContent = this.scoreSystem.highScore.toLocaleString();
      if (goDist) goDist.textContent = `${Math.floor(distance)}m`;
      if (goShards) goShards.textContent = this.scoreSystem.shardsCount.toString();

      if (goMissions) {
        goMissions.innerHTML = this.missionManager.missions.map(m => `
          <div class="mission-card ${m.completed ? 'done' : ''}">
            <span>${m.title}</span>
            <span>${m.completed ? '✓ DONE' : `${m.progress}/${m.target}`}</span>
          </div>
        `).join('');
      }
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
