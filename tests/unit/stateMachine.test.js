import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateMachine } from '../../src/core/StateMachine.js';
import { STATES } from '../../src/core/Config.js';

describe('StateMachine Architecture Unit Tests', () => {
  let stateMachine;

  beforeEach(() => {
    stateMachine = new StateMachine(STATES.BOOT);
  });

  it('should start in BOOT state by default', () => {
    expect(stateMachine.getState()).toBe(STATES.BOOT);
  });

  it('should allow valid transition BOOT -> MENU', () => {
    expect(stateMachine.canTransitionTo(STATES.MENU)).toBe(true);
    const result = stateMachine.transitionTo(STATES.MENU);
    expect(result).toBe(true);
    expect(stateMachine.getState()).toBe(STATES.MENU);
  });

  it('should reject invalid transition BOOT -> RUNNING', () => {
    expect(stateMachine.canTransitionTo(STATES.RUNNING)).toBe(false);
    expect(() => stateMachine.transitionTo(STATES.RUNNING)).toThrowError(/Illegal transition/);
    expect(stateMachine.getState()).toBe(STATES.BOOT);
  });

  it('should support multi-step valid game flow (BOOT -> MENU -> COUNTDOWN -> RUNNING -> PAUSED)', () => {
    stateMachine.transitionTo(STATES.MENU);
    expect(stateMachine.getState()).toBe(STATES.MENU);

    stateMachine.transitionTo(STATES.COUNTDOWN);
    expect(stateMachine.getState()).toBe(STATES.COUNTDOWN);

    stateMachine.transitionTo(STATES.RUNNING);
    expect(stateMachine.getState()).toBe(STATES.RUNNING);

    stateMachine.transitionTo(STATES.PAUSED);
    expect(stateMachine.getState()).toBe(STATES.PAUSED);
  });

  it('should trigger onEnter and onLeave callbacks during transition', () => {
    const leaveBoot = vi.fn();
    const enterMenu = vi.fn();

    stateMachine.onLeave(STATES.BOOT, leaveBoot);
    stateMachine.onEnter(STATES.MENU, enterMenu);

    stateMachine.transitionTo(STATES.MENU, { testPayload: 123 });

    expect(leaveBoot).toHaveBeenCalledTimes(1);
    expect(enterMenu).toHaveBeenCalledTimes(1);
    expect(enterMenu).toHaveBeenCalledWith(STATES.BOOT, { testPayload: 123 });
  });

  it('should always allow transition to FATAL_ERROR from any active state except FATAL_ERROR', () => {
    const statesToTest = [STATES.BOOT, STATES.MENU, STATES.COUNTDOWN, STATES.RUNNING, STATES.PAUSED, STATES.GAME_OVER];
    
    statesToTest.forEach(state => {
      const sm = new StateMachine(state);
      expect(sm.canTransitionTo(STATES.FATAL_ERROR)).toBe(true);
    });
  });
});
