/**
 * Touch, Pointer, and Keyboard Input Manager
 * Supports 5-lane swipes (Touch & Mouse Pointer), lower-zone tap jump, sensitivity, and touch-action protection.
 */

export class InputManager {
  constructor(targetElement = document.getElementById('app-container')) {
    this.target = targetElement;
    this.enabled = true;
    this.listeners = [];

    // Pointer gesture tracking
    this.isPointerDown = false;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.minSwipeDistance = 25; // Ignored if micro-swipe < 25px
    this.maxSwipeTime = 500; // ms

    this._boundPointerDown = this._handlePointerDown.bind(this);
    this._boundPointerMove = this._handlePointerMove.bind(this);
    this._boundPointerUp = this._handlePointerUp.bind(this);
    this._boundKeyDown = this._handleKeyDown.bind(this);

    this.init();
  }

  init() {
    if (!this.target) return;

    // Unified Pointer events (handles Mouse, Touch, Stylus)
    this.target.addEventListener('pointerdown', this._boundPointerDown, { passive: false });
    this.target.addEventListener('pointermove', this._boundPointerMove, { passive: false });
    this.target.addEventListener('pointerup', this._boundPointerUp, { passive: false });
    this.target.addEventListener('pointercancel', this._boundPointerUp, { passive: false });

    // Keyboard fallback for development
    window.addEventListener('keydown', this._boundKeyDown);
  }

  onAction(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  _emit(action, payload = {}) {
    if (!this.enabled) return;
    this.listeners.forEach(fn => {
      try {
        fn(action, payload);
      } catch (err) {
        console.error('InputManager callback error:', err);
      }
    });
  }

  _handlePointerDown(e) {
    if (!this.enabled) return;
    if (this._isUIElement(e.target)) return;

    this.isPointerDown = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = performance.now();
  }

  _handlePointerMove(e) {
    if (!this.enabled) return;
    if (this.isPointerDown && !this._isUIElement(e.target)) {
      e.preventDefault();
    }
  }

  _handlePointerUp(e) {
    if (!this.enabled || !this.isPointerDown) return;
    this.isPointerDown = false;

    if (this._isUIElement(e.target)) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    const duration = performance.now() - this.startTime;

    if (duration > this.maxSwipeTime) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Check if gesture exceeds minimum swipe distance threshold
    if (absX >= this.minSwipeDistance || absY >= this.minSwipeDistance) {
      if (absX > absY) {
        // Horizontal swipe / mouse drag
        if (deltaX > 0) {
          this._emit('MOVE_RIGHT');
        } else {
          this._emit('MOVE_LEFT');
        }
      } else {
        // Vertical swipe / mouse drag
        if (deltaY < 0) {
          this._emit('JUMP');
        }
      }
    } else {
      // Tap / Click gesture: check if lower zone (bottom 35% of screen)
      const screenHeight = window.innerHeight;
      if (e.clientY > screenHeight * 0.65) {
        this._emit('JUMP', { source: 'lower_zone_tap' });
      }
    }
  }

  _handleKeyDown(e) {
    if (!this.enabled) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this._emit('MOVE_LEFT');
        break;
      case 'ArrowRight':
      case 'KeyD':
        this._emit('MOVE_RIGHT');
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        e.preventDefault();
        this._emit('JUMP', { source: 'keyboard' });
        break;
    }
  }

  _isUIElement(target) {
    if (!target) return false;
    return (
      target.closest('.interactive') !== null ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.id === 'debug-overlay' ||
      target.closest('#debug-overlay') !== null
    );
  }

  dispose() {
    if (this.target) {
      this.target.removeEventListener('pointerdown', this._boundPointerDown);
      this.target.removeEventListener('pointermove', this._boundPointerMove);
      this.target.removeEventListener('pointerup', this._boundPointerUp);
      this.target.removeEventListener('pointercancel', this._boundPointerUp);
    }
    window.removeEventListener('keydown', this._boundKeyDown);
    this.listeners.length = 0;
  }
}
