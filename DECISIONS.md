# Architectural Decisions Record

## ADR 001: Vite as Build Tool with Relative Base Path
- **Status**: Approved
- **Context**: MegaGameBox runs games inside an embedded Flutter WebView served via a local web server (e.g. `http://localhost:8080/index.html`). Absolute paths like `/assets/...` fail.
- **Decision**: Set Vite `base: './'` in `vite.config.js` to ensure all bundled script and asset imports resolve relatively.

## ADR 002: Local ES Modules and Three.js Bundling
- **Status**: Approved
- **Context**: PRD requires 100% offline trust with zero remote CDN dependencies.
- **Decision**: Install `three` as an npm dependency and bundle it locally into production assets using Vite.

## ADR 003: Root-Level Zip Packaging Contract
- **Status**: Approved
- **Context**: MegaGameBox validator fails if `index.html` or `manifest.json` is wrapped inside a subfolder inside the uploaded zip archive.
- **Decision**: Created `tools/bundle.js` using JSZip to bundle the contents of `dist/` directly at the root of `cube-dash-3d.zip`.
