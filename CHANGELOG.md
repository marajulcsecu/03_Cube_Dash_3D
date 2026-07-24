# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step5] - 2026-07-24
### Added
- Implemented `InputManager` supporting 5-lane touch swipes (left/right), swipe-up jump, lower-zone screen tap jump, keyboard fallbacks (Arrow keys, A/D, Space), and `preventDefault()` touch-action protection against browser page scrolling/zooming.
- Implemented `PlayerController` with 5-lane positions (-4.0 to +4.0 X coordinates), time-based cubic eased lane transitions, queued-input cap (max 1 move), deterministic jump curve (gravity & initial velocity), coyote window (100ms), and landing/takeoff squash & stretch visual deformations.
- Unit tests added for 5-lane boundary clamping, jump mechanics, queued input, and 30/60/120 Hz time-step consistency (26 total tests passing).
