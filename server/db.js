/**
 * Conexão com o MySQL via pool (mysql2/promise).
 * Todas as consultas da aplicação usam placeholders (?) — consultas parametrizadas.
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'isrp_db',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

/** Executa uma consulta parametrizada e retorna apenas as linhas. */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/** Executa uma função dentro de uma transação, com commit/rollback automáticos. */
async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Verifica se o banco está acessível (usado na inicialização e no /api/health). */
async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, transaction, ping };
