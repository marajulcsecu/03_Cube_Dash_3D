# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step10] - 2026-07-24
### Added
- Implemented Web Audio API procedural synthesizer (`AudioManager`) creating 100% offline sound effects for jumps, energy shard collection, and terminal collision crashes.
- Bound `window.setAudioMuted(isMuted)` MegaGameBox bridge contract for global instant muting.
- Implemented camera language in `SceneFactory`: speed-based dynamic FOV scaling (70° up to 78° capped), damped camera X sway following player lane movements, and decaying impact camera shake.
- Added reduced motion support flag disabling camera shake and excessive FOV shifts.
- Added unit tests for audio bridge, speed FOV scaling, impact camera shake decay, and reduced motion safety (47 total tests passing).
