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

function normalizeEmail(req) {
  return String(req.body?.email || '').trim().toLowerCase().slice(0, 254);
}

function getRecord(store, key, windowMs) {
  const now = Date.now();
  const record = store.get(key);
  if (!record || now - record.start > windowMs) return null; // expired or never recorded
  return record;
}

function msUntilReset(record, windowMs) {
  return Math.max(0, windowMs - (Date.now() - record.start));
}

/**
 * Only FAILED login attempts count toward the lockout — this middleware
 * just checks the current state, it never increments anything. A burst of
 * successful logins (e.g. this account being used for routine admin work,
 * or test scripts) must never trip the limiter; only wrong-password/
 * wrong-email attempts should. See recordLoginFailure/recordLoginSuccess.
 */
function loginRateLimit(req, res, next) {
  const ip = clientIp(req);
  const email = normalizeEmail(req);

  const ipRecord = getRecord(loginAttemptsByIp, ip, LOGIN_WINDOW_MS);
  const emailRecord = email ? getRecord(loginAttemptsByEmail, email, LOGIN_WINDOW_MS) : null;

  const ipBlocked = ipRecord && ipRecord.count >= LOGIN_MAX_ATTEMPTS_PER_IP;
  const emailBlocked = emailRecord && emailRecord.count >= LOGIN_MAX_ATTEMPTS_PER_EMAIL;

  if (ipBlocked || emailBlocked) {
    const retryMs = Math.max(
      ipBlocked ? msUntilReset(ipRecord, LOGIN_WINDOW_MS) : 0,
      emailBlocked ? msUntilReset(emailRecord, LOGIN_WINDOW_MS) : 0
    );
    res.setHeader('Retry-After', String(Math.ceil(retryMs / 1000)));
    return res.status(429).json({ error: 'Shumë përpjekje. Provoni përsëri më vonë.', retryAfterSeconds: Math.ceil(retryMs / 1000) });
  }
  next();
}

/** Call on a failed login (wrong password, unknown email, suspended account). */
function recordLoginFailure(req) {
  const ip = clientIp(req);
  const email = normalizeEmail(req);
  const now = Date.now();

  for (const [store, key] of [[loginAttemptsByIp, ip], ...(email ? [[loginAttemptsByEmail, email]] : [])]) {
    const existing = store.get(key);
    if (!existing || now - existing.start > LOGIN_WINDOW_MS) {
      store.set(key, { start: now, count: 1 });
    } else {
      existing.count += 1;
    }
  }
}

/**
 * Call on a successful login. Clears this email's failure counter outright
 * (the legitimate owner just proved who they are) and the IP's too — a
 * shared IP (office Wi-Fi, etc.) having one successful login shouldn't
 * leave a stale failure count sitting there either. This is NOT a
 * whitelist/bypass: it only ever resets a counter in response to a
 * correctly authenticated request that already passed the password check;
 * it grants no access on its own and an attacker who can't authenticate
 * never reaches this function.
 */
function recordLoginSuccess(req) {
  const ip = clientIp(req);
  const email = normalizeEmail(req);
  loginAttemptsByIp.delete(ip);
  if (email) loginAttemptsByEmail.delete(email);
}

// NOTE (serverless limitation): these are in-memory, per-instance counters.
// On Vercel, concurrent requests can land on different warm instances, so
// this limiter does not provide a single global cross-instance rate limit —
// it still meaningfully slows down a single-instance brute force and is
// combined with per-email throttling, but it is not a substitute for an
// external, persistent rate limiter (e.g. Vercel Firewall / a KV-backed
// limiter) if stronger guarantees are needed later.
module.exports = { loginRateLimit, recordLoginFailure, recordLoginSuccess, clientIp };
