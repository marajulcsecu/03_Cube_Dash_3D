/**
 * Non-sensitive structured Logger service for local runtime telemetry and diagnostics.
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

export class Logger {
  constructor(level = LOG_LEVELS.INFO) {
    this.level = level;
    this.listeners = [];
  }

  setLevel(level) {
    this.level = level;
  }

  onLog(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  }

  debug(message, context = {}) {
    this._log(LOG_LEVELS.DEBUG, 'DEBUG', message, context);
  }

  info(message, context = {}) {
    this._log(LOG_LEVELS.INFO, 'INFO', message, context);
  }

  warn(message, context = {}) {
    this._log(LOG_LEVELS.WARN, 'WARN', message, context);
  }

  error(message, context = {}) {
    this._log(LOG_LEVELS.ERROR, 'ERROR', message, context);
  }

  _log(numericLevel, levelName, message, context) {
    if (numericLevel < this.level) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      context
    };

    const formatted = `[CubeDash3D][${entry.level}] ${entry.message}`;
    
    switch (numericLevel) {
      case LOG_LEVELS.DEBUG:
        console.debug(formatted, context);
        break;
      case LOG_LEVELS.INFO:
        console.info(formatted, context);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formatted, context);
        break;
      case LOG_LEVELS.ERROR:
        console.error(formatted, context);
        break;
    }

    this.listeners.forEach(fn => {
      try {
        fn(entry);
      } catch (err) {
        // Prevent listener crashes from corrupting log flow
      }
    });
  }
}

export const logger = new Logger();
