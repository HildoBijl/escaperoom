// scripts/merge-builds.cjs
const fs = require('fs');
const path = require('path');

const rootDist = path.resolve(__dirname, '..', 'dist');
const newDist = path.resolve(__dirname, '..', 'apps', 'escape_a_2025', 'dist');
const oldDist = path.resolve(__dirname, '..', 'apps', 'escape_b_2024', 'dist');
const oldTarget = path.join(rootDist, '2024');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('Source folder does not exist:', src);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// clean+recreate dist
fs.rmSync(rootDist, { recursive: true, force: true });
fs.mkdirSync(rootDist, { recursive: true });

// 1) copy NEW app dist -> dist/
copyDir(newDist, rootDist);

// 2) copy OLD app dist -> dist/2024/
copyDir(oldDist, oldTarget);

console.log('Merged builds into', rootDist);
