// server/src/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const verifyToken = require('../middlewares/verifyToken');

// Fetch Data endpoints
router.get('/admin/:cycle', verifyToken, hrController.getAdminPayroll);
router.get('/employee', verifyToken, hrController.getEmployeePayslips);
router.get('/cycles', verifyToken, hrController.getAvailableCycles);
router.get('/employees', verifyToken, hrController.getAllEmployees);
router.get('/attendance/:employeeId/:year/:month', verifyToken, hrController.getAttendanceDetails);

// Action endpoints
router.put('/attendance', verifyToken, hrController.markAttendance);
router.post('/payroll/run', verifyToken, hrController.runMonthlyPayroll);
router.post('/action', verifyToken, hrController.runAction);

module.exports = router;