/**
 * Responsive Three.js WebGL Renderer for Cube Dash 3D
 * Handles Canvas resolution, DPR capping, quality scaling, and draw call tracking.
 */

import * as THREE from 'three';
import { SceneFactory } from './SceneFactory.js';
import { EffectsManager } from './Effects.js';
import { logger } from '../services/Logger.js';

export class ResponsiveRenderer {
  constructor(canvasEl, preset = 'high', dprCap = 2.0) {
    this.canvas = canvasEl;
    this.preset = preset;
    this.dprCap = dprCap;
    this.webglRenderer = null;
    this.sceneFactory = null;
    this.effectsManager = null;
    this.resizeObserver = null;

    this.info = {
      drawCalls: 0,
      triangles: 0,
      points: 0,
      preset: this.preset,
      dpr: 1.0
    };

    this.init();
  }

  init() {
    try {
      this.webglRenderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: this.preset !== 'low',
        powerPreference: 'high-performance',
        precision: this.preset === 'low' ? 'mediump' : 'highp'
      });

      this.webglRenderer.outputColorSpace = THREE.SRGBColorSpace;
      
      this.sceneFactory = new SceneFactory();
      this.effectsManager = new EffectsManager(this.sceneFactory.scene, this.preset);

      this.updateQualityPreset(this.preset);
      this.handleResize();

      // Listen for window resize
      window.addEventListener('resize', () => this.handleResize());

      logger.info('ResponsiveRenderer initialized successfully.', { preset: this.preset });
    } catch (err) {
      logger.error('Failed to create WebGLRenderer context:', { error: err.message });
      throw err;
    }
  }

  updateQualityPreset(preset) {
    this.preset = preset;
    this.info.preset = preset;

    let dprLimit = 2.0;
    if (preset === 'low') dprLimit = 1.0;
    else if (preset === 'medium') dprLimit = 1.5;

    const actualDpr = Math.min(window.devicePixelRatio || 1, dprLimit);
    this.info.dpr = actualDpr;
    this.webglRenderer.setPixelRatio(actualDpr);

    if (this.effectsManager) {
      this.effectsManager.setPreset(preset);
    }
  }

  handleResize() {
    if (!this.webglRenderer || !this.sceneFactory) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.webglRenderer.setSize(width, height, false);
    this.sceneFactory.updateAspect(width, height);
  }

  render(delta, elapsed) {
    if (!this.webglRenderer || !this.sceneFactory) return;

    // Update scene animations and effects
    this.sceneFactory.update(delta, elapsed);
    if (this.effectsManager) {
      this.effectsManager.update(delta);
    }

    // Render WebGL frame
    this.webglRenderer.render(this.sceneFactory.scene, this.sceneFactory.camera);

    // Extract renderer diagnostics
    const renderInfo = this.webglRenderer.info.render;
    this.info.drawCalls = renderInfo.calls;
    this.info.triangles = renderInfo.triangles;
    this.info.points = renderInfo.points;
  }

  dispose() {
    window.removeEventListener('resize', () => this.handleResize());
    if (this.effectsManager) this.effectsManager.dispose();
    if (this.sceneFactory) this.sceneFactory.dispose();
    if (this.webglRenderer) {
      this.webglRenderer.dispose();
      this.webglRenderer.forceContextLoss();
    }
  }
}
