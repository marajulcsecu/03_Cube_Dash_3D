/**
 * Namespaced & Resilient Storage Service for MegaGameBox Offline Arcade
 * Safely wraps localStorage operations with versioned namespaces, schema validation,
 * corruption recovery, and graceful fallbacks when storage is quota-restricted or unavailable.
 */

import { logger } from './Logger.js';

export const STORAGE_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  VERSION: 'cube_dash_3d_version',
  HIGH_SCORE: 'cube_dash_3d_highscore',
  MISSIONS: 'cube_dash_3d_missions',
  SETTINGS: 'cube_dash_3d_settings',
  TUTORIAL: 'cube_dash_3d_tutorial_done'
};

export const DEFAULT_SETTINGS = {
  audioMuted: false,
  motionComfort: 'standard', // 'standard' | 'reduced'
  qualityPreset: 'medium',   // 'low' | 'medium' | 'high'
  highContrast: false,
  swipeSensitivity: 1.0
};

export class StorageManager {
  static get(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      const parsed = JSON.parse(item);
      return parsed !== null && parsed !== undefined ? parsed : defaultValue;
    } catch (e) {
      logger.warn(`StorageManager corruption detected for key "${key}". Resetting to fallback default:`, e);
      StorageManager.remove(key);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      logger.warn(`StorageManager quota or write exception for key "${key}":`, e);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  static loadSettings() {
    const raw = StorageManager.get(STORAGE_KEYS.SETTINGS, {});
    return {
      audioMuted: typeof raw.audioMuted === 'boolean' ? raw.audioMuted : DEFAULT_SETTINGS.audioMuted,
      motionComfort: ['standard', 'reduced'].includes(raw.motionComfort) ? raw.motionComfort : DEFAULT_SETTINGS.motionComfort,
      qualityPreset: ['low', 'medium', 'high'].includes(raw.qualityPreset) ? raw.qualityPreset : DEFAULT_SETTINGS.qualityPreset,
      highContrast: typeof raw.highContrast === 'boolean' ? raw.highContrast : DEFAULT_SETTINGS.highContrast,
      swipeSensitivity: typeof raw.swipeSensitivity === 'number' ? Math.max(0.5, Math.min(2.0, raw.swipeSensitivity)) : DEFAULT_SETTINGS.swipeSensitivity
    };
  }

  static saveSettings(settings) {
    const validated = {
      audioMuted: !!settings.audioMuted,
      motionComfort: ['standard', 'reduced'].includes(settings.motionComfort) ? settings.motionComfort : 'standard',
      qualityPreset: ['low', 'medium', 'high'].includes(settings.qualityPreset) ? settings.qualityPreset : 'medium',
      highContrast: !!settings.highContrast,
      swipeSensitivity: typeof settings.swipeSensitivity === 'number' ? Math.max(0.5, Math.min(2.0, settings.swipeSensitivity)) : 1.0
    };
    return StorageManager.set(STORAGE_KEYS.SETTINGS, validated);
  }

  static resetProgress() {
    StorageManager.remove(STORAGE_KEYS.HIGH_SCORE);
    StorageManager.remove(STORAGE_KEYS.MISSIONS);
    StorageManager.remove(STORAGE_KEYS.TUTORIAL);
    logger.info('StorageManager reset all player progress data.');
  }

  static resetSettings() {
    StorageManager.saveSettings(DEFAULT_SETTINGS);
    logger.info('StorageManager reset all settings preferences to defaults.');
  }

  static clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => StorageManager.remove(k));
  }
}
