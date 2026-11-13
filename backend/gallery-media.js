// Gallery photo pipeline: the Admin uploads ONE source image plus a crop
// rectangle, and the server produces every public size.
//
// Only two public formats exist:
//   portrait  4:5  -> 1080×1350 full size
//   landscape 4:3  -> 1440×1080 full size
//
// The browser only names the format ("portrait" | "landscape") and sends the
// crop as fractions of the image. The server re-decodes the source, applies
// EXIF rotation, validates the crop, rejects sources that would need
// significant upscaling, and writes WebP derivatives. Output carries no
// EXIF/GPS metadata (sharp drops it unless withMetadata() is called).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const FORMATS = {
  portrait: {
    ratio: 4 / 5,
    minCrop: { width: 900, height: 1125 },
    full: { width: 1080, height: 1350 },
    variants: { small: [360, 450], medium: [720, 900], large: [1080, 1350] }
  },
  landscape: {
    ratio: 4 / 3,
    minCrop: { width: 1200, height: 900 },
    full: { width: 1440, height: 1080 },
    variants: { small: [480, 360], medium: [960, 720], large: [1440, 1080] }
  }
};

const MSG = {
  lowRes: {
    error: 'Fotoja ka rezolucion shumë të ulët. Ju lutem ngarkoni një foto me cilësi më të lartë.',
    error_en: 'The image resolution is too low. Please upload a higher-quality image.'
  },
  badFormat: {
    error: 'Zgjidhni formatin: Portret 4:5 ose Horizontale 4:3.',
    error_en: 'Choose a format: Portrait 4:5 or Landscape 4:3.'
  },
  badCrop: {
    error: 'Pjesa e zgjedhur nuk është e vlefshme. Provoni përsëri.',
    error_en: 'The selected crop is not valid. Please try again.'
  },
  notImage: {
    error: 'Skedari nuk është një foto e vlefshme.',
    error_en: 'The file is not a valid photo.'
  }
};

function parseCrop(raw) {
  let c = raw;
  if (typeof raw === 'string') {
    try {
      c = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!c || typeof c !== 'object') return null;
  const { x, y, w, h } = c;
  if (![x, y, w, h].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
  if (x < 0 || y < 0 || w <= 0 || h <= 0) return null;
  if (x + w > 1.0001 || y + h > 1.0001) return null;
  return { x, y, w, h };
}

/**
 * Processes one uploaded photo. Returns { ok: true, ... } or { ok: false, status, error, error_en }.
 * `srcPath` is the verified upload; it is moved to `originalsDir` on success so
 * the untouched source can be kept without being served publicly.
 */
async function processGalleryPhoto({ srcPath, outDir, originalsDir, baseName, format, cropRaw }) {
  const spec = FORMATS[format];
  if (!spec) return { ok: false, status: 400, ...MSG.badFormat };

  const crop = parseCrop(cropRaw);
  if (!crop) return { ok: false, status: 400, ...MSG.badCrop };

  let decoded;
  try {
    // rotate() applies EXIF orientation so width/height describe what people see.
    decoded = await sharp(srcPath).rotate().toBuffer({ resolveWithObject: true });
  } catch {
    return { ok: false, status: 400, ...MSG.notImage };
  }

  const srcW = decoded.info.width;
  const srcH = decoded.info.height;
  const left = Math.round(crop.x * srcW);
  const top = Math.round(crop.y * srcH);
  const width = Math.min(Math.round(crop.w * srcW), srcW - left);
  const height = Math.min(Math.round(crop.h * srcH), srcH - top);

  if (width < spec.minCrop.width || height < spec.minCrop.height) {
    return { ok: false, status: 422, ...MSG.lowRes };
  }
  if (Math.abs(width / height - spec.ratio) > 0.01) {
    return { ok: false, status: 400, ...MSG.badCrop };
  }

  fs.mkdirSync(outDir, { recursive: true });
  const cropped = sharp(decoded.data).extract({ left, top, width, height });
  const files = {};
  for (const [label, [w, h]] of Object.entries(spec.variants)) {
    const name = `${baseName}-${label}.webp`;
    await cropped.clone().resize(w, h, { fit: 'fill' }).webp({ quality: 82, effort: 4 }).toFile(path.join(outDir, name));
    files[label] = name;
  }

  fs.mkdirSync(originalsDir, { recursive: true });
  fs.renameSync(srcPath, path.join(originalsDir, path.basename(srcPath)));

  return {
    ok: true,
    orientation: format,
    width: spec.full.width,
    height: spec.full.height,
    variants: files
  };
}

module.exports = { processGalleryPhoto, parseCrop, FORMATS };
