const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/verifyToken');

// 1. Get Dashboard Metrics (KPIs for Admin panel and Command Center)
router.get('/dashboard', verifyToken, adminController.getDashboardMetrics);

// 2. Get all users for the table (Protected - requires authentication)
router.get('/users', verifyToken, adminController.getAllUsers);

// 3. Update a specific user's role and employee type (Protected - requires authentication)
router.put('/users/:id/role', verifyToken, adminController.updateUserRole);

module.exports = router;