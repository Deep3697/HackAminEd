// server/src/routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const verifyToken = require('../middlewares/verifyToken');

// Fetch Data endpoints
router.get('/assets', verifyToken, maintenanceController.getAssets);
router.get('/audit', verifyToken, maintenanceController.getAuditLogs);

// Action endpoints (Register Asset, Work Order, Dispatch, Report)
router.post('/action', verifyToken, maintenanceController.submitAction);

module.exports = router;