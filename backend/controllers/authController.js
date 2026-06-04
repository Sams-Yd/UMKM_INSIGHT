const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const register = async (req, res) => {
  const { username, password, role } = req.body;
  const userRole = role || 'user';

  if (!['user', 'admin', 'lecturer'].includes(userRole)) {
    res.locals.errorMessage = 'Invalid user role specified';
    return res.status(400).json({ error: res.locals.errorMessage });
  }

  try {
    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      res.locals.errorMessage = 'Username already taken';
      return res.status(409).json({ error: res.locals.errorMessage });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    // Create user
    await db.run(
      `INSERT INTO users (id, username, password, role, is_premium, created_at) 
       VALUES (?, ?, ?, ?, 0, datetime('now', 'localtime'))`,
      [userId, username, hashedPassword, userRole]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        username,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.locals.errorMessage = 'Internal server error';
    return res.status(500).json({ error: res.locals.errorMessage });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      res.locals.errorMessage = 'Invalid username or password';
      return res.status(401).json({ error: res.locals.errorMessage });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.locals.errorMessage = 'Invalid username or password';
      return res.status(401).json({ error: res.locals.errorMessage });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'supersecretumkminsightkey123';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_premium: user.is_premium === 1,
        premium_until: user.premium_until
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.locals.errorMessage = 'Internal server error';
    return res.status(500).json({ error: res.locals.errorMessage });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user has been set by authenticateToken
    return res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.locals.errorMessage = 'Internal server error';
    return res.status(500).json({ error: res.locals.errorMessage });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
