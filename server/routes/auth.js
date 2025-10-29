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
    const { rows } = await pool.query(
      `SELECT id, email, username, full_name, password_hash, role, is_active
       FROM admin_users WHERE ${byField} = $1 LIMIT 1`,
      [identifier]
    );
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
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
