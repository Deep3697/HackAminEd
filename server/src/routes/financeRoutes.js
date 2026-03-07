// server/src/routes/financeRoutes.js
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const verifyToken = require('../middlewares/verifyToken');

// GET routes for different RBAC views
router.get('/admin', verifyToken, financeController.getAdminFinance);
router.get('/contractor', verifyToken, financeController.getContractorFinance);
router.get('/customer', verifyToken, financeController.getCustomerFinance);

// POST route for Journal Entries
router.post('/journal', verifyToken, financeController.createJournalEntry);

module.exports = router;