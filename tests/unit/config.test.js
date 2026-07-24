import { describe, it, expect } from 'vitest';
import { ConfigManager, DEFAULT_CONFIG } from '../../src/core/Config.js';

describe('ConfigManager Unit Tests', () => {
  it('should load default config when no custom config is provided', () => {
    const configManager = new ConfigManager();
    expect(configManager.get('lanes')).toBe(5);
    expect(configManager.get('version')).toBe('1.0.0');
  });

  it('should throw validation error when invalid lane count is passed', () => {
    expect(() => new ConfigManager({ lanes: 10 })).toThrowError(/Invalid Config/);
    expect(() => new ConfigManager({ lanes: 1 })).toThrowError(/Invalid Config/);
  });

  it('should freeze configuration object to prevent accidental runtime mutations', () => {
    const configManager = new ConfigManager();
    expect(() => {
      configManager.config.lanes = 4;
    }).toThrow();
  });
});
