/**
 * 🎾 Automatic Product Image Scanner for Rally Padel
 * Automatically scans all product directories under frontend/public/images/products/
 * and generates frontend/src/data/productImagesManifest.json.
 * Users can drop any image file (.webp, .jpg, .jpeg, .png, .avif) into a product folder
 * without manual renaming, and it will be instantly recognized by the store.
 */
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.resolve(__dirname, '../public/images/products');
const MANIFEST_PATH = path.resolve(__dirname, '../src/data/productImagesManifest.json');

const IMAGE_EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.gif']);

function scanProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.warn(`[Image Scanner] Products directory not found: ${PRODUCTS_DIR}`);
    return {};
  }

  const manifest = {};
  const brands = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let totalImages = 0;
  let totalProductsWithImages = 0;

  for (const brand of brands) {
    const brandPath = path.join(PRODUCTS_DIR, brand);
    const productDirs = fs.readdirSync(brandPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const prodId of productDirs) {
      const prodPath = path.join(brandPath, prodId);
      const files = fs.readdirSync(prodPath, { withFileTypes: true })
        .filter(f => f.isFile())
        .map(f => f.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return IMAGE_EXTS.has(ext) && !name.startsWith('.');
        });

      // Natural sort
      files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      if (files.length > 0) {
        manifest[prodId] = files.map(file => `/images/products/${brand}/${prodId}/${file}`);
        totalImages += files.length;
        totalProductsWithImages++;
      } else {
        manifest[prodId] = [];
      }
    }
  }

  const outDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Image Scanner] ✅ Scanned ${totalProductsWithImages} products with ${totalImages} total images.`);
  return manifest;
}

if (require.main === module) {
  scanProducts();
}

module.exports = { scanProducts };
