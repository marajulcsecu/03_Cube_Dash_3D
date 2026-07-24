/**
 * MegaGameBox GameBridge Adapter & Manifest Contract Manager
 * Handles bridge communication with host WebViews, browser fallback mocks,
 * idempotent run transaction lifecycles, and window.setAudioMuted global binding.
 */

import { logger } from './Logger.js';

export class GameBridgeAdapter {
  constructor() {
    this.activeRun = false;
    this.runStartTime = 0;
    this._bindGlobalBridge();
  }

  _bindGlobalBridge() {
    // Bind global setAudioMuted contract
    window.setAudioMuted = (isMuted) => {
      logger.info(`[GameBridge] External setAudioMuted invoked: ${isMuted}`);
      if (window.audioManager) {
        window.audioManager.muted = !!isMuted;
      }
    };
  }

  onRunStart(level = 1) {
    if (this.activeRun) {
      logger.warn('[GameBridge] Duplicate run start ignored.');
      return;
    }

    this.activeRun = true;
    this.runStartTime = Date.now();

    const payload = { level, timestamp: this.runStartTime };
    logger.info('[GameBridge] Emitting onGameStart payload:', payload);

    if (window.GameBridge && typeof window.GameBridge.onGameStart === 'function') {
      try {
        window.GameBridge.onGameStart(payload);
      } catch (e) {
        logger.error('[GameBridge] Error invoking Host onGameStart:', e);
      }
    }
  }

  onRunEnd(score = 0, level = 1, status = 'game_over') {
    if (!this.activeRun) {
      logger.warn('[GameBridge] Duplicate or orphaned run end ignored.');
      return;
    }

    this.activeRun = false;
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - this.runStartTime) / 1000));

    const payload = {
      score: Math.floor(score),
      level,
      elapsedSeconds,
      status
    };

    logger.info('[GameBridge] Emitting onGameEnd payload:', payload);

    if (window.GameBridge && typeof window.GameBridge.onGameEnd === 'function') {
      try {
        window.GameBridge.onGameEnd(payload);
      } catch (e) {
        logger.error('[GameBridge] Error invoking Host onGameEnd:', e);
      }
    }
  }

  onQuit() {
    logger.info('[GameBridge] Explicit onQuit requested.');
    if (this.activeRun) {
      this.onRunEnd(0, 1, 'quit');
    }

    if (window.GameBridge && typeof window.GameBridge.onQuit === 'function') {
      try {
        window.GameBridge.onQuit();
      } catch (e) {
        logger.error('[GameBridge] Error invoking Host onQuit:', e);
      }
    }
  }
}

export const gameBridge = new GameBridgeAdapter();
