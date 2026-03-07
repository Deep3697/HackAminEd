// server/src/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const verifyToken = require('../middlewares/verifyToken');

// Fetch Data endpoints
router.get('/admin/:cycle', verifyToken, hrController.getAdminPayroll);
router.get('/employee', verifyToken, hrController.getEmployeePayslips);

// Action endpoints (Reconcile, Payroll run, Batch dispatch)
router.post('/action', verifyToken, hrController.runAction);

module.exports = router;