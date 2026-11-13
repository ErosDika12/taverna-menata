const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');

function uploadsRoot() {
  if (process.env.DATA_DIR) return path.join(process.env.DATA_DIR, 'uploads');
  return process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Filenames never depend on the client-supplied original name — only on a
// random id plus a `.tmp` placeholder extension. This removes double-
// extension / path-traversal / disguised-name tricks at the source,
// independent of the magic-byte check below, which fixes the real extension
// once the actual file content has been verified.
function imageStorage(subdir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(uploadsRoot(), subdir);
      try {
        ensureDir(dir);
        cb(null, dir);
      } catch (err) {
        cb(err);
      }
    },
    filename: (_req, _file, cb) => {
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.tmp`);
    }
  });
}

const imageFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Vetëm foto (JPG, PNG, WebP, GIF).'));
};

const videoFilter = (_req, file, cb) => {
  if (/^video\/(mp4|webm|quicktime|x-msvideo)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Vetëm video (MP4, WebM, MOV).'));
};

// --- Magic-byte verification (defense in depth beyond the client-reported
// MIME type, which is trivially spoofable). Runs AFTER multer has written
// the file; if the real bytes don't match any allowed signature, the file
// is deleted and the upload is rejected before it is ever referenced by the
// database or served from /uploads. SVG is never accepted, even if someone
// renames one with an allowed extension/mimetype, because it has no entry
// in either signature table below.
const IMAGE_SIGNATURES = [
  { ext: 'jpg', match: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: 'png',
    match: (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  },
  {
    ext: 'webp',
    match: (b) => b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP'
  },
  {
    ext: 'gif',
    match: (b) => b.length >= 6 && (b.subarray(0, 6).toString('latin1') === 'GIF87a' || b.subarray(0, 6).toString('latin1') === 'GIF89a')
  }
];

const VIDEO_SIGNATURES = [
  // MP4 / MOV / QuickTime: an ftyp box starting at byte 4.
  { ext: 'mp4', match: (b) => b.length >= 12 && b.subarray(4, 8).toString('latin1') === 'ftyp' },
  // WebM / Matroska: EBML header.
  { ext: 'webm', match: (b) => b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
  // AVI: RIFF....AVI
  {
    ext: 'avi',
    match: (b) => b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 11).toString('latin1') === 'AVI'
  }
];

function detectSignature(buf, signatures) {
  for (const sig of signatures) {
    try {
      if (sig.match(buf)) return sig.ext;
    } catch {
      /* ignore and try next */
    }
  }
  return null;
}

function verifyMagicBytes(kind) {
  const signatures = kind === 'video' ? VIDEO_SIGNATURES : IMAGE_SIGNATURES;
  const label = kind === 'video' ? 'Vetëm video (MP4, WebM, MOV).' : 'Vetëm foto (JPG, PNG, WebP, GIF).';

  return (req, res, next) => {
    const file = req.file;
    if (!file) return next();

    let fd;
    try {
      fd = fs.openSync(file.path, 'r');
      const head = Buffer.alloc(32);
      const bytesRead = fs.readSync(fd, head, 0, 32, 0);
      fs.closeSync(fd);
      fd = undefined;
      const ext = detectSignature(head.subarray(0, bytesRead), signatures);

      if (!ext) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: label });
      }

      const finalName = file.filename.replace(/\.tmp$/, `.${ext}`);
      const finalPath = path.join(path.dirname(file.path), finalName);
      fs.renameSync(file.path, finalPath);
      file.filename = finalName;
      file.path = finalPath;
      next();
    } catch (err) {
      if (fd !== undefined) {
        try { fs.closeSync(fd); } catch { /* already closed */ }
      }
      try { fs.unlinkSync(file.path); } catch { /* best effort cleanup */ }
      next(err);
    }
  };
}

// --- Upload-time image optimization (new uploads only; see
// scripts/optimize-existing-media.js for retrofitting old files).
//
// Every accepted image is re-encoded through sharp: this normalizes EXIF
// orientation, strips EXIF/GPS metadata (sharp drops it by default unless
// withMetadata() is called — we never call it, which is deliberate, not an
// oversight), caps the long edge so a 16 MB phone photo never ships as-is,
// and re-encodes as JPEG at a sane quality for the web. A phone's 4000px+
// original becomes one reasonably sized "web" file plus, for gallery
// photos, a genuinely small thumbnail — previously `thumb` was just a
// second reference to the exact same full file, so the grid was
// downloading the full-size image once per cell.
const WEB_MAX_EDGE = 2000;
const WEB_QUALITY = 82;
const THUMB_MAX_EDGE = 480;
const THUMB_QUALITY = 70;
// Menu and gallery photos all share one 4:5 frame (the admin crops them to it in the browser;
// this is the server-side guarantee in case an uncropped image arrives).
const PHOTO_WIDTH = 1080;
const PHOTO_HEIGHT = 1350;

async function reencode(srcPath, destPath, maxEdge, quality, { portrait = false } = {}) {
  const resize = portrait
    ? { width: PHOTO_WIDTH, height: PHOTO_HEIGHT, fit: 'cover', position: 'centre' }
    : { width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true };
  await sharp(srcPath)
    .rotate() // apply EXIF orientation, then...
    .resize(resize)
    .jpeg({ quality, mozjpeg: true })
    .toFile(destPath); // ...metadata is dropped by not calling withMetadata()
}

/**
 * Runs after verifyMagicBytes. Replaces req.file's on-disk image with a
 * resized/re-encoded/EXIF-stripped JPEG (always .jpg, regardless of the
 * original format — simplest consistent output for the public site).
 * When `withThumb` is true, also writes a small thumbnail next to it and
 * sets req.thumbFilename so the route can store its own URL.
 */
function optimizeImage({ withThumb = false, portrait = false } = {}) {
  return async (req, res, next) => {
    const file = req.file;
    if (!file) return next();

    const dir = path.dirname(file.path);
    const base = path.basename(file.filename, path.extname(file.filename));
    const webPath = path.join(dir, `${base}.jpg`);

    try {
      // sharp can't read and write the same file, which happens whenever the upload is already a .jpg.
      const tmpPath = path.join(dir, `${base}.tmp.jpg`);
      await reencode(file.path, tmpPath, WEB_MAX_EDGE, WEB_QUALITY, { portrait });
      fs.unlinkSync(file.path);
      fs.renameSync(tmpPath, webPath);
      file.filename = `${base}.jpg`;
      file.path = webPath;

      if (withThumb) {
        const thumbDir = path.join(dir, 'thumbs');
        ensureDir(thumbDir);
        const thumbPath = path.join(thumbDir, `${base}.jpg`);
        await reencode(webPath, thumbPath, THUMB_MAX_EDGE, THUMB_QUALITY);
        req.thumbFilename = `${base}.jpg`;
      }
      next();
    } catch (err) {
      try { fs.unlinkSync(file.path); } catch { /* best effort cleanup */ }
      next(new Error('Fotoja nuk u përpunua. Provoni një foto tjetër.'));
      void err;
    }
  };
}

module.exports = {
  uploadsRoot,
  uploadImage: multer({ storage: imageStorage('gallery'), limits: { fileSize: 12 * 1024 * 1024 }, fileFilter: imageFilter }),
  uploadThumb: multer({ storage: imageStorage('gallery/thumbs'), limits: { fileSize: 4 * 1024 * 1024 }, fileFilter: imageFilter }),
  uploadMenuImage: multer({ storage: imageStorage('menu'), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: imageFilter }),
  uploadVideo: multer({ storage: imageStorage('videos'), limits: { fileSize: 200 * 1024 * 1024 }, fileFilter: videoFilter }),
  uploadVideoThumb: multer({ storage: imageStorage('videos/thumbs'), limits: { fileSize: 4 * 1024 * 1024 }, fileFilter: imageFilter }),
  verifyImageMagicBytes: verifyMagicBytes('image'),
  verifyVideoMagicBytes: verifyMagicBytes('video'),
  optimizeMenuImage: optimizeImage({ withThumb: false, portrait: true }),
  optimizeVideoThumb: optimizeImage({ withThumb: false }),
  toUrl: (filename, subdir) => `/uploads/${subdir}/${filename}`
};
