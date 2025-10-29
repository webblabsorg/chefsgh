import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import { logAudit } from '../services/audit.js';

const router = Router();

router.use(requireAdmin);

const parseBenefits = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

// GET /api/admin/membership-types
router.get('/', async (req, res) => {
  try {
    const includeInactive = String(req.query.includeInactive || 'true') === 'true';
    const where = includeInactive ? '1=1' : 'is_active = TRUE';
    const [rows] = await pool.query(
      `SELECT id, name, slug, description, price, benefits, is_active, created_at, updated_at
       FROM membership_types
       WHERE ${where}
       ORDER BY created_at DESC`
    );
    const data = rows.map((r) => ({
      ...r,
      benefits: typeof r.benefits === 'string' ? (JSON.parse(r.benefits || '[]')) : (r.benefits || []),
    }));
    res.json({ data });
  } catch (err) {
    console.error('List membership types failed', err);
    res.status(500).json({ error: 'Failed to list membership types' });
  }
});

// POST /api/admin/membership-types
router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      price: z.coerce.number().nonnegative(),
      benefits: z.union([z.string(), z.array(z.string())]).optional(),
      is_active: z.boolean().optional(),
    });
    const b = schema.parse(req.body || {});
    const benefits = parseBenefits(b.benefits);
    const [result] = await pool.execute(
      `INSERT INTO membership_types (name, slug, description, price, benefits, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b.name, b.slug, b.description || null, b.price, JSON.stringify(benefits), b.is_active !== false]
    );
    const [rows] = await pool.query(`SELECT * FROM membership_types WHERE id = ?`, [result.insertId || b.id]);
    try { await logAudit({ action: 'ADMIN_CREATE_MEMBERSHIP_TYPE', entity_type: 'membership_type', entity_id: rows[0]?.id, new_values: { name: b.name, slug: b.slug }, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.status(201).json({ membershipType: rows[0] });
  } catch (err) {
    console.error('Create membership type failed', err);
    res.status(500).json({ error: 'Failed to create membership type' });
  }
});

// PATCH /api/admin/membership-types/:id
router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const schema = z.object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.coerce.number().nonnegative().optional(),
      benefits: z.union([z.string(), z.array(z.string())]).optional(),
      is_active: z.boolean().optional(),
    });
    const body = schema.parse(req.body || {});
    const allowed = ['name','slug','description','price','benefits','is_active'];
    const updates = [];
    const params = [];
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (k === 'benefits') {
          updates.push('benefits = ?');
          params.push(JSON.stringify(parseBenefits(body[k])));
        } else {
          updates.push(`${k} = ?`);
          params.push(body[k]);
        }
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates' });
    params.push(id);
    await pool.execute(`UPDATE membership_types SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
    const [rows] = await pool.query(`SELECT * FROM membership_types WHERE id = ?`, [id]);
    try { await logAudit({ action: 'ADMIN_UPDATE_MEMBERSHIP_TYPE', entity_type: 'membership_type', entity_id: id, new_values: body, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.json({ membershipType: rows[0] });
  } catch (err) {
    console.error('Update membership type failed', err);
    res.status(500).json({ error: 'Failed to update membership type' });
  }
});

// DELETE /api/admin/membership-types/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [refRows] = await pool.query('SELECT id FROM registrations WHERE membership_type_id = ? LIMIT 1', [id]);
    if (refRows.length > 0) return res.status(409).json({ error: 'Cannot delete type in use' });
    await pool.execute('DELETE FROM membership_types WHERE id = ?', [id]);
    try { await logAudit({ action: 'ADMIN_DELETE_MEMBERSHIP_TYPE', entity_type: 'membership_type', entity_id: id, ip_address: req.ip, user_agent: req.headers['user-agent'] || '' }); } catch {}
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete membership type failed', err);
    res.status(500).json({ error: 'Failed to delete membership type' });
  }
});

export default router;
