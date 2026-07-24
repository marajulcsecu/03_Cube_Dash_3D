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
        <label style="font-size: 9px; color: #9d4edd;">Pattern Gallery:</label>
        <select id="pattern-gallery-select" style="width: 100%; background: #070913; color: #00f3ff; border: 1px solid #00f3ff; font-size: 9px; padding: 2px; margin-top: 2px;">
          <option value="safe_runway">Safe Runway</option>
          <option value="center_wall_outer_shards">Center Wall & Side Shards</option>
          <option value="low_barrier_leap">Center Low Barrier Leap</option>
          <option value="moving_gate_oscillator">Moving Gate Oscillator</option>
          <option value="pulse_wall_beat">Expanding Pulse Wall</option>
          <option value="crusher_frame_arch">Overhead Crusher Arch</option>
          <option value="side_gaps_center_bridge">Side Floor Gaps</option>
          <option value="diagonal_shard_weave">Diagonal Shard Weave</option>
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

    this.overlayEl.querySelector('#debug-close-btn').addEventListener('click', () => this.hide());
    this.overlayEl.querySelector('#preset-low-btn').addEventListener('click', () => this.game.setQualityPreset('low'));
    this.overlayEl.querySelector('#preset-med-btn').addEventListener('click', () => this.game.setQualityPreset('medium'));
    this.overlayEl.querySelector('#preset-high-btn').addEventListener('click', () => this.game.setQualityPreset('high'));
    
    this.overlayEl.querySelector('#pattern-gallery-select').addEventListener('change', (e) => {
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
    if (this.overlayEl) this.overlayEl.style.display = 'block';
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
    
    let poolStats = { active: 0, pooled: 0, totalSpawned: 0 };
    if (this.game.renderer && this.game.renderer.sceneFactory && this.game.renderer.sceneFactory.tunnelManager) {
      poolStats = this.game.renderer.sceneFactory.tunnelManager.stats;
    }

    this.statsEl.innerHTML = `
      <div><strong>State:</strong> <span style="color: #fff;">${state}</span> | <strong>Preset:</strong> <span style="color: #9d4edd;">${rendererInfo.preset}</span></div>
      <div><strong>FPS:</strong> ${this.currentFps} FPS | <strong>Delta:</strong> ${delta}ms</div>
      <div><strong>Elapsed:</strong> ${elapsed}s | <strong>DPR:</strong> ${rendererInfo.dpr}</div>
      <div><strong>Calls:</strong> ${rendererInfo.drawCalls} | <strong>Tris:</strong> ${rendererInfo.triangles}</div>
      <div><strong>Segments:</strong> Active ${poolStats.active} | Pool ${poolStats.pooled}</div>
      <div><strong>Spawned:</strong> ${poolStats.totalSpawned} | <strong>Viewport:</strong> ${viewport}</div>
    `;
  }
}
