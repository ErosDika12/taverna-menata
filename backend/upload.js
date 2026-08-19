const fs = require('fs');
const path = require('path');
const multer = require('multer');

function uploadsRoot() {
  return process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

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
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
      cb(null, `${Date.now()}-${safe}`);
    }
  });
}

const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.avi']);

function extOf(filename) {
  const dot = String(filename).lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

const imageFilter = (_req, file, cb) => {
  const ext = extOf(file.originalname);
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) && ALLOWED_IMAGE_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Vetëm foto (JPG, PNG, WebP, GIF).'));
  }
};

const videoFilter = (_req, file, cb) => {
  const ext = extOf(file.originalname);
  if (/^video\/(mp4|webm|quicktime|x-msvideo)$/.test(file.mimetype) && ALLOWED_VIDEO_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Vetëm video (MP4, WebM, MOV).'));
  }
};

module.exports = {
  uploadsRoot,
  uploadImage: multer({ storage: imageStorage('gallery'), limits: { fileSize: 12 * 1024 * 1024 }, fileFilter: imageFilter }),
  uploadThumb: multer({ storage: imageStorage('gallery/thumbs'), limits: { fileSize: 4 * 1024 * 1024 }, fileFilter: imageFilter }),
  uploadMenuImage: multer({ storage: imageStorage('menu'), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: imageFilter }),
  uploadVideo: multer({ storage: imageStorage('videos'), limits: { fileSize: 200 * 1024 * 1024 }, fileFilter: videoFilter }),
  uploadVideoThumb: multer({ storage: imageStorage('videos/thumbs'), limits: { fileSize: 4 * 1024 * 1024 }, fileFilter: imageFilter }),
  toUrl: (filename, subdir) => `/uploads/${subdir}/${filename}`
};
