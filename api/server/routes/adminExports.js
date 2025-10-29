import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.use(requireAdmin);

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function sendCsv(res, filename, header, rows) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.write(header.join(',') + '\n');
  for (const row of rows) {
    res.write(row.map(csvEscape).join(',') + '\n');
  }
}

router.get('/users.csv', rateLimit({ windowMs: 60 * 60 * 1000, max: 20, keyGenerator: (req) => `${req.ip}:export_users` }), async (req, res) => {
  try {
    const start = req.query.start ? String(req.query.start) : null;
    const end = req.query.end ? String(req.query.end) : null;
    const params = [];
    let where = '1=1';
    if (start) { where += ' AND u.created_at >= ?'; params.push(start); }
    if (end) { where += ' AND u.created_at <= ?'; params.push(end + ' 23:59:59'); }

    const [rows] = await pool.query(
      `SELECT 
         u.id, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.alternative_phone,
         u.date_of_birth, u.gender, u.nationality, u.id_type, u.id_number, u.street_address, u.city, u.region,
         u.digital_address, u.created_at,
         (SELECT r.membership_status FROM registrations r WHERE r.user_id = u.id ORDER BY r.created_at DESC LIMIT 1) AS membership_status,
         (SELECT r.membership_expiry FROM registrations r WHERE r.user_id = u.id ORDER BY r.created_at DESC LIMIT 1) AS membership_expiry
       FROM users u
       WHERE ${where}
       ORDER BY u.created_at DESC`,
      params
    );

    const header = [
      'id','first_name','middle_name','last_name','email','phone_number','alternative_phone','date_of_birth','gender','nationality','id_type','id_number','street_address','city','region','digital_address','created_at','membership_status','membership_expiry'
    ];
    const out = rows.map(r => [
      r.id, r.first_name, r.middle_name, r.last_name, r.email, r.phone_number, r.alternative_phone,
      r.date_of_birth ? new Date(r.date_of_birth).toISOString().slice(0,10) : '', r.gender, r.nationality, r.id_type, r.id_number, r.street_address, r.city, r.region,
      r.digital_address, r.created_at ? new Date(r.created_at).toISOString() : '', r.membership_status, r.membership_expiry ? new Date(r.membership_expiry).toISOString().slice(0,10) : ''
    ]);

    const filename = `users-${new Date().toISOString().slice(0,10)}.csv`;
    sendCsv(res, filename, header, out);
    res.end();
  } catch (err) {
    console.error('Export users.csv failed', err);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

router.get('/payments.csv', rateLimit({ windowMs: 60 * 60 * 1000, max: 20, keyGenerator: (req) => `${req.ip}:export_payments` }), async (req, res) => {
  try {
    const start = req.query.start ? String(req.query.start) : null;
    const end = req.query.end ? String(req.query.end) : null;
    const params = [];
    let where = '1=1';
    if (start) { where += ' AND COALESCE(p.paid_at, p.created_at) >= ?'; params.push(start); }
    if (end) { where += ' AND COALESCE(p.paid_at, p.created_at) <= ?'; params.push(end + ' 23:59:59'); }

    const [rows] = await pool.query(
      `SELECT 
         p.id, p.reference, p.gateway, p.status, p.amount, p.currency, p.channel, p.paid_at, p.customer_email, p.created_at,
         (SELECT r.membership_id FROM registrations r WHERE r.payment_id = p.id LIMIT 1) AS membership_id
       FROM payments p
       WHERE ${where}
       ORDER BY COALESCE(p.paid_at, p.created_at) DESC`,
      params
    );

    const header = ['id','reference','gateway','status','amount','currency','channel','paid_at','customer_email','created_at','membership_id'];
    const out = rows.map(r => [
      r.id, r.reference, r.gateway, r.status, r.amount, r.currency, r.channel,
      r.paid_at ? new Date(r.paid_at).toISOString() : '', r.customer_email, r.created_at ? new Date(r.created_at).toISOString() : '', r.membership_id || ''
    ]);

    const filename = `payments-${new Date().toISOString().slice(0,10)}.csv`;
    sendCsv(res, filename, header, out);
    res.end();
  } catch (err) {
    console.error('Export payments.csv failed', err);
    res.status(500).json({ error: 'Failed to export payments' });
  }
});

export default router;
