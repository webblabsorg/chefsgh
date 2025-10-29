import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendHtmlEmail } from '../services/email.js';
import { z } from 'zod';
import { logAudit } from '../services/audit.js';

const router = Router();

router.use(requireAdmin);

// GET /api/admin/registrations - list with optional filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page?.toString() || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize?.toString() || '20', 10), 1), 100);
    const q = (req.query.q || '').toString().trim();
    const status = (req.query.status || '').toString().trim();
    const offset = (page - 1) * pageSize;

    const params = [];
    let where = '1=1';
    if (q) {
      where += ` AND (r.membership_id LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (status) {
      where += ` AND r.membership_status = ?`;
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT r.id, r.membership_id, r.membership_status, r.membership_expiry, r.payment_status, r.payment_amount, r.created_at,
              u.first_name, u.middle_name, u.last_name, u.email, u.phone_number,
              mt.name AS membership_type
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN membership_types mt ON r.membership_type_id = mt.id
       WHERE ${where}
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [...params, pageSize, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE ${where}`,
      params
    );

    res.json({ data: rows, page, pageSize, total: countRows[0].total });
  } catch (err) {
    console.error('List registrations failed', err);
    res.status(500).json({ error: 'Failed to list registrations' });
  }
});

// GET /api/admin/registrations/:id - detail
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT r.*, u.*, mt.name AS membership_type
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN membership_types mt ON r.membership_type_id = mt.id
       WHERE r.id = $1 LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const regUser = rows[0];
    // Fetch payment details if needed
    const [payRows] = await pool.query(
      `SELECT * FROM payments WHERE id = $1 LIMIT 1`,
      [regUser.payment_id]
    );

    res.json({ registration: regUser, payment: payRows[0] || null });
  } catch (err) {
    console.error('Get registration failed', err);
    res.status(500).json({ error: 'Failed to get registration' });
  }
});

// PATCH /api/admin/registrations/:id - update membership_status or expiry
router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const schema = z.object({
      membership_status: z.enum(['active','inactive','suspended','expired']).optional(),
      membership_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    });
    const { membership_status, membership_expiry } = schema.parse(req.body || {});
    const updates = [];
    const params = [];
    if (membership_status) { updates.push('membership_status = ?'); params.push(membership_status); }
    if (membership_expiry) { updates.push('membership_expiry = ?'); params.push(membership_expiry); }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates' });
    params.push(id);
    await pool.execute(`UPDATE registrations SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, params);
    const [rows] = await pool.query(
      `SELECT r.id, r.membership_id, r.membership_status, r.membership_expiry FROM registrations r WHERE r.id = $1`,
      [id]
    );
    try { await logAudit({ action: 'ADMIN_UPDATE_REGISTRATION', entity_type: 'registration', entity_id: id, new_values: { membership_status, membership_expiry }, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.json({ registration: rows[0] });
  } catch (err) {
    console.error('Update registration failed', err);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// POST /api/admin/registrations/:id/resend-email - resend last notification body to support email
router.post('/:id/resend-email', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT en.subject, en.body, en.recipient_email
       FROM email_notifications en
       WHERE en.registration_id = $1
       ORDER BY en.created_at DESC
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No previous notification found' });
    const row = rows[0];
    await sendHtmlEmail({ to: row.recipient_email, subject: `[RESEND] ${row.subject}`, html: row.body, registrationId: id });
    try { await logAudit({ action: 'ADMIN_RESEND_EMAIL', entity_type: 'registration', entity_id: id, new_values: { subject: row.subject }, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.json({ ok: true });
  } catch (err) {
    console.error('Resend email failed', err);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

export default router;
