import { pool } from '../db.js';

export async function logAudit({
  user_id = null,
  action,
  entity_type,
  entity_id = null,
  old_values = null,
  new_values = null,
  ip_address = null,
  user_agent = null,
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        user_id,
        action,
        entity_type,
        entity_id,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        ip_address,
        user_agent,
      ]
    );
  } catch (e) {
    // do not crash the request on audit failures
  }
}
