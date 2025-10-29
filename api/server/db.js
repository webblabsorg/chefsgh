import mysql from 'mysql2/promise';

const requiredEnv = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: process.env.MYSQL_CONNECTION_LIMIT
    ? Number(process.env.MYSQL_CONNECTION_LIMIT)
    : 10,
  charset: 'utf8mb4',
});

export const getConnection = () => pool.getConnection();
export { pool };
export default pool;
