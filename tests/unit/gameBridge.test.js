import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameBridgeAdapter } from '../../src/services/GameBridgeAdapter.js';
import { StorageManager } from '../../src/services/StorageManager.js';

describe('GameBridge & StorageManager Unit Tests', () => {
  let bridge;

  beforeEach(() => {
    localStorage.clear();
    bridge = new GameBridgeAdapter();
  });

  it('should safely manage storage keys with fallback handling', () => {
    StorageManager.set('test_key', { foo: 'bar' });
    expect(StorageManager.get('test_key', {})).toEqual({ foo: 'bar' });

    expect(StorageManager.get('non_existent', 'fallback')).toBe('fallback');
  });

  it('should emit onGameStart payload and prevent duplicate active run starts', () => {
    const mockOnStart = vi.fn();
    window.GameBridge = { onGameStart: mockOnStart };

    bridge.onRunStart(1);
    expect(mockOnStart).toHaveBeenCalledTimes(1);
    expect(mockOnStart).toHaveBeenCalledWith(expect.objectContaining({ level: 1 }));

    // Duplicate call
    bridge.onRunStart(1);
    expect(mockOnStart).toHaveBeenCalledTimes(1); // Shielded duplicate!
  });

  it('should emit onGameEnd payload once per run transaction', () => {
    const mockOnEnd = vi.fn();
    window.GameBridge = { onGameStart: vi.fn(), onGameEnd: mockOnEnd };

    bridge.onRunStart(1);
    bridge.onRunEnd(5000, 1, 'game_over');

    expect(mockOnEnd).toHaveBeenCalledTimes(1);
    expect(mockOnEnd).toHaveBeenCalledWith(expect.objectContaining({
      score: 5000,
      level: 1,
      status: 'game_over'
    }));

    // Duplicate call shielded
    bridge.onRunEnd(5000, 1, 'game_over');
    expect(mockOnEnd).toHaveBeenCalledTimes(1);
  });
});
