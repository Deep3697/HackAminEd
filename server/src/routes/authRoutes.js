// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// This maps the URL to the logic in your controller
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;