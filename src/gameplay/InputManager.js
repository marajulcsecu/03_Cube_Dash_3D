/**
 * Touch Gesture Emitter and Keyboard Input Service
 * Handles 5-lane swipes, lower-zone tap jump, sensitivity, and browser default action prevention.
 */

export class InputManager {
  constructor(targetElement = document.getElementById('app-container')) {
    this.target = targetElement;
    this.enabled = true;
    this.listeners = [];

    // Touch gesture tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDistance = 25; // Ignored if micro-swipe < 25px
    this.maxSwipeTime = 500; // ms

    this._boundTouchStart = this._handleTouchStart.bind(this);
    this._boundTouchEnd = this._handleTouchEnd.bind(this);
    this._boundTouchMove = this._handleTouchMove.bind(this);
    this._boundKeyDown = this._handleKeyDown.bind(this);

    this.init();
  }

  init() {
    if (!this.target) return;

    // Attach touch listeners with passive: false to allow preventDefault()
    this.target.addEventListener('touchstart', this._boundTouchStart, { passive: false });
    this.target.addEventListener('touchmove', this._boundTouchMove, { passive: false });
    this.target.addEventListener('touchend', this._boundTouchEnd, { passive: false });

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

  _handleTouchStart(e) {
    if (!this.enabled) return;
    
    // Ignore touch if interacting with UI buttons
    if (this._isUIElement(e.target)) return;

    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = performance.now();
    }
  }

  _handleTouchMove(e) {
    if (!this.enabled) return;
    if (!this._isUIElement(e.target)) {
      e.preventDefault(); // Prevent page pull-to-refresh or scrolling
    }
  }

  _handleTouchEnd(e) {
    if (!this.enabled) return;
    if (this._isUIElement(e.target)) return;

    if (e.changedTouches && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const duration = performance.now() - this.touchStartTime;

      if (duration > this.maxSwipeTime) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Check if gesture exceeds minimum swipe distance threshold
      if (absX >= this.minSwipeDistance || absY >= this.minSwipeDistance) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0) {
            this._emit('MOVE_RIGHT');
          } else {
            this._emit('MOVE_LEFT');
          }
        } else {
          // Vertical swipe
          if (deltaY < 0) {
            this._emit('JUMP');
          }
        }
      } else {
        // Tap gesture: check if lower zone (bottom 35% of screen)
        const screenHeight = window.innerHeight;
        if (touch.clientY > screenHeight * 0.65) {
          this._emit('JUMP', { source: 'lower_zone_tap' });
        }
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
      this.target.removeEventListener('touchstart', this._boundTouchStart);
      this.target.removeEventListener('touchmove', this._boundTouchMove);
      this.target.removeEventListener('touchend', this._boundTouchEnd);
    }
    window.removeEventListener('keydown', this._boundKeyDown);
    this.listeners.length = 0;
  }
}
