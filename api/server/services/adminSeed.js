import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

export async function seedInitialAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const fullName = process.env.ADMIN_SEED_NAME || 'Administrator';

  if (!email || !password) {
    return; // nothing to seed
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email]);
    if (rows.length > 0) return; // already exists

    const username = email.split('@')[0].slice(0, 50);
    const passwordHash = await bcrypt.hash(password, 10);

    await conn.execute(
      `INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, 'admin', TRUE)`,
      [username, email, passwordHash, fullName]
    );

    // eslint-disable-next-line no-console
    console.log(`Seeded initial admin user: ${email}`);
  } catch (err) {
    console.error('Failed to seed initial admin:', err);
  } finally {
    conn.release();
  }
}
