/**
 * Authoritative State Machine for Cube Dash 3D
 */

import { STATES } from './Config.js';
import { logger } from '../services/Logger.js';

export const ALLOWED_TRANSITIONS = {
  [STATES.BOOT]: [STATES.MENU, STATES.FATAL_ERROR],
  [STATES.MENU]: [STATES.TUTORIAL, STATES.COUNTDOWN, STATES.RUNNING, STATES.FATAL_ERROR],
  [STATES.TUTORIAL]: [STATES.COUNTDOWN, STATES.MENU, STATES.FATAL_ERROR],
  [STATES.COUNTDOWN]: [STATES.RUNNING, STATES.PAUSED, STATES.FATAL_ERROR],
  [STATES.RUNNING]: [STATES.PAUSED, STATES.GAME_OVER, STATES.FATAL_ERROR],
  [STATES.PAUSED]: [STATES.COUNTDOWN, STATES.MENU, STATES.GAME_OVER, STATES.FATAL_ERROR],
  [STATES.GAME_OVER]: [STATES.COUNTDOWN, STATES.RUNNING, STATES.MENU, STATES.FATAL_ERROR],
  [STATES.FATAL_ERROR]: [STATES.BOOT, STATES.MENU]
};

export class StateMachine {
  constructor(initialState = STATES.BOOT) {
    this.currentState = initialState;
    this.previousState = null;
    this.changeListeners = [];
    this.enterListeners = new Map();
    this.leaveListeners = new Map();
  }

  getState() {
    return this.currentState;
  }

  canTransitionTo(nextState) {
    const allowed = ALLOWED_TRANSITIONS[this.currentState];
    return Array.isArray(allowed) && allowed.includes(nextState);
  }

  transitionTo(nextState, payload = {}) {
    if (this.currentState === nextState) {
      logger.warn(`StateMachine: already in state ${nextState}, skipping transition.`);
      return false;
    }

    if (!this.canTransitionTo(nextState)) {
      const errMessage = `StateMachine: Illegal transition from ${this.currentState} to ${nextState}`;
      logger.error(errMessage);
      throw new Error(errMessage);
    }

    const prevState = this.currentState;
    
    // Execute leave listeners
    const leaveHandlers = this.leaveListeners.get(prevState) || [];
    leaveHandlers.forEach(handler => handler(nextState, payload));

    this.previousState = prevState;
    this.currentState = nextState;

    logger.info(`StateMachine: ${prevState} -> ${nextState}`, payload);

    // Execute enter listeners
    const enterHandlers = this.enterListeners.get(nextState) || [];
    enterHandlers.forEach(handler => handler(prevState, payload));

    // Execute global change listeners
    this.changeListeners.forEach(listener => listener(nextState, prevState, payload));

    return true;
  }

  onEnter(state, handler) {
    if (!this.enterListeners.has(state)) {
      this.enterListeners.set(state, []);
    }
    this.enterListeners.get(state).push(handler);
    return () => this._removeListener(this.enterListeners.get(state), handler);
  }

  onLeave(state, handler) {
    if (!this.leaveListeners.has(state)) {
      this.leaveListeners.set(state, []);
    }
    this.leaveListeners.get(state).push(handler);
    return () => this._removeListener(this.leaveListeners.get(state), handler);
  }

  onChange(handler) {
    this.changeListeners.push(handler);
    return () => this._removeListener(this.changeListeners, handler);
  }

  _removeListener(arr, handler) {
    const index = arr.indexOf(handler);
    if (index !== -1) arr.splice(index, 1);
  }
}
