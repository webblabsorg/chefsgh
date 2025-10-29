// Simple in-memory rate limiter middleware
// Not suitable for multi-instance deployments; replace with a shared store in production

const buckets = new Map();

function now() {
  return Date.now();
}

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, keyGenerator } = {}) {
  return (req, res, next) => {
    const key = (keyGenerator ? keyGenerator(req) : `${req.ip}:${req.path}`) || `${req.ip}:${req.path}`;
    const t = now();
    let b = buckets.get(key);
    if (!b || t - b.start >= windowMs) {
      b = { start: t, count: 0 };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) {
      const retryAfter = Math.ceil((b.start + windowMs - t) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}
