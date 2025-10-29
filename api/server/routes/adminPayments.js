import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

// GET /api/admin/payments - list payments with optional search/status
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
      where += ` AND (reference LIKE ? OR customer_email LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like);
    }
    if (status) {
      where += ` AND status = ?`;
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT id, reference, gateway, status, amount, currency, channel, paid_at, customer_email, created_at
       FROM payments
       WHERE ${where}
       ORDER BY COALESCE(paid_at, created_at) DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM payments WHERE ${where}`,
      params
    );

    res.json({ data: rows, page, pageSize, total: countRows[0].total });
  } catch (err) {
    console.error('List payments failed', err);
    res.status(500).json({ error: 'Failed to list payments' });
  }
});

// GET /api/admin/payments/:id - payment detail with related registration if any
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [payRows] = await pool.query(
      `SELECT id, reference, gateway, status, amount, currency, channel, paid_at, metadata, customer_email, created_at
       FROM payments WHERE id = ? LIMIT 1`,
      [id]
    );
    if (payRows.length === 0) return res.status(404).json({ error: 'Not found' });
    const payment = payRows[0];

    const [regRows] = await pool.query(
      `SELECT r.id, r.membership_id, r.membership_status, r.membership_expiry, r.payment_status, r.payment_amount,
              mt.name AS membership_type
       FROM registrations r
       JOIN membership_types mt ON r.membership_type_id = mt.id
       WHERE r.payment_id = ?
       LIMIT 1`,
      [id]
    );

    res.json({ payment, registration: regRows[0] || null });
  } catch (err) {
    console.error('Get payment failed', err);
    res.status(500).json({ error: 'Failed to get payment' });
  }
});

export default router;
