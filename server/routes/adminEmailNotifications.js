import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendHtmlEmail } from '../services/email.js';

const router = Router();

router.use(requireAdmin);

// GET /api/admin/email-notifications
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
      where += ` AND (recipient_email LIKE ? OR subject LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like);
    }
    if (status) {
      where += ` AND status = ?`;
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT id, registration_id, recipient_email, subject, status, sent_at, created_at
       FROM email_notifications
       WHERE ${where}
       ORDER BY COALESCE(sent_at, created_at) DESC
       LIMIT $1 OFFSET $2`,
      [...params, pageSize, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM email_notifications WHERE ${where}`,
      params
    );

    res.json({ data: rows, page, pageSize, total: countRows[0].total });
  } catch (err) {
    console.error('List emails failed', err);
    res.status(500).json({ error: 'Failed to list emails' });
  }
});

// GET /api/admin/email-notifications/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT * FROM email_notifications WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ email: rows[0] });
  } catch (err) {
    console.error('Get email failed', err);
    res.status(500).json({ error: 'Failed to get email' });
  }
});

// POST /api/admin/email-notifications/:id/resend
router.post('/:id/resend', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(`SELECT * FROM email_notifications WHERE id = $1 LIMIT 1`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const email = rows[0];
    await sendHtmlEmail({ to: email.recipient_email, subject: `[RESEND] ${email.subject}`, html: email.body, registrationId: email.registration_id });
    res.json({ ok: true });
  } catch (err) {
    console.error('Resend email failed', err);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

export default router;
