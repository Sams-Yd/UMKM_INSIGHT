const db = require('../config/db');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // We want to capture the response completion to log status code and potential errors
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const userId = req.user ? req.user.id : null;
    const errorMessage = res.locals.errorMessage || null;

    try {
      await db.run(
        `INSERT INTO api_logs (endpoint, method, user_id, app_name, status_code, error_message, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
        [req.originalUrl || req.url, req.method, userId, 'umkm-insight', statusCode, errorMessage]
      );
    } catch (dbErr) {
      console.error('Failed to write log to SQLite database:', dbErr.message);
    }
  });

  next();
};

module.exports = requestLogger;
