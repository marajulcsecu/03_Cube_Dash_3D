# Cube Dash 3D

Offline-first 3D arcade tunnel runner built for MegaGameBox.

## Features
- Premium 3D geometric visuals powered by Three.js
- Portrait-first, one-handed mobile touch controls (swipe & tap)
- 100% offline-first execution with local bundling and zero remote network calls
- Seamless integration with MegaGameBox `GameBridge` API

## Development Workflow

### Install Dependencies
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```

### Run Automated Unit Tests
```bash
npm run test
```

### Production Build
Generates the self-contained `./dist` production folder with relative asset paths and prints a size audit.
```bash
npm run build
```

### Package Release ZIP
Generates `cube-dash-3d.zip` containing `index.html` and `manifest.json` at the root directory of the archive.
```bash
npm run bundle
```

### Validate Bundle Size
```bash
npm run size-report
```
