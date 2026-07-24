import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const distDir = path.resolve(process.cwd(), 'dist');
const zipOutputPath = path.resolve(process.cwd(), 'cube-dash-3d.zip');

if (!fs.existsSync(distDir)) {
  console.error('[BUNDLE] ERROR: dist/ folder missing. Build project first.');
  process.exit(1);
}

// Ensure manifest.json and index.html exist in dist
if (!fs.existsSync(path.join(distDir, 'index.html')) || !fs.existsSync(path.join(distDir, 'manifest.json'))) {
  console.error('[BUNDLE] ERROR: index.html or manifest.json missing from dist root!');
  process.exit(1);
}

const zip = new JSZip();

function addFilesToZip(dirPath, zipFolder) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      addFilesToZip(filePath, zipFolder.folder(file));
    } else {
      const fileData = fs.readFileSync(filePath);
      zipFolder.file(file, fileData);
    }
  }
}

console.log('[BUNDLE] Packaging dist/ directory into root-level zip...');
addFilesToZip(distDir, zip);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((buffer) => {
  fs.writeFileSync(zipOutputPath, buffer);
  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`[BUNDLE] Successfully created ${zipOutputPath} (${sizeMB} MB)`);
  console.log('[BUNDLE] Verified: index.html and manifest.json are at zip root.');
}).catch((err) => {
  console.error('[BUNDLE] Packaging failed:', err);
  process.exit(1);
});
