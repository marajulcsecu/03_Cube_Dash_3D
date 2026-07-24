# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step6] - 2026-07-24
### Added
- Delivered complete Vertical Slice playable core!
- Implemented `CollisionSystem` providing AABB bounding box collision checks, forgiving player hitbox margins (10% tolerance), and sub-step floor gap fall detection.
- Implemented obstacle families: Amber Lane Walls, Low Barriers (requires jump), Floor Gaps, and Energy Shards.
- Implemented `GAME_OVER` death flow displaying **SYSTEM COLLISION** reason (`Obstacle Impact` or `Floor Gap Fall`) and one-tap **REPLAY RUN** restart.
- Added unit tests for wall collisions, low barrier jumping clearance, floor gap falls, and energy shard collection (30 total tests passing).
