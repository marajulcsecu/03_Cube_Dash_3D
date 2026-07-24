# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step12] - 2026-07-24
### Added
- Implemented `TutorialManager` first-run protected interactive tutorial sequence guiding new players through 3 micro-steps: Lane Shift (`A`/`D` / Swipe), Jump (`Space`/`W` / Swipe Up), and Shard Collection.
- Added non-terminal safe collision protection during tutorial state (player resets without game-over death).
- Added `SKIP TUTORIAL` button and `REPLAY TUTORIAL` option in How-to-Play guide modal with `localStorage` completion persistence (`cube_dash_3d_tutorial_done`).
- Added unit test suite `tests/unit/tutorial.test.js` (52 total tests passing).
