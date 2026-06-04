const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.sqlite');

// Ensure database file exists
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    db.run('PRAGMA foreign_keys = ON'); // Enable foreign key constraints
  }
});

// Helper to run queries returning a Promise
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper to query multiple rows
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Helper to query a single row
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Initialize tables
const initDb = async () => {
  try {
    // 1. Users Table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('user', 'admin', 'lecturer')) DEFAULT 'user',
        is_premium INTEGER DEFAULT 0,
        premium_until TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Subscriptions Table
    await run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER DEFAULT 10000,
        status TEXT CHECK(status IN ('pending', 'settlement', 'expire', 'cancel')) DEFAULT 'pending',
        snap_token TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. API Logs Table
    await run(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        user_id TEXT,
        app_name TEXT DEFAULT 'umkm-insight',
        status_code INTEGER,
        error_message TEXT
      )
    `);

    console.log('Database tables successfully initialized.');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

module.exports = {
  db,
  run,
  all,
  get,
  initDb
};
