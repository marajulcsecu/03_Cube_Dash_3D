# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step9] - 2026-07-24
### Added
- Implemented integer-only `ScoreSystem` calculating distance points, +50 energy shard bonuses, +25 near-miss dodges, capped 5x multipliers, near-miss duplicate farming protection, and local high score persistence in `localStorage`.
- Implemented `MissionManager` tracking 3 active rotating local missions ("Collect 10 Energy Shards", "Reach 500m Distance", "Achieve 3x Multiplier") with live progress saving.
- Added top-right real-time in-game HUD overlay displaying Score, Multiplier (1x-5x), and Shard Count.
- Added detailed Game Over breakdown stats grid showing Final Score, High Score, Distance (m), Shards Collected, and Mission Completion badges.
- Added unit tests for integer score math, multiplier caps, near-miss farming shielding, and mission completion (43 total tests passing).
