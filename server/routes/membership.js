import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, slug, price, description, benefits, is_active
       FROM membership_types
       WHERE is_active = TRUE
       ORDER BY price DESC`
    );

    const data = rows.map((row) => {
      let benefits = [];
      if (Array.isArray(row.benefits)) {
        benefits = row.benefits;
      } else if (row.benefits) {
        try {
          benefits = JSON.parse(row.benefits);
        } catch (parseError) {
          console.warn('Invalid benefits JSON for membership', row.id, parseError);
        }
      }

      return {
        ...row,
        benefits,
      };
    });

    res.json({ data });
  } catch (error) {
    console.error('Failed to fetch membership types', error);
    res.status(500).json({ error: 'Failed to load membership types' });
  }
});

export default router;
