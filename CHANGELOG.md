# Changelog

All notable changes to the **Cube Dash 3D** project will be documented in this file.

## [1.0.0-step1] - 2026-07-24
### Added
- Scaffolding of project foundation adhering to MegaGameBox offline build contract.
- Added `index.html`, `manifest.json`, `styles/main.css`, and `src/main.js`.
- Configured Vite with `base: './'` for 100% relative path asset resolution.
- Configured Vitest for unit testing.
- Created size reporting (`tools/validate-size.js`) and ZIP packaging script (`tools/bundle.js`).
- Implemented full-screen CSS reset, touch prevention, safe-area support, and boot/error UI shells.
