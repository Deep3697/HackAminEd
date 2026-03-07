// server/src/routes/supplyChainRoutes.js
const express = require('express');
const router = express.Router();
const supplyChainController = require('../controllers/supplyChainController');
const verifyToken = require('../middlewares/verifyToken');

// Apply verifyToken middleware to protect these routes!
router.get('/inventory', verifyToken, supplyChainController.getInventory);
router.get('/fleet', verifyToken, supplyChainController.getFleet);
router.get('/movements', verifyToken, supplyChainController.getMovements);

module.exports = router;