const crypto = require('crypto');

// Legacy format: a bare 64-char hex string = unsalted SHA-256 (insecure, pre-remediation).
const LEGACY_SHA256_RE = /^[0-9a-f]{64}$/i;

// Current format: scrypt$N$r$p$saltHex$hashHex (self-describing, versioned).
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

function legacySha256(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const { N, r, p, keylen } = SCRYPT_PARAMS;
  const hash = crypto.scryptSync(password, salt, keylen, { N, r, p, maxmem: 128 * N * r * 2 });
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function isLegacyHash(stored) {
  return typeof stored === 'string' && LEGACY_SHA256_RE.test(stored);
}

function timingSafeStringEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still do a constant-time compare against a same-length buffer to avoid a
    // length-based timing signal, then fail.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify a password against a stored hash of either format.
 * Returns { valid, legacy } — `legacy: true` means the caller should
 * immediately rehash with hashPassword() and persist the new value.
 */
function verifyPassword(password, stored) {
  if (!stored) return { valid: false, legacy: false };

  if (isLegacyHash(stored)) {
    const valid = timingSafeStringEqual(legacySha256(password), stored);
    return { valid, legacy: valid };
  }

  const parts = String(stored).split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return { valid: false, legacy: false };
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!N || !r || !p) return { valid: false, legacy: false };

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length, { N, r, p, maxmem: 128 * N * r * 2 });
    return { valid: timingSafeStringEqual(actual.toString('hex'), expected.toString('hex')), legacy: false };
  } catch {
    return { valid: false, legacy: false };
  }
}

module.exports = { hashPassword, verifyPassword, isLegacyHash, legacySha256 };
