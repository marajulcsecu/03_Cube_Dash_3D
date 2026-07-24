import fs from 'fs';
import path from 'path';

function getDirSize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  }
  return size;
}

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('[SIZE REPORT] ERROR: dist/ folder does not exist. Run "npm run build" first.');
  process.exit(1);
}

const totalBytes = getDirSize(distDir);
const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

console.log(`\n================ MegaGameBox Size Report ================`);
console.log(`Total Bundle Size: ${totalMB} MB (${totalBytes.toLocaleString()} bytes)`);

if (totalBytes <= 15 * 1024 * 1024) {
  console.log(`Status: 🟢 EXCELLENT - Under ideal target of 15 MB`);
} else if (totalBytes <= 50 * 1024 * 1024) {
  console.log(`Status: 🟡 ACCEPTABLE - Below hard limit of 50 MB`);
} else {
  console.error(`Status: 🔴 REJECTED - Exceeds 50 MB hard limit!`);
  process.exit(1);
}
console.log(`==========================================================\n`);
