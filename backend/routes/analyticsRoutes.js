const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/sync', authenticateToken, analyticsController.syncExternalData);
router.get('/dashboard', authenticateToken, analyticsController.getDashboardData);
router.get('/sales', authenticateToken, analyticsController.getSalesAnalysis);
router.get('/cashflow', authenticateToken, analyticsController.getCashflowAnalysis);
router.get('/reports', authenticateToken, analyticsController.getReports);
router.put('/transaction/:sourceApp/:id', authenticateToken, requireRole(['admin']), analyticsController.updateTransaction);
router.delete('/transaction/:sourceApp/:id', authenticateToken, requireRole(['admin']), analyticsController.deleteTransaction);

module.exports = router;
