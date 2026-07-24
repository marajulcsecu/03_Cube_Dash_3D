# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step8] - 2026-07-24
### Added
- Implemented `DifficultyDirector` managing 5 distance-based difficulty tiers (`CALM`: 15m/s, `FLOW`: 20m/s, `FOCUS`: 24m/s, `EXPERT`: 28m/s, `MASTERY`: 30m/s hard cap).
- Enforced safe tier advancement rules: difficulty tier and speed increments occur ONLY during safe rest segments to eliminate abrupt mid-hazard difficulty spikes.
- Added Difficulty Tier Jump buttons (`T1`, `T2`, `T3`, `T4`, `T5`) to `DebugOverlay` with real-time Tier, Distance (m), and Speed (m/s) telemetry.
- Added unit tests for distance-based progression, safe rest tier advancement, hard 30m/s speed capping, and manual debug tier jumps (38 total tests passing).
