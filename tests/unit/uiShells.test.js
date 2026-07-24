import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/core/Game.js';
import { STATES } from '../../src/core/Config.js';

describe('UI Shells & Navigation Unit Tests', () => {
  let game;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app-container">
        <canvas id="game-canvas"></canvas>
        <div id="ui-overlay">
          <div id="boot-shell" style="display: flex;"></div>
          <div id="menu-shell" style="display: none;"></div>
          <div id="hud-shell" style="display: none;"></div>
          <div id="pause-shell" style="display: none;"></div>
          <div id="gameover-shell" style="display: none;"></div>
          <div id="settings-shell" style="display: none;"></div>
          <div id="help-shell" style="display: none;"></div>
          <div id="error-shell" style="display: none;"></div>
        </div>
      </div>
    `;

    game = new Game({ debug: false });
  });

  it('should toggle UI shells strictly based on state transitions', () => {
    const bootShell = document.getElementById('boot-shell');
    const menuShell = document.getElementById('menu-shell');
    const hudShell = document.getElementById('hud-shell');
    const pauseShell = document.getElementById('pause-shell');
    const gameoverShell = document.getElementById('gameover-shell');

    // BOOT -> MENU
    game.stateMachine.transitionTo(STATES.MENU);
    expect(bootShell.style.display).toBe('none');
    expect(menuShell.style.display).toBe('flex');

    // MENU -> RUNNING
    game.stateMachine.transitionTo(STATES.RUNNING);
    expect(menuShell.style.display).toBe('none');
    expect(hudShell.style.display).toBe('flex');

    // RUNNING -> PAUSED
    game.stateMachine.transitionTo(STATES.PAUSED);
    expect(pauseShell.style.display).toBe('flex');
    expect(hudShell.style.display).toBe('none');

    // PAUSED -> RUNNING
    game.stateMachine.transitionTo(STATES.RUNNING);
    expect(pauseShell.style.display).toBe('none');
    expect(hudShell.style.display).toBe('flex');

    // RUNNING -> GAME_OVER
    game.stateMachine.transitionTo(STATES.GAME_OVER, { reason: 'Test Crash' });
    expect(gameoverShell.style.display).toBe('flex');
    expect(hudShell.style.display).toBe('none');
  });
});
