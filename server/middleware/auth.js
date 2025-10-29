import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'chefs_admin_token';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const AUTH_JWT_EXPIRES = process.env.AUTH_JWT_EXPIRES || '1d';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SECURE = String(process.env.COOKIE_SECURE || 'false') === 'true';

function parseDuration(str) {
  if (!str) return 24 * 60 * 60 * 1000;
  const m = String(str).trim().match(/^(\d+)([smhd])?$/i);
  if (!m) return 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const u = (m[2] || 'd').toLowerCase();
  switch (u) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'd':
    default: return n * 24 * 60 * 60 * 1000;
  }
}

export function signAdminToken(payload) {
  const expiresIn = AUTH_JWT_EXPIRES || '1d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function setAuthCookie(res, token) {
  const maxAge = parseDuration(AUTH_JWT_EXPIRES);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge,
    path: '/',
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  });
}

export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify in DB and ensure active
    const { rows } = await pool.query(
      'SELECT id, email, username, full_name, role, is_active FROM admin_users WHERE id = $1 LIMIT 1',
      [decoded.id]
    );
    if (!rows || rows.length === 0 || rows[0].is_active === 0 || rows[0].is_active === false) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.admin = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.length === 0 || roles.includes(req.admin.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
