const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'umkm_insight',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const normalizeSql = (sql) => {
  if (!sql) return sql;
  return sql.replace(/datetime\('now',\s*'localtime'\)/g, 'NOW()');
};

const run = async (sql, params = []) => {
  sql = normalizeSql(sql);
  const [result] = await pool.execute(sql, params);
  return { id: result.insertId || null, changes: result.affectedRows || 0 };
};

const all = async (sql, params = []) => {
  sql = normalizeSql(sql);
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const get = async (sql, params = []) => {
  const rows = await all(sql, params);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

const initDb = async () => {
  try {
    // Verify connection
    const conn = await pool.getConnection();
    conn.release();
    console.log('Connected to the MySQL database');

    // 1. Users Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user','admin','lecturer') DEFAULT 'user',
        is_premium TINYINT(1) DEFAULT 0,
        premium_until DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Subscriptions Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        amount INT DEFAULT 10000,
        status ENUM('pending','settlement','expire','cancel') DEFAULT 'pending',
        snap_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 3. API Logs Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        endpoint VARCHAR(512) NOT NULL,
        method VARCHAR(16) NOT NULL,
        user_id VARCHAR(64),
        app_name VARCHAR(128) DEFAULT 'umkm-insight',
        status_code INT,
        error_message TEXT
      ) ENGINE=InnoDB;
    `);

    console.log('Database MySQL tables successfully initialized.');
  } catch (error) {
    console.error('Error initializing MySQL database tables:', error);
    throw error;
  }
};

module.exports = {
  db: pool,
  run,
  all,
  get,
  initDb
};
