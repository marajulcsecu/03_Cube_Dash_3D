/**
 * Cube Dash 3D - Entry Point
 * Bootstraps Game Architecture, UI Navigation & State Machine.
 */

import { Game } from './core/Game.js';
import { logger } from './services/Logger.js';
import { audioManager } from './services/AudioManager.js';

let gameInstance = null;

window.addEventListener('DOMContentLoaded', () => {
  logger.info('DOM loaded. Initializing Game Core Architecture...');

  try {
    gameInstance = new Game({ debug: true });
    gameInstance.init(document.getElementById('app-container'));
    gameInstance.startLoop();

    // Wire up Main Menu Buttons
    document.getElementById('menu-play-btn')?.addEventListener('click', () => {
      gameInstance?.startRun();
    });

    document.getElementById('menu-help-btn')?.addEventListener('click', () => {
      showModal('help-shell', true);
    });

    document.getElementById('help-close-btn')?.addEventListener('click', () => {
      showModal('help-shell', false);
    });

    document.getElementById('help-tutorial-btn')?.addEventListener('click', () => {
      showModal('help-shell', false);
      gameInstance?.startRun(true); // Force tutorial restart!
    });

    document.getElementById('tutorial-skip-btn')?.addEventListener('click', () => {
      if (gameInstance) {
        gameInstance.tutorialManager.completeTutorial();
        gameInstance.stateMachine.transitionTo('RUNNING');
      }
    });

    document.getElementById('menu-settings-btn')?.addEventListener('click', () => {
      showModal('settings-shell', true);
    });

    document.getElementById('pause-settings-btn')?.addEventListener('click', () => {
      showModal('settings-shell', true);
    });

    document.getElementById('settings-close-btn')?.addEventListener('click', () => {
      showModal('settings-shell', false);
    });

    document.getElementById('menu-debug-btn')?.addEventListener('click', () => {
      gameInstance?.debugOverlay?.toggle();
    });

    // Wire up HUD & Pause Controls
    document.getElementById('hud-pause-btn')?.addEventListener('click', () => {
      if (gameInstance?.stateMachine?.getState() === 'RUNNING') {
        gameInstance.stateMachine.transitionTo('PAUSED');
      }
    });

    document.getElementById('pause-resume-btn')?.addEventListener('click', () => {
      if (gameInstance?.stateMachine?.getState() === 'PAUSED') {
        gameInstance.stateMachine.transitionTo('RUNNING');
      }
    });

    document.getElementById('pause-restart-btn')?.addEventListener('click', () => {
      gameInstance?.startRun();
    });

    document.getElementById('pause-menu-btn')?.addEventListener('click', () => {
      gameInstance?.stateMachine?.transitionTo('MENU');
    });

    // Wire up Game Over Buttons
    document.getElementById('gameover-replay-btn')?.addEventListener('click', () => {
      gameInstance?.startRun();
    });

    document.getElementById('gameover-menu-btn')?.addEventListener('click', () => {
      gameInstance?.stateMachine?.transitionTo('MENU');
    });

    // Wire up Settings Preferences Toggles
    const audioBtn = document.getElementById('setting-audio-btn');
    audioBtn?.addEventListener('click', () => {
      audioManager.muted = !audioManager.muted;
      audioBtn.textContent = audioManager.muted ? 'MUTED' : 'ENABLED';
    });

    const motionBtn = document.getElementById('setting-motion-btn');
    motionBtn?.addEventListener('click', () => {
      if (gameInstance?.renderer?.sceneFactory) {
        const sf = gameInstance.renderer.sceneFactory;
        sf.reducedMotion = !sf.reducedMotion;
        motionBtn.textContent = sf.reducedMotion ? 'REDUCED' : 'STANDARD';
      }
    });

    // Quality Chips
    ['low', 'med', 'high'].forEach(preset => {
      document.getElementById(`setting-qual-${preset}`)?.addEventListener('click', (e) => {
        ['low', 'med', 'high'].forEach(p => {
          document.getElementById(`setting-qual-${p}`)?.classList.remove('active');
        });
        e.target.classList.add('active');
        gameInstance?.setQualityPreset(preset === 'med' ? 'medium' : preset);
      });
    });

  } catch (err) {
    logger.error('Uncaught error during initialization:', { error: err.message });
    if (gameInstance) {
      gameInstance.triggerFatalError(err.message);
    }
  }
});

function showModal(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? 'flex' : 'none';
}
