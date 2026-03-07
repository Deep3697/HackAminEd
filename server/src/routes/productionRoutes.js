const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const verifyToken = require('../middlewares/verifyToken');

// Fetch the combined dashboard data
router.get('/dashboard', verifyToken, productionController.getDashboardData);

// Submit new data
router.post('/jobs', verifyToken, productionController.createJob);
router.post('/downtime', verifyToken, productionController.logDowntime);
router.put('/qc', verifyToken, productionController.updateQc);

module.exports = router;