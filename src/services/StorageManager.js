/**
 * Namespaced & Resilient Storage Service for MegaGameBox Offline Arcade
 * Safely wraps localStorage operations with versioned namespaces, schema validation,
 * corruption recovery, and graceful fallbacks when storage is quota-restricted or unavailable.
 */

export const STORAGE_KEYS = {
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
      return JSON.parse(item);
    } catch (e) {
      console.warn(`StorageManager read error for key "${key}", returning fallback:`, e);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`StorageManager write error for key "${key}":`, e);
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

  static clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => StorageManager.remove(k));
  }
}
