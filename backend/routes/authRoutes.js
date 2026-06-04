const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateAuth } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateAuth, authController.register);
router.post('/login', validateAuth, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
