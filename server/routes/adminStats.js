import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/summary', async (_req, res) => {
  try {
    // Users counts
    const [usersRows] = await pool.query(
      `SELECT
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today,
        SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) AS week,
        SUM(CASE WHEN YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN 1 ELSE 0 END) AS month
       FROM users`
    );

    // Registrations counts
    const [regsRows] = await pool.query(
      `SELECT
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today,
        SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) AS week,
        SUM(CASE WHEN YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN 1 ELSE 0 END) AS month
       FROM registrations`
    );

    // Revenue (from registrations with success)
    const [revRows] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN payment_amount END), 0) AS today,
        COALESCE(SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN payment_amount END), 0) AS week,
        COALESCE(SUM(CASE WHEN YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN payment_amount END), 0) AS month
       FROM registrations
       WHERE payment_status = 'success'`
    );

    // Active members (via function if exists)
    let activeMembers = 0;
    try {
      const [activeRows] = await pool.query('SELECT get_active_members_count() AS count');
      activeMembers = Number(activeRows?.[0]?.count || 0);
    } catch {
      const [fallbackRows] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM registrations
         WHERE membership_status = 'active' AND membership_expiry >= CURDATE()`
      );
      activeMembers = Number(fallbackRows?.[0]?.count || 0);
    }

    // Renewals: due in 7/30 days and overdue
    const [[due7], [due30], [overdue]] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS count
         FROM registrations
         WHERE membership_status = 'active'
           AND membership_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
      ),
      pool.query(
        `SELECT COUNT(*) AS count
         FROM registrations
         WHERE membership_status = 'active'
           AND membership_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
      ),
      pool.query(
        `SELECT COUNT(*) AS count
         FROM registrations
         WHERE membership_expiry < CURDATE()`
      ),
    ]);

    res.json({
      users: usersRows[0],
      registrations: regsRows[0],
      revenue: revRows[0],
      activeMembers,
      renewals: {
        due7: Number(due7[0]?.count || 0),
        due30: Number(due30[0]?.count || 0),
        overdue: Number(overdue[0]?.count || 0),
      },
    });
  } catch (err) {
    console.error('stats/summary failed', err);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

router.get('/membership-types', async (req, res) => {
  try {
    const period = String(req.query.period || 'week');
    let where = `YEARWEEK(r.created_at, 1) = YEARWEEK(CURDATE(), 1)`;
    if (period === 'month') {
      where = `YEAR(r.created_at) = YEAR(CURDATE()) AND MONTH(r.created_at) = MONTH(CURDATE())`;
    }
    const [rows] = await pool.query(
      `SELECT mt.name, mt.slug, COUNT(r.id) AS count
       FROM registrations r
       JOIN membership_types mt ON r.membership_type_id = mt.id
       WHERE ${where}
       GROUP BY mt.name, mt.slug
       ORDER BY count DESC`
    );
    res.json({ period, data: rows });
  } catch (err) {
    console.error('stats/membership-types failed', err);
    res.status(500).json({ error: 'Failed to compute membership type breakdown' });
  }
});

router.get('/registrations-trend', async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 180);
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS date,
              COUNT(*) AS registrations,
              COALESCE(SUM(CASE WHEN payment_status = 'success' THEN payment_amount END), 0) AS revenue
       FROM registrations
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL $1 DAY)
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [days]
    );
    res.json({ days, data: rows });
  } catch (err) {
    console.error('stats/registrations-trend failed', err);
    res.status(500).json({ error: 'Failed to compute trend' });
  }
});

export default router;
