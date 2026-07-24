# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step2] - 2026-07-24
### Added
- Implemented authoritative `StateMachine` supporting `BOOT`, `MENU`, `TUTORIAL`, `COUNTDOWN`, `RUNNING`, `PAUSED`, `GAME_OVER`, `FATAL_ERROR` states with guarded transition validation.
- Created `ConfigManager` with default settings and validation.
- Implemented `Clock` time service with delta clamping and pause controls.
- Implemented `Logger` service for non-sensitive local runtime telemetry.
- Implemented `DebugOverlay` diagnostics panel with FPS, Delta, Viewport, State metrics, and manual test error trigger.
- Added lifecycle event listeners for `visibilitychange` and `pagehide`.
- Added unit tests for StateMachine, ConfigManager, and Clock (15 total tests passing).
