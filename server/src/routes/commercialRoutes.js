const express = require('express');
const router = express.Router();
const commercialController = require('../controllers/commercialController');
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');

// 1. GET requests (Fetching table data)
router.get('/sales', verifyToken, commercialController.getSalesOrders);
router.get('/purchases', verifyToken, commercialController.getPurchaseOrders);

// 2. POST requests (Creating new forms)
router.post('/sales', verifyToken, commercialController.createSalesOrder);
router.post('/purchases', verifyToken, commercialController.createPurchaseOrder);

// 3. PUT requests (Admin clicking 'Approve')
router.put('/purchases/:id/approve', verifyToken, roleCheck(['Admin']), commercialController.approvePurchaseOrder);

module.exports = router;