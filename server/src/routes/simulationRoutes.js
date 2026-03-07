// server/src/routes/simulationRoutes.js
const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const verifyToken = require('../middlewares/verifyToken');

// POST: Run a new simulation (protected so we know which user ran it)
router.post('/explode', verifyToken, simulationController.calculateExplosion);

// GET: Fetch simulation history logs for the admin modal
router.get('/history', verifyToken, simulationController.getSimulationHistory);

module.exports = router;