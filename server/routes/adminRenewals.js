import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

// GET /api/admin/renewals?status=due|overdue&windowDays=30&page=1&pageSize=20&q=
router.get('/', async (req, res) => {
  try {
    const status = String(req.query.status || 'due');
    const windowDays = Math.min(Math.max(parseInt(String(req.query.windowDays || '30'), 10), 1), 365);
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || '20'), 10), 1), 100);
    const q = (req.query.q || '').toString().trim();
    const offset = (page - 1) * pageSize;

    const params = [];
    let where = `1=1`;
    if (status === 'due') {
      where += ` AND r.membership_status = 'active' AND r.membership_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`;
      params.push(windowDays);
    } else if (status === 'overdue') {
      where += ` AND r.membership_expiry < CURDATE()`;
    }

    if (q) {
      where += ` AND (r.membership_id LIKE ? OR u.email LIKE ? OR u.phone_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }

    const [rows] = await pool.query(
      `SELECT r.id, r.membership_id, r.membership_status, r.membership_expiry, r.payment_status, r.payment_amount, r.created_at,
              u.first_name, u.middle_name, u.last_name, u.email, u.phone_number,
              mt.name AS membership_type,
              DATEDIFF(r.membership_expiry, CURDATE()) AS days_remaining
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN membership_types mt ON r.membership_type_id = mt.id
       WHERE ${where}
       ORDER BY r.membership_expiry ASC
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

    res.json({ status, windowDays, data: rows, page, pageSize, total: countRows[0].total });
  } catch (err) {
    console.error('List renewals failed', err);
    res.status(500).json({ error: 'Failed to list renewals' });
  }
});

export default router;
