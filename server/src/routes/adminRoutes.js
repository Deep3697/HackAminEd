const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/verifyToken');

// Get all users for the table (Protected - requires authentication)
router.get('/users', verifyToken, adminController.getAllUsers);

// Update a specific user's role and employee type (Protected - requires authentication)
router.put('/users/:id/role', verifyToken, adminController.updateUserRole);

module.exports = router;