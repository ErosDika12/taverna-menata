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

const imageFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Vetëm foto (JPG, PNG, WebP).'));
};

const videoFilter = (_req, file, cb) => {
  if (/^video\/(mp4|webm|quicktime|x-msvideo)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Vetëm video (MP4, WebM, MOV).'));
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
