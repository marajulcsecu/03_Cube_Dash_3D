# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step3] - 2026-07-24
### Added
- Implemented `ResponsiveRenderer` utilizing Three.js WebGLRenderer, capped DPR, and responsive viewport sizing.
- Implemented `MaterialFactory` with custom procedural neon emissive materials, wireframe grids, and atmospheric fog.
- Implemented `SceneFactory` with Camera, Ambient + Directional key lights, and animated 3D geometric tunnel test geometry.
- Implemented `EffectsManager` for speed particles and quality preset scaling (`low`: 40, `medium`: 120, `high`: 250).
- Updated `DebugOverlay` with real-time Draw Calls, Triangles, DPR, and LOW/MED/HIGH quality preset switchers.
- Unit test suite added for renderer and materials (17 total tests passing).
