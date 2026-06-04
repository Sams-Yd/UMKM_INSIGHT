const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretumkminsightkey123');
    
    // Fetch latest user details (to check is_premium status dynamically)
    const user = await db.get('SELECT id, username, role, is_premium, premium_until FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(403).json({ error: 'User no longer exists' });
    }

    // Check if premium subscription has expired
    let isPremium = user.is_premium === 1;
    if (isPremium && user.premium_until) {
      const now = new Date();
      const expires = new Date(user.premium_until);
      if (now > expires) {
        // Automatically revoke premium status in database
        await db.run('UPDATE users SET is_premium = 0 WHERE id = ?', [user.id]);
        isPremium = false;
      }
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      is_premium: isPremium ? 1 : 0,
      premium_until: user.premium_until
    };

    next();
  } catch (error) {
    console.error('JWT authentication error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized: insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
