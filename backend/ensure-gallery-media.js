const { galleryVideos } = require('./gallery-videos');

/**
 * Gallery photos and videos live in two tables but are shown as one feed.
 * `created_at` (epoch ms) is the persistent ordering key for that feed, so it
 * has to exist for every row — including the legacy rows that were seeded
 * before the column was introduced.
 */
const GALLERY_MEDIA_VERSION = '2026-08-unified-media-v1';

// Fixed point in the past: legacy media keeps a stable order across deploys
// while anything uploaded later (Date.now()) lands after it.
const LEGACY_BASE = Date.UTC(2026, 0, 1, 9, 0, 0);
const LEGACY_STEP = 60_000;
// Photos per video when interleaving legacy media (55 photos / 10 videos).
const PHOTOS_PER_VIDEO = 5;

/** Legacy photos and videos were seeded separately; interleave them so the
 *  unified feed does not degrade into "all photos, then all videos". */
function interleave(photoIds, videoIds) {
  const merged = [];
  let v = 0;
  photoIds.forEach((id, i) => {
    merged.push({ table: 'gallery', id });
    if ((i + 1) % PHOTOS_PER_VIDEO === 0 && v < videoIds.length) {
      merged.push({ table: 'videos', id: videoIds[v++] });
    }
  });
  while (v < videoIds.length) merged.push({ table: 'videos', id: videoIds[v++] });
  return merged;
}

function registerStaticVideos(db) {
  const existing = new Set(db.prepare('SELECT src FROM videos').all().map((r) => r.src));
  const insert = db.prepare(
    'INSERT INTO videos (src, thumb, category, title, title_en, sort) VALUES (?, ?, ?, ?, ?, ?)'
  );
  let sort = db.prepare('SELECT COALESCE(MAX(sort), -1) AS m FROM videos').get().m;
  for (const video of galleryVideos) {
    if (existing.has(video.src)) continue;
    insert.run(video.src, video.thumb, video.category, video.title, video.title_en, ++sort);
  }
}

function backfillLegacyTimestamps(db) {
  const photoIds = db
    .prepare('SELECT id FROM gallery WHERE created_at IS NULL ORDER BY sort, id')
    .all()
    .map((r) => r.id);
  const videoIds = db
    .prepare('SELECT id FROM videos WHERE created_at IS NULL ORDER BY sort, id')
    .all()
    .map((r) => r.id);
  if (!photoIds.length && !videoIds.length) return;

  const setPhoto = db.prepare('UPDATE gallery SET created_at = ? WHERE id = ?');
  const setVideo = db.prepare('UPDATE videos SET created_at = ? WHERE id = ?');
  interleave(photoIds, videoIds).forEach((entry, i) => {
    const at = LEGACY_BASE + i * LEGACY_STEP;
    if (entry.table === 'gallery') setPhoto.run(at, entry.id);
    else setVideo.run(at, entry.id);
  });
}

/** Safety net for rows written by an older build: never leave created_at NULL. */
function fillMissingTimestamps(db) {
  for (const table of ['gallery', 'videos']) {
    const rows = db.prepare(`SELECT id FROM ${table} WHERE created_at IS NULL ORDER BY sort, id`).all();
    if (!rows.length) continue;
    const update = db.prepare(`UPDATE ${table} SET created_at = ? WHERE id = ?`);
    const now = Date.now();
    rows.forEach((row, i) => update.run(now + i, row.id));
  }
}

function ensureGalleryMedia(db) {
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  const upsertSetting = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );

  if (getSetting.get('gallery_media_version')?.value !== GALLERY_MEDIA_VERSION) {
    db.transaction(() => {
      registerStaticVideos(db);
      backfillLegacyTimestamps(db);
      upsertSetting.run('gallery_media_version', GALLERY_MEDIA_VERSION);
    })();
  }

  fillMissingTimestamps(db);
}

module.exports = { ensureGalleryMedia, GALLERY_MEDIA_VERSION };
