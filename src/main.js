/**
 * Cube Dash 3D - Entry Point
 * Bootstraps Game Architecture, UI Navigation & State Machine.
 */

import { Game } from './core/Game.js';
import { logger } from './services/Logger.js';
import { audioManager } from './services/AudioManager.js';
import { StorageManager } from './services/StorageManager.js';

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

    const skipBtn = document.getElementById('tutorial-skip-btn');
    const handleSkip = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (gameInstance) {
        gameInstance.tutorialManager.completeTutorial();
        gameInstance.stateMachine.transitionTo('RUNNING');
      }
    };

    if (skipBtn) {
      skipBtn.addEventListener('click', handleSkip);
      skipBtn.addEventListener('mousedown', handleSkip);
      skipBtn.addEventListener('touchstart', handleSkip, { passive: false });
    }

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

    // Wire up Settings Preferences Toggles & Storage Persistence
    const currentSettings = StorageManager.loadSettings();

    // Sync initial UI state from stored settings
    const audioBtn = document.getElementById('setting-audio-btn');
    if (audioBtn) {
      audioManager.muted = currentSettings.audioMuted;
      audioBtn.textContent = audioManager.muted ? 'MUTED' : 'ENABLED';
    }

    const motionBtn = document.getElementById('setting-motion-btn');
    if (motionBtn && gameInstance?.renderer?.sceneFactory) {
      gameInstance.renderer.sceneFactory.reducedMotion = currentSettings.motionComfort === 'reduced';
      motionBtn.textContent = currentSettings.motionComfort === 'reduced' ? 'REDUCED' : 'STANDARD';
    }

    const contrastBtn = document.getElementById('setting-contrast-btn');
    if (contrastBtn) {
      if (currentSettings.highContrast) {
        document.body.classList.add('high-contrast');
        contrastBtn.textContent = 'ENABLED';
      } else {
        document.body.classList.remove('high-contrast');
        contrastBtn.textContent = 'DISABLED';
      }
    }

    // Toggle Handlers
    audioBtn?.addEventListener('click', () => {
      audioManager.muted = !audioManager.muted;
      audioBtn.textContent = audioManager.muted ? 'MUTED' : 'ENABLED';
      const s = StorageManager.loadSettings();
      s.audioMuted = audioManager.muted;
      StorageManager.saveSettings(s);
    });

    motionBtn?.addEventListener('click', () => {
      if (gameInstance?.renderer?.sceneFactory) {
        const sf = gameInstance.renderer.sceneFactory;
        sf.reducedMotion = !sf.reducedMotion;
        motionBtn.textContent = sf.reducedMotion ? 'REDUCED' : 'STANDARD';
        const s = StorageManager.loadSettings();
        s.motionComfort = sf.reducedMotion ? 'reduced' : 'standard';
        StorageManager.saveSettings(s);
      }
    });

    contrastBtn?.addEventListener('click', () => {
      const isHC = document.body.classList.toggle('high-contrast');
      contrastBtn.textContent = isHC ? 'ENABLED' : 'DISABLED';
      const s = StorageManager.loadSettings();
      s.highContrast = isHC;
      StorageManager.saveSettings(s);
    });

    // Quality Chips
    ['low', 'med', 'high'].forEach(preset => {
      const chip = document.getElementById(`setting-qual-${preset}`);
      const normPreset = preset === 'med' ? 'medium' : preset;
      if (currentSettings.qualityPreset === normPreset) {
        chip?.classList.add('active');
      }
      chip?.addEventListener('click', (e) => {
        ['low', 'med', 'high'].forEach(p => {
          document.getElementById(`setting-qual-${p}`)?.classList.remove('active');
        });
        e.target.classList.add('active');
        gameInstance?.setQualityPreset(normPreset);
        const s = StorageManager.loadSettings();
        s.qualityPreset = normPreset;
        StorageManager.saveSettings(s);
      });
    });

    // Reset Player Progress with Deliberate Confirmation
    document.getElementById('setting-reset-progress-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all high scores and mission progress?')) {
        StorageManager.resetProgress();
        alert('Player progress has been reset!');
        location.reload();
      }
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
