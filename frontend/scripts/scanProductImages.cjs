/**
 * 🎾 Automatic Hierarchical Product Image Scanner for Rally Padel
 * Automatically scans all product directories under frontend/public/images/products/
 * Supports both brand/category/productId and brand/productId structures.
 * Generates frontend/src/data/productImagesManifest.json.
 */
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.resolve(__dirname, '../public/images/products');
const MANIFEST_PATH = path.resolve(__dirname, '../src/data/productImagesManifest.json');

const IMAGE_EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.gif']);

// Explicit official NOX image ordering for AT10 Genius 18K 2026
const NOX_AT10_OFFICIAL_ORDER = [
  '2175122', // Front full vertical face (Official Cover)
  '1209547', // Back full vertical face
  '1455245', // Perspective head angle
  '1838201', // Throat & EOS Flap channel
  '4644431', // Grip / Handle
  '6270211', // Weight balance system
  '6842940', // 18K Alum Carbon texture
  '3999125', // Cover bag
  '3665571', // Smartstrap wrist cord
  '7712926', // Frame side edge
  '8488739', // Custom grip detail
  '9499662', // Dual spin 3D surface
  '6203404', // Bridge structure
  '6455093', // Detail angle
  '5064774'  // Frame bumper
];

// Exclude player photos (Agustín Tapia holding racket)
const EXCLUDED_PATTERNS = ['7428756', '7600067', 'tapia-palas'];

function findProductFolders(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = path.join(dir, entry.name);
        let subEntries = [];
        try {
          subEntries = fs.readdirSync(subPath, { withFileTypes: true });
        } catch {
          continue;
        }
        const hasSubDirs = subEntries.some(e => e.isDirectory());
        if (!hasSubDirs || entry.name.startsWith('nox-') || entry.name.startsWith('head-')) {
          results.push(subPath);
        } else {
          results.push(...findProductFolders(subPath));
        }
      }
    }
  } catch (err) {
    console.warn(`[Image Scanner] Error scanning ${dir}:`, err.message);
  }
  return results;
}

function scanProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.warn(`[Image Scanner] Products directory not found: ${PRODUCTS_DIR}`);
    return {};
  }

  const manifest = {};
  const productFolders = findProductFolders(PRODUCTS_DIR);

  let totalImages = 0;
  let totalProductsWithImages = 0;

  for (const prodPath of productFolders) {
    const prodId = path.basename(prodPath);
    const relDir = path.relative(PRODUCTS_DIR, prodPath).replace(/\\/g, '/');

    let files = [];
    try {
      files = fs.readdirSync(prodPath, { withFileTypes: true })
        .filter(f => f.isFile())
        .map(f => f.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return IMAGE_EXTS.has(ext) && !name.startsWith('.');
        });
    } catch {
      continue;
    }

    const filteredFiles = files.filter(f => !EXCLUDED_PATTERNS.some(pat => f.includes(pat)));

    if (prodId === 'nox-at10-genius-18k-2026') {
      filteredFiles.sort((a, b) => {
        const idxA = NOX_AT10_OFFICIAL_ORDER.findIndex(key => a.includes(key));
        const idxB = NOX_AT10_OFFICIAL_ORDER.findIndex(key => b.includes(key));
        const rankA = idxA !== -1 ? idxA : 999;
        const rankB = idxB !== -1 ? idxB : 999;
        return rankA - rankB;
      });
    } else {
      filteredFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }

    if (filteredFiles.length > 0) {
      manifest[prodId] = filteredFiles.map(file => `/images/products/${relDir}/${file}`);
      totalImages += filteredFiles.length;
      totalProductsWithImages++;
    } else {
      manifest[prodId] = [];
    }
  }

  const outDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Image Scanner] ✅ Hierarchical scan complete: ${totalProductsWithImages} products with images, ${totalImages} total images.`);
  return manifest;
}

if (require.main === module) {
  scanProducts();
}

module.exports = { scanProducts };
