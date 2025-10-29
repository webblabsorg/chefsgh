import pg from 'pg';
const { Pool } = pg;

const requiredEnv = ['DATABASE_URL'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

// Neon Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to Neon Postgres database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const getConnection = async () => {
  return pool.connect();
};

export { pool };
export default pool;
