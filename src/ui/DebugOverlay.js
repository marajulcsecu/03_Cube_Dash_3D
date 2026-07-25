/**
 * Optional Debug Overlay & Diagnostics UI
 */

export class DebugOverlay {
  constructor(container, game) {
    this.container = container;
    this.game = game;
    this.overlayEl = null;
    this.statsEl = null;
    this.visible = false;
    this.fpsCounter = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 60;

    this.init();
  }

  init() {
    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'debug-overlay';
    this.overlayEl.className = 'interactive';
    this.overlayEl.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 999;
      background: rgba(10, 15, 30, 0.85);
      border: 1px solid rgba(0, 243, 255, 0.4);
      border-radius: 8px;
      padding: 10px 14px;
      color: #00f3ff;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.5;
      display: none;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      max-width: 280px;
    `;

    this.overlayEl.innerHTML = `
      <div style="font-weight: bold; border-bottom: 1px solid rgba(0, 243, 255, 0.2); padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between;">
        <span>DIAGNOSTICS PANEL</span>
        <span id="debug-close-btn" style="cursor: pointer;">[X]</span>
      </div>
      <div id="debug-stats-content">Initializing stats...</div>
      <div style="margin-top: 6px; border-top: 1px solid rgba(0, 243, 255, 0.2); padding-top: 4px;">
        <label style="font-size: 9px; color: #9d4edd;">Difficulty Tier Jump:</label>
        <div style="display: flex; gap: 2px; margin-top: 2px;">
          <button id="tier-1-btn" style="flex: 1; background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid #00f3ff; font-size: 8px; cursor: pointer; padding: 2px 0;">T1</button>
          <button id="tier-2-btn" style="flex: 1; background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid #00f3ff; font-size: 8px; cursor: pointer; padding: 2px 0;">T2</button>
          <button id="tier-3-btn" style="flex: 1; background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid #00f3ff; font-size: 8px; cursor: pointer; padding: 2px 0;">T3</button>
          <button id="tier-4-btn" style="flex: 1; background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid #00f3ff; font-size: 8px; cursor: pointer; padding: 2px 0;">T4</button>
          <button id="tier-5-btn" style="flex: 1; background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid #00f3ff; font-size: 8px; cursor: pointer; padding: 2px 0;">T5</button>
        </div>
      </div>
      <div style="margin-top: 6px; border-top: 1px solid rgba(0, 243, 255, 0.2); padding-top: 4px;">
        <label style="font-size: 9px; color: #ff00aa;">Instant Obstacle Spawn:</label>
        <div style="display: flex; gap: 3px; margin-top: 2px; flex-wrap: wrap;">
          <button id="spawn-asteroid-btn" style="flex: 1; min-width: 55px; background: rgba(255, 102, 0, 0.2); color: #ff9900; border: 1px solid #ff6600; font-size: 8px; cursor: pointer; padding: 3px 0; border-radius: 3px;">🪨 Asteroid</button>
          <button id="spawn-monster-btn" style="flex: 1; min-width: 55px; background: rgba(255, 0, 102, 0.2); color: #ff0066; border: 1px solid #ff0066; font-size: 8px; cursor: pointer; padding: 3px 0; border-radius: 3px;">👾 Monster</button>
          <button id="spawn-laser-btn" style="flex: 1; min-width: 55px; background: rgba(0, 243, 255, 0.2); color: #00f3ff; border: 1px solid #00f3ff; font-size: 8px; cursor: pointer; padding: 3px 0; border-radius: 3px;">⚡ Laser</button>
          <button id="spawn-rotor-btn" style="flex: 1; min-width: 55px; background: rgba(255, 204, 0, 0.2); color: #ffcc00; border: 1px solid #ffcc00; font-size: 8px; cursor: pointer; padding: 3px 0; border-radius: 3px;">🪓 Saw Rotor</button>
        </div>
      </div>
      <div style="margin-top: 6px; border-top: 1px solid rgba(0, 243, 255, 0.2); padding-top: 4px;">
        <label style="font-size: 9px; color: #9d4edd;">Pattern Gallery:</label>
        <select id="pattern-gallery-select" style="width: 100%; background: #070913; color: #00f3ff; border: 1px solid #00f3ff; font-size: 9px; padding: 2px; margin-top: 2px;">
          <option value="safe_runway">Safe Runway</option>
        </select>
      </div>
      <div style="margin-top: 8px; border-top: 1px solid rgba(0, 243, 255, 0.2); padding-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">
        <button id="preset-low-btn" style="background: rgba(0, 243, 255, 0.2); color: #00f3ff; border: 1px solid #00f3ff; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer;">LOW</button>
        <button id="preset-med-btn" style="background: rgba(0, 243, 255, 0.2); color: #00f3ff; border: 1px solid #00f3ff; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer;">MED</button>
        <button id="preset-high-btn" style="background: rgba(0, 243, 255, 0.2); color: #00f3ff; border: 1px solid #00f3ff; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer;">HIGH</button>
        <button id="debug-trigger-error-btn" style="background: #ff3366; color: #fff; border: none; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer; margin-left: auto;">Fatal Error</button>
      </div>
    `;

    this.container.appendChild(this.overlayEl);
    this.statsEl = this.overlayEl.querySelector('#debug-stats-content');

    // Dynamically populate pattern gallery options from PatternLibrary
    const patternSelect = this.overlayEl.querySelector('#pattern-gallery-select');
    if (patternSelect && this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
      const patterns = this.game.renderer.sceneFactory.tunnelManager.patternLibrary.getAllPatterns();
      patternSelect.innerHTML = patterns.map(p => `<option value="${p.id}">${p.name} (T${p.difficulty})</option>`).join('');
    }

    this.overlayEl.querySelector('#debug-close-btn').addEventListener('click', () => this.hide());
    this.overlayEl.querySelector('#preset-low-btn').addEventListener('click', () => this.game.setQualityPreset('low'));
    this.overlayEl.querySelector('#preset-med-btn').addEventListener('click', () => this.game.setQualityPreset('medium'));
    this.overlayEl.querySelector('#preset-high-btn').addEventListener('click', () => this.game.setQualityPreset('high'));

    [1, 2, 3, 4, 5].forEach(t => {
      this.overlayEl.querySelector(`#tier-${t}-btn`).addEventListener('click', () => {
        if (this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
          this.game.renderer.sceneFactory.tunnelManager.setManualTier(t);
        }
      });
    });

    const spawnPattern = (patternId) => {
      if (this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
        this.game.renderer.sceneFactory.tunnelManager.spawnSpecificPattern(patternId);
      }
    };

    this.overlayEl.querySelector('#spawn-asteroid-btn').addEventListener('click', () => spawnPattern('single_asteroid_center'));
    this.overlayEl.querySelector('#spawn-monster-btn').addEventListener('click', () => spawnPattern('alien_monster_hover_center'));
    this.overlayEl.querySelector('#spawn-laser-btn').addEventListener('click', () => spawnPattern('laser_grid_single_lane'));
    this.overlayEl.querySelector('#spawn-rotor-btn').addEventListener('click', () => spawnPattern('plasma_rotor_center_saw'));

    patternSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
        this.game.renderer.sceneFactory.tunnelManager.spawnSpecificPattern(selectedId);
      }
    });

    this.overlayEl.querySelector('#debug-trigger-error-btn').addEventListener('click', () => {
      this.game.triggerFatalError('User initiated test error via Diagnostics Panel.');
    });
  }

  show() {
    this.visible = true;
    if (this.overlayEl) {
      this.overlayEl.style.display = 'block';
      const patternSelect = this.overlayEl.querySelector('#pattern-gallery-select');
      if (patternSelect && this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
        const patterns = this.game.renderer.sceneFactory.tunnelManager.patternLibrary.getAllPatterns();
        patternSelect.innerHTML = patterns.map(p => `<option value="${p.id}">${p.name} (T${p.difficulty})</option>`).join('');
      }
    }
  }

  hide() {
    this.visible = false;
    if (this.overlayEl) this.overlayEl.style.display = 'none';
  }

  toggle() {
    if (this.visible) this.hide();
    else this.show();
  }

  update(clock, stateMachine) {
    if (!this.visible) return;

    // Simple FPS calculation
    const now = performance.now();
    this.fpsCounter++;
    if (now - this.lastFpsUpdate >= 500) {
      this.currentFps = Math.round((this.fpsCounter * 1000) / (now - this.lastFpsUpdate));
      this.fpsCounter = 0;
      this.lastFpsUpdate = now;
    }

    const state = stateMachine ? stateMachine.getState() : 'N/A';
    const delta = clock ? (clock.deltaSeconds * 1000).toFixed(1) : 0;
    const elapsed = clock ? clock.elapsedSeconds.toFixed(1) : 0;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;

    const rendererInfo = this.game.renderer ? this.game.renderer.info : { drawCalls: 0, triangles: 0, preset: 'N/A', dpr: 1 };
    
    let poolStats = { active: 0, pooled: 0, totalSpawned: 0, tier: 'CALM', distance: 0, speed: 15.0 };
    if (this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
      poolStats = this.game.renderer.sceneFactory.tunnelManager.stats;
    }

    this.statsEl.innerHTML = `
      <div><strong>State:</strong> <span style="color: #fff;">${state}</span> | <strong>Tier:</strong> <span style="color: #00f3ff;">${poolStats.tier}</span></div>
      <div><strong>Dist:</strong> ${poolStats.distance}m | <strong>Speed:</strong> ${poolStats.speed} m/s</div>
      <div><strong>FPS:</strong> ${this.currentFps} FPS | <strong>Delta:</strong> ${delta}ms</div>
      <div><strong>Elapsed:</strong> ${elapsed}s | <strong>DPR:</strong> ${rendererInfo.dpr}</div>
      <div><strong>Calls:</strong> ${rendererInfo.drawCalls} | <strong>Tris:</strong> ${rendererInfo.triangles}</div>
      <div><strong>Segments:</strong> Active ${poolStats.active} | Pool ${poolStats.pooled}</div>
      <div><strong>Spawned:</strong> ${poolStats.totalSpawned} | <strong>Viewport:</strong> ${viewport}</div>
    `;
  }
}
