import { Router } from 'express';
import multer from 'multer';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAdmin);

function parseCsv(buffer) {
  const text = buffer.toString('utf8');
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const parseLine = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i+1] === '"') { cur += '"'; i++; }
          else { inQuotes = false; }
        } else {
          cur += ch;
        }
      } else {
        if (ch === ',') { out.push(cur); cur = ''; }
        else if (ch === '"') { inQuotes = true; }
        else { cur += ch; }
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const header = parseLine(lines[0]).map(h => h.toLowerCase());
  const rows = lines.slice(1).map(parseLine);
  return { header, rows };
}

function limitRows(rows) {
  const limit = Number(process.env.IMPORT_CSV_MAX_ROWS || 20000);
  if (rows.length > limit) return rows.slice(0, limit);
  return rows;
}

router.post('/users', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, keyGenerator: (req)=> `${req.ip}:import_users` }), upload.single('file'), async (req, res) => {
  const dryRun = String(req.query.dryRun || 'true') === 'true';
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const { header, rows } = parseCsv(req.file.buffer);
    const limited = limitRows(rows);
    const col = Object.fromEntries(header.map((h, i) => [h, i]));
    const required = ['first_name','last_name','email','phone_number','date_of_birth','gender','id_type','id_number','street_address','city','region','emergency_contact_name','emergency_contact_phone'];
    for (const r of required) if (col[r] === undefined) return res.status(400).json({ error: `Missing required column: ${r}` });

    const errors = [];
    let processed = 0, created = 0, updated = 0;

    const conn = await pool.getConnection();
    try {
      if (!dryRun) await conn.beginTransaction();
      for (let idx = 0; idx < limited.length; idx++) {
        const row = limited[idx];
        const get = (name) => row[col[name]] ?? '';
        const payload = {
          first_name: get('first_name'),
          middle_name: col['middle_name']!==undefined ? get('middle_name') : null,
          last_name: get('last_name'),
          email: get('email'),
          phone_number: get('phone_number'),
          alternative_phone: col['alternative_phone']!==undefined ? get('alternative_phone') : null,
          date_of_birth: get('date_of_birth'),
          gender: get('gender'),
          nationality: col['nationality']!==undefined ? get('nationality') || 'Ghanaian' : 'Ghanaian',
          id_type: get('id_type'),
          id_number: get('id_number'),
          street_address: get('street_address'),
          city: get('city'),
          region: get('region'),
          digital_address: col['digital_address']!==undefined ? get('digital_address') : null,
          profile_photo_url: col['profile_photo_url']!==undefined ? get('profile_photo_url') : null,
          emergency_contact: {
            name: get('emergency_contact_name'),
            relationship: col['emergency_contact_relationship']!==undefined ? get('emergency_contact_relationship') : '',
            phone: get('emergency_contact_phone'),
          },
        };
        // Basic validation
        for (const k of required) {
          if (!get(k)) { errors.push({ row: idx+2, error: `Missing ${k}` }); continue; }
        }
        processed++;
        if (dryRun) continue;
        const [exists] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [payload.email]);
        if (exists.length) {
          const id = exists[0].id;
          await conn.execute(
            `UPDATE users SET first_name=?, middle_name=?, last_name=?, phone_number=?, alternative_phone=?, date_of_birth=?, gender=?, nationality=?, id_type=?, id_number=?, street_address=?, city=?, region=?, digital_address=?, emergency_contact=?, profile_photo_url=?, updated_at=CURRENT_TIMESTAMP WHERE id = ?`,
            [payload.first_name, payload.middle_name, payload.last_name, payload.phone_number, payload.alternative_phone, payload.date_of_birth, payload.gender, payload.nationality, payload.id_type, payload.id_number, payload.street_address, payload.city, payload.region, payload.digital_address, JSON.stringify(payload.emergency_contact), payload.profile_photo_url, id]
          );
          updated++;
        } else {
          await conn.execute(
            `INSERT INTO users (first_name, middle_name, last_name, email, phone_number, alternative_phone, date_of_birth, gender, nationality, id_type, id_number, street_address, city, region, digital_address, professional_info, emergency_contact, profile_photo_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [payload.first_name, payload.middle_name, payload.last_name, payload.email, payload.phone_number, payload.alternative_phone, payload.date_of_birth, payload.gender, payload.nationality, payload.id_type, payload.id_number, payload.street_address, payload.city, payload.region, payload.digital_address, JSON.stringify({}), JSON.stringify(payload.emergency_contact), payload.profile_photo_url]
          );
          created++;
        }
      }
      if (!dryRun) await conn.commit();
    } catch (e) {
      if (!dryRun) try { await conn.rollback(); } catch {}
      throw e;
    } finally {
      conn.release();
    }

    res.json({ dryRun, processed, created, updated, errors });
  } catch (err) {
    console.error('Import users failed', err);
    res.status(500).json({ error: 'Failed to import users' });
  }
});

router.post('/payments', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, keyGenerator: (req)=> `${req.ip}:import_payments` }), upload.single('file'), async (req, res) => {
  const dryRun = String(req.query.dryRun || 'true') === 'true';
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const { header, rows } = parseCsv(req.file.buffer);
    const limited = limitRows(rows);
    const col = Object.fromEntries(header.map((h, i) => [h, i]));
    const required = ['reference','status','amount','currency','customer_email'];
    for (const r of required) if (col[r] === undefined) return res.status(400).json({ error: `Missing required column: ${r}` });
    const errors = [];
    let processed = 0, created = 0, updated = 0;

    const conn = await pool.getConnection();
    try {
      if (!dryRun) await conn.beginTransaction();
      for (let idx = 0; idx < limited.length; idx++) {
        const row = limited[idx];
        const get = (name) => row[col[name]] ?? '';
        const payload = {
          reference: get('reference'),
          gateway: col['gateway']!==undefined ? get('gateway') : 'manual',
          status: get('status'),
          amount: Number(get('amount') || 0),
          currency: get('currency') || 'GHS',
          channel: col['channel']!==undefined ? get('channel') : null,
          paid_at: col['paid_at']!==undefined ? get('paid_at') : null,
          customer_email: get('customer_email'),
        };
        for (const k of required) { if (!get(k)) { errors.push({ row: idx+2, error: `Missing ${k}` }); continue; } }
        processed++;
        if (dryRun) continue;
        await conn.execute(
          `INSERT INTO payments (reference, gateway, status, amount, currency, channel, paid_at, metadata, customer_email)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), amount=VALUES(amount), currency=VALUES(currency), channel=VALUES(channel), paid_at=VALUES(paid_at), customer_email=VALUES(customer_email)`,
          [payload.reference, payload.gateway, payload.status, payload.amount, payload.currency, payload.channel, payload.paid_at, JSON.stringify({ import: true }), payload.customer_email]
        );
        // Determine if created/updated (roughly)
        const [exists] = await conn.query('SELECT id FROM payments WHERE reference = ? LIMIT 1', [payload.reference]);
        if (exists.length) updated++; else created++;
      }
      if (!dryRun) await conn.commit();
    } catch (e) {
      if (!dryRun) try { await conn.rollback(); } catch {}
      throw e;
    } finally { conn.release(); }

    res.json({ dryRun, processed, created, updated, errors });
  } catch (err) {
    console.error('Import payments failed', err);
    res.status(500).json({ error: 'Failed to import payments' });
  }
});

export default router;
