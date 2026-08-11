const loginAttempts = new Map();

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function createRateLimiter({ windowMs, maxAttempts, store }) {
  return (req, res, next) => {
    const key = clientIp(req);
    const now = Date.now();
    let record = store.get(key);

    if (!record || now - record.start > windowMs) {
      record = { start: now, count: 0 };
      store.set(key, record);
    }

    record.count += 1;
    if (record.count > maxAttempts) {
      return res.status(429).json({ error: 'Shumë përpjekje. Provoni përsëri më vonë.' });
    }

    next();
  };
}

const loginRateLimit = createRateLimiter({
  windowMs: LOGIN_WINDOW_MS,
  maxAttempts: LOGIN_MAX_ATTEMPTS,
  store: loginAttempts
});

module.exports = { loginRateLimit, clientIp };
