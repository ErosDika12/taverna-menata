const loginAttemptsByIp = new Map();
const loginAttemptsByEmail = new Map();

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS_PER_IP = 10;
const LOGIN_MAX_ATTEMPTS_PER_EMAIL = 5;

// Only trust a forwarded-for header when we know the deployment platform
// sets it itself (Vercel, or a correctly configured `trust proxy` in
// Express) — never trust an arbitrary client-supplied X-Forwarded-For,
// which is otherwise trivial to spoof to defeat per-IP throttling.
function clientIp(req) {
  const trustedPlatform = Boolean(process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT);
  if (trustedPlatform) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      // The platform's edge appends the real client IP as the LAST hop it
      // controls is irrelevant here; Vercel's convention is the first entry.
      return forwarded.split(',')[0].trim();
    }
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

function hit(store, key, windowMs, maxAttempts) {
  const now = Date.now();
  let record = store.get(key);
  if (!record || now - record.start > windowMs) {
    record = { start: now, count: 0 };
    store.set(key, record);
  }
  record.count += 1;
  return record.count <= maxAttempts;
}

function loginRateLimit(req, res, next) {
  const ip = clientIp(req);
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 254);

  const ipOk = hit(loginAttemptsByIp, ip, LOGIN_WINDOW_MS, LOGIN_MAX_ATTEMPTS_PER_IP);
  const emailOk = email ? hit(loginAttemptsByEmail, email, LOGIN_WINDOW_MS, LOGIN_MAX_ATTEMPTS_PER_EMAIL) : true;

  if (!ipOk || !emailOk) {
    return res.status(429).json({ error: 'Shumë përpjekje. Provoni përsëri më vonë.' });
  }
  next();
}

// NOTE (serverless limitation): these are in-memory, per-instance counters.
// On Vercel, concurrent requests can land on different warm instances, so
// this limiter does not provide a single global cross-instance rate limit —
// it still meaningfully slows down a single-instance brute force and is
// combined with per-email throttling, but it is not a substitute for an
// external, persistent rate limiter (e.g. Vercel Firewall / a KV-backed
// limiter) if stronger guarantees are needed later.
module.exports = { loginRateLimit, clientIp };
