import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { clearAuthCookie, requireAdmin, setAuthCookie, signAdminToken } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import { rateLimit } from '../middleware/rateLimit.js';
import { logAudit } from '../services/audit.js';

const router = Router();

router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, keyGenerator: (req) => `${req.ip}:login` }), async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const identifier = email || username;
    const byField = email ? 'email' : 'username';
    const [rows] = await pool.execute(
      `SELECT id, email, username, full_name, password_hash, role, is_active
       FROM admin_users WHERE ${byField} = $1 LIMIT 1`,
      [identifier]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const admin = rows[0];
    if (!admin.is_active) return res.status(403).json({ error: 'Account disabled' });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signAdminToken({ id: admin.id, role: admin.role });
    setAuthCookie(res, token);

    const response = {
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        full_name: admin.full_name,
        role: admin.role,
      },
    };

    // Audit: login success
    try {
      await logAudit({
        action: 'ADMIN_LOGIN',
        entity_type: 'admin',
        entity_id: admin.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || '',
        new_values: { email: admin.email },
      });
    } catch {}

    return res.json(response);
  } catch (err) {
    console.error('Login failed', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAdmin, async (req, res) => {
  return res.json({ admin: req.admin });
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

export default router;

// Forgot password: send email with reset token
router.post('/forgot', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, keyGenerator: (req) => `${req.ip}:forgot` }), async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.json({ ok: true }); // generic response

    const [rows] = await pool.execute(
      `SELECT id, email, full_name, is_active FROM admin_users WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (rows.length === 0 || rows[0].is_active === 0) {
      return res.json({ ok: true }); // do not leak
    }

    const admin = rows[0];
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
    const expiresIn = process.env.AUTH_RESET_EXPIRES || '15m';
    const token = (await import('jsonwebtoken')).then((m) => m.default.sign({ id: admin.id, purpose: 'reset' }, JWT_SECRET, { expiresIn }));
    const signed = await token;

    const origin = process.env.APP_URL || 'https://chefsghana.com';
    const base = process.env.ADMIN_BASE_PATH || '/admin';
    const resetUrl = `${origin.replace(/\/$/, '')}${base}/reset?token=${encodeURIComponent(signed)}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true' || Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: admin.email,
      subject: 'Admin Password Reset',
      html: `<p>Hello ${admin.full_name || ''},</p>
             <p>You requested a password reset. Click the link below to set a new password:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Forgot password failed', err);
    return res.json({ ok: true }); // generic
  }
});

// Reset password: accept token + new password
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'Invalid request' });
    if (String(password).length < 8) return res.status(400).json({ error: 'Password too short' });

    const jwt = (await import('jsonwebtoken')).default;
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    if (!payload || payload.purpose !== 'reset') return res.status(400).json({ error: 'Invalid token' });

    const adminId = payload.id;
    const [rows] = await pool.execute('SELECT id, is_active FROM admin_users WHERE id = ? LIMIT 1', [adminId]);
    if (rows.length === 0 || rows[0].is_active === 0) return res.status(400).json({ error: 'Invalid token' });

    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(String(password), 10);
    await pool.execute('UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, adminId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Reset password failed', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});
