// Weekly backup of the database and uploaded media to Cloudflare R2.
// Runs inside the long-lived server (see server.js), or manually with `npm run backup`.
// Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET; without them it stays off.
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand
} = require('@aws-sdk/client-s3');
const db = require('./db');
const { uploadsRoot } = require('./upload');

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;
const FIRST_CHECK_DELAY_MS = 60 * 1000;
const KEEP_DB_BACKUPS = 8;
const LAST_BACKUP_KEY = 'last_backup_at';

function r2Config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  return {
    bucket: R2_BUCKET,
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }
    })
  };
}

async function listKeys({ client, bucket }, prefix) {
  const keys = [];
  let token;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })
    );
    for (const obj of page.Contents || []) keys.push(obj.Key);
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, base);
    return [path.relative(base, full).split(path.sep).join('/')];
  });
}

async function putFile({ client, bucket }, key, filePath) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentLength: fs.statSync(filePath).size
    })
  );
}

async function backupDatabase(r2) {
  const day = new Date().toISOString().slice(0, 10);
  const snapshot = path.join(os.tmpdir(), `menata-backup-${Date.now()}.db`);
  // better-sqlite3's online backup gives a consistent copy even while the site is writing.
  await db.backup(snapshot);
  try {
    await putFile(r2, `db/menata-${day}.db`, snapshot);
  } finally {
    fs.rmSync(snapshot, { force: true });
  }

  // Dated names sort chronologically, so the oldest ones come first.
  const old = (await listKeys(r2, 'db/')).sort().slice(0, -KEEP_DB_BACKUPS);
  if (old.length) {
    await r2.client.send(
      new DeleteObjectsCommand({ Bucket: r2.bucket, Delete: { Objects: old.map((Key) => ({ Key })) } })
    );
  }
}

// Uploaded files never change after upload (names are timestamped), so only new ones are sent.
async function backupUploads(r2) {
  const root = uploadsRoot();
  const existing = new Set(await listKeys(r2, 'uploads/'));
  let sent = 0;
  for (const rel of listFiles(root)) {
    const key = `uploads/${rel}`;
    if (existing.has(key)) continue;
    await putFile(r2, key, path.join(root, rel));
    sent += 1;
  }
  return sent;
}

async function runBackup() {
  const r2 = r2Config();
  if (!r2) throw new Error('R2 is not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).');
  await backupDatabase(r2);
  const sent = await backupUploads(r2);
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(LAST_BACKUP_KEY, String(Date.now()));
  console.log(`Backup to R2 done (database + ${sent} new media files).`);
}

function startBackupSchedule() {
  if (!r2Config()) {
    console.log('R2 backup is off (R2_* variables not set).');
    return;
  }
  let running = false;
  async function check() {
    if (running) return;
    const last = Number(db.prepare('SELECT value FROM settings WHERE key = ?').get(LAST_BACKUP_KEY)?.value || 0);
    if (Date.now() - last < WEEK_MS) return;
    running = true;
    try {
      await runBackup();
    } catch (err) {
      console.error('R2 backup failed:', err.message);
    } finally {
      running = false;
    }
  }
  setTimeout(check, FIRST_CHECK_DELAY_MS);
  setInterval(check, CHECK_EVERY_MS).unref();
}

module.exports = { runBackup, startBackupSchedule };

if (require.main === module) {
  runBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
