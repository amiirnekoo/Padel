const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../public');
const destDir = path.resolve(__dirname, '../dist');

function copySafe(src, dest) {
  if (!fs.existsSync(src)) return;
  try {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const items = fs.readdirSync(src);
      for (const item of items) {
        copySafe(path.join(src, item), path.join(dest, item));
      }
    } else {
      const parent = path.dirname(dest);
      if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }
  } catch (err) {
    // Gracefully skip inaccessible or Google Drive locked stubs
  }
}

copySafe(srcDir, destDir);
console.log('[Safe Copy] ✅ Public assets safely synced to dist.');
