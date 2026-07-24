# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step7] - 2026-07-24
### Added
- Implemented `PatternLibrary` defining config-driven obstacle pattern families: `lane_wall`, `low_barrier`, `floor_gap`, `moving_gate` (dynamic oscillating barrier), `pulse_wall` (expands rhythmically), `crusher_frame` (overhead arch), `shard_trail`, and `rest` segments.
- Implemented `ReachabilityValidator` mathematical simulation engine enforcing player physical lane shift limits (120ms per lane) and rejecting impossible transition sequences.
- Added Pattern Gallery Selector dropdown to `DebugOverlay` allowing instant previewing and testing of all 8 production pattern families.
- Added unit tests verifying pattern reachability, impossible sequence rejection, and deterministic seed generation (34 total tests passing).
