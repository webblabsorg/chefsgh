import pg from 'pg';
const { Pool } = pg;

const requiredEnv = ['DATABASE_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

// Neon Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log basic lifecycle events; never exit the process in serverless
pool.on('connect', () => {
  console.log('pg pool: client connected');
});
pool.on('error', (err) => {
  console.error('pg pool error (idle client):', err?.message || err);
});

export const getConnection = async () => pool.connect();
export { pool };
export default pool;
