# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step4] - 2026-07-24
### Added
- Implemented `SeededRNG` (Mulberry32) for deterministic seed-based world generation.
- Implemented `ObjectPool` generic pool architecture pre-allocating and recycling 3D meshes without per-frame GC allocations.
- Implemented `TunnelSegment` encapsulating octagonal tunnel geometry, 5 lane markers (-4.0 to +4.0 X coordinates), and hazard anchor slots.
- Implemented `TunnelManager` managing endless segment queues, speed movement (+Z toward player), automatic recycling when passing behind camera (`z > 15`), and rest segment pacing.
- Updated `DebugOverlay` displaying active vs. pooled segment metrics (`Active: 15 | Pool: 10`).
- Unit tests added for PRNG determinism, object pooling, and segment recycling (20 total tests passing).
