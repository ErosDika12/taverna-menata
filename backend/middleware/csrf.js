// Cookie-based auth needs CSRF protection for state-changing requests: with
// SameSite=Strict the cookie already won't be sent cross-site by a browser
// that honors it, but we defense-in-depth it by also requiring the request's
// Origin (or Referer, as a fallback) to match our own host.
function sameOriginGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;

  const sourceOrigin = origin || (referer ? new URL(referer).origin : null);
  if (!sourceOrigin || !host) {
    return res.status(403).json({ error: 'Kërkesa u refuzua (origin mungon).' });
  }

  let sourceHost;
  try {
    sourceHost = new URL(sourceOrigin).host;
  } catch {
    return res.status(403).json({ error: 'Kërkesa u refuzua (origin i pavlefshëm).' });
  }

  if (sourceHost !== host) {
    return res.status(403).json({ error: 'Kërkesa u refuzua (origin nuk përputhet).' });
  }

  next();
}

module.exports = { sameOriginGuard };
