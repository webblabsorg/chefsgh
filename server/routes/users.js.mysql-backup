import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { logAudit } from '../services/audit.js';

const router = Router();

router.use(requireAdmin);

// GET /api/users - list with pagination and optional search
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page?.toString() || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize?.toString() || '20', 10), 1), 100);
    const q = (req.query.q || '').toString().trim();
    const offset = (page - 1) * pageSize;

    const params = [];
    let where = '1=1';
    if (q) {
      where = `(
        u.email LIKE ? OR u.phone_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?
      )`;
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    const [rows] = await pool.query(
      `SELECT 
         u.id, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.profile_photo_url, u.created_at,
         (SELECT r.membership_status FROM registrations r WHERE r.user_id = u.id ORDER BY r.created_at DESC LIMIT 1) AS membership_status,
         (SELECT r.membership_expiry FROM registrations r WHERE r.user_id = u.id ORDER BY r.created_at DESC LIMIT 1) AS membership_expiry
       FROM users u
       WHERE ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u WHERE ${where}`,
      params
    );

    res.json({ data: rows, page, pageSize, total: countRows[0].total });
  } catch (err) {
    console.error('List users failed', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// GET /api/users/:id - user detail
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT u.* FROM users u WHERE u.id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const user = rows[0];
    const [regRows] = await pool.query(
      `SELECT r.id, r.membership_id, r.membership_status, r.membership_expiry, r.payment_amount, r.payment_status, r.created_at,
              mt.name AS membership_type
       FROM registrations r
       JOIN membership_types mt ON r.membership_type_id = mt.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );
    res.json({ user, registrations: regRows });
  } catch (err) {
    console.error('Get user failed', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/users - create user (requires many fields due to NOT NULLs)
router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      first_name: z.string().min(1),
      middle_name: z.string().optional(),
      last_name: z.string().min(1),
      email: z.string().email(),
      phone_number: z.string().min(3),
      alternative_phone: z.string().optional(),
      date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      gender: z.enum(['male','female','prefer_not_to_say']),
      nationality: z.string().optional(),
      id_type: z.enum(['ghana_card','passport','voter_id','driver_license']),
      id_number: z.string().min(1),
      street_address: z.string().min(1),
      city: z.string().min(1),
      region: z.string().min(1),
      digital_address: z.string().optional(),
      professional_info: z.any().optional(),
      emergency_contact: z.object({ name: z.string().min(1), relationship: z.string().optional(), phone: z.string().min(3) }),
      profile_photo_url: z.string().optional(),
    });
    const u = schema.parse(req.body || {});

    const [result] = await pool.execute(
      `INSERT INTO users (
        first_name, middle_name, last_name, email, phone_number, alternative_phone, date_of_birth, gender, nationality,
        id_type, id_number, street_address, city, region, digital_address, professional_info, emergency_contact, profile_photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.first_name, u.middle_name ?? null, u.last_name, u.email, u.phone_number, u.alternative_phone ?? null,
        u.date_of_birth, u.gender, u.nationality ?? 'Ghanaian', u.id_type, u.id_number, u.street_address, u.city, u.region,
        u.digital_address ?? null, JSON.stringify(u.professional_info ?? {}), JSON.stringify(u.emergency_contact), u.profile_photo_url ?? null,
      ]
    );

    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [result.insertId || u.id]);
    try { await logAudit({ action: 'ADMIN_CREATE_USER', entity_type: 'user', entity_id: rows[0]?.id, new_values: { email: u.email }, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error('Create user failed', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/users/:id - update editable fields
router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const schema = z.object({
      first_name: z.string().min(1).optional(),
      middle_name: z.string().optional(),
      last_name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone_number: z.string().min(3).optional(),
      alternative_phone: z.string().optional(),
      street_address: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      region: z.string().min(1).optional(),
      digital_address: z.string().optional(),
      professional_info: z.any().optional(),
      emergency_contact: z.object({ name: z.string().min(1).optional(), relationship: z.string().optional(), phone: z.string().min(3).optional() }).optional(),
      profile_photo_url: z.string().optional(),
    });
    const allowed = ['first_name','middle_name','last_name','email','phone_number','alternative_phone','street_address','city','region','digital_address','professional_info','emergency_contact','profile_photo_url'];
    const body = schema.parse(req.body || {});
    const updates = [];
    const params = [];
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (k === 'professional_info' || k === 'emergency_contact') {
          updates.push(`${k} = ?`);
          params.push(JSON.stringify(body[k]));
        } else {
          updates.push(`${k} = ?`);
          params.push(body[k]);
        }
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates' });
    params.push(id);
    await pool.execute(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    try { await logAudit({ action: 'ADMIN_UPDATE_USER', entity_type: 'user', entity_id: id, new_values: body, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Update user failed', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - delete only if no registrations exist
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [regRows] = await pool.query('SELECT id FROM registrations WHERE user_id = ? LIMIT 1', [id]);
    if (regRows.length > 0) return res.status(409).json({ error: 'Cannot delete user with registrations' });
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    try { await logAudit({ action: 'ADMIN_DELETE_USER', entity_type: 'user', entity_id: id, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete user failed', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
