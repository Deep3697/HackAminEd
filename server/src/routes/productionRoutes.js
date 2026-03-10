const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const verifyToken = require('../middlewares/verifyToken');

// Fetch the combined dashboard data
router.get('/dashboard', verifyToken, productionController.getDashboardData);

// Submit new data
router.post('/jobs', verifyToken, productionController.createJob);
router.put('/jobs/:id/progress', verifyToken, productionController.updateJobProgress);
router.put('/jobs/:id/status', verifyToken, productionController.updateJobStatus);
router.post('/downtime', verifyToken, productionController.logDowntime);
router.post('/qc/add', verifyToken, productionController.addToQc);
router.put('/qc', verifyToken, productionController.updateQc);

module.exports = router;