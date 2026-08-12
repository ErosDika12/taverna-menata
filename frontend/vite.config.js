import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(__dirname, '../backend/uploads');
const backend = process.env.VITE_API_URL || 'http://localhost:4000';

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime'
};

function serveLocalUploads() {
  function handler(req, res, next) {
    const rel = decodeURIComponent((req.url || '').split('?')[0] || '');
    const filePath = path.normalize(path.join(uploadsRoot, rel));
    if (!filePath.startsWith(uploadsRoot + path.sep) && filePath !== uploadsRoot) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      next();
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', CONTENT_TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(filePath).pipe(res);
  }

  return {
    name: 'serve-local-uploads',
    configureServer(server) {
      server.middlewares.use('/uploads', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/uploads', handler);
    }
  };
}

export default defineConfig({
  plugins: [react(), serveLocalUploads()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': backend
      // /uploads is served from backend/uploads on disk (existing project photos)
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/api': backend
    }
  }
});
