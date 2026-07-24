/**
 * Cube Dash 3D - Entry Point
 * Bootstraps Game Architecture & State Machine.
 */

import { Game } from './core/Game.js';
import { logger } from './services/Logger.js';

let gameInstance = null;

window.addEventListener('DOMContentLoaded', () => {
  logger.info('DOM loaded. Initializing Game Core Architecture...');

  try {
    gameInstance = new Game({ debug: true });
    gameInstance.init(document.getElementById('app-container'));
    gameInstance.startLoop();

    // Wire up menu & gameover interactions
    document.getElementById('menu-play-btn')?.addEventListener('click', () => {
      if (gameInstance) {
        gameInstance.startRun();
      }
    });

    document.getElementById('gameover-replay-btn')?.addEventListener('click', () => {
      if (gameInstance) {
        gameInstance.startRun();
      }
    });

    document.getElementById('gameover-menu-btn')?.addEventListener('click', () => {
      if (gameInstance && gameInstance.stateMachine) {
        gameInstance.stateMachine.transitionTo('MENU');
      }
    });

    document.getElementById('menu-debug-btn')?.addEventListener('click', () => {
      if (gameInstance && gameInstance.debugOverlay) {
        gameInstance.debugOverlay.toggle();
      }
    });

    document.getElementById('menu-error-test-btn')?.addEventListener('click', () => {
      if (gameInstance) {
        gameInstance.triggerFatalError('Simulated test failure triggered via Menu.');
      }
    });

  } catch (err) {
    logger.error('Uncaught error during initialization:', { error: err.message });
    if (gameInstance) {
      gameInstance.triggerFatalError(err.message);
    }
  }
});
