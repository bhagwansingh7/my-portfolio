const mysql = require('mysql2/promise');
const env = require('./env');
console.log(env.db.host, env.db.port, env.db.name, env.db.user, env.db.password);
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: 'Z',
  ssl: {
        rejectUnauthorized: true
    }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** MySQL needs a few seconds on first boot; retry instead of crashing. */
async function waitForDatabase(retries = 40, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      const [tables] = await pool.execute(`SHOW TABLES`);
      console.log(`[db] connected to MySQL (${tables.length} tables)`,tables);
      conn.release();
      return;
    } catch (err) {
      console.log(`[db] waiting for MySQL (${attempt}/${retries}): ${err.code || err.message}`);
      await sleep(delayMs);
    }
  }
  throw new Error('Could not connect to MySQL. Check DB_* environment variables.');
}

module.exports = { pool, waitForDatabase };
