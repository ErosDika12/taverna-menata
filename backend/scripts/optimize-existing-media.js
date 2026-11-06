/**
 * One-off retrofit for gallery rows uploaded before real thumbnails existed:
 * `thumb` was literally the same file as `image`, so the Gallery grid was
 * downloading the full-size photo once per cell (≈55 photos × a few hundred
 * KB each — the "~16 MB page load" Feston saw).
 *
 * This generates a genuinely small thumbnail for every row where
 * thumb === image, writes it to uploads/gallery/thumbs/, and updates the DB
 * row to point at it. Originals (the `image` column) are NEVER modified or
 * deleted — only a new derivative file is added.
 *
 * Usage: node backend/scripts/optimize-existing-media.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('../db');
const { uploadsRoot } = require('../upload');

const THUMB_MAX_EDGE = 480;
const THUMB_QUALITY = 70;

function diskPathFor(urlPath) {
  // urlPath looks like /uploads/gallery/dsc01234.jpg
  const rel = urlPath.replace(/^\/uploads\//, '');
  const root = uploadsRoot();
  const primary = path.join(root, rel);
  if (fs.existsSync(primary)) return primary;
  // Fallback to the committed backend/uploads tree (local dev / fresh checkout).
  const fallback = path.join(__dirname, '..', 'uploads', rel);
  return fs.existsSync(fallback) ? fallback : null;
}

async function run() {
  const rows = db.prepare('SELECT id, image, thumb FROM gallery').all();
  const legacy = rows.filter((r) => r.thumb === r.image);
  console.log(`${rows.length} gallery rows, ${legacy.length} using the full image as their "thumb".`);

  let done = 0;
  let skipped = 0;
  for (const row of legacy) {
    const srcPath = diskPathFor(row.image);
    if (!srcPath) {
      console.warn(`  skip #${row.id}: source file not found for ${row.image}`);
      skipped += 1;
      continue;
    }
    const base = path.basename(row.image, path.extname(row.image));
    const thumbDir = path.join(path.dirname(srcPath), 'thumbs');
    fs.mkdirSync(thumbDir, { recursive: true });
    const thumbPath = path.join(thumbDir, `${base}.jpg`);

    try {
      await sharp(srcPath)
        .rotate()
        .resize({ width: THUMB_MAX_EDGE, height: THUMB_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
        .toFile(thumbPath);

      const thumbUrl = row.image.replace(/\/gallery\/([^/]+)$/, '/gallery/thumbs/$1').replace(/\.[^.]+$/, '.jpg');
      db.prepare('UPDATE gallery SET thumb = ? WHERE id = ?').run(thumbUrl, row.id);
      done += 1;
    } catch (err) {
      console.warn(`  skip #${row.id}: ${err.message}`);
      skipped += 1;
    }
  }

  console.log(`Done: ${done} thumbnails generated, ${skipped} skipped. Originals untouched.`);
}

run().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
