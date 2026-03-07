// server/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { processCommand } = require('../controllers/aiController');

router.post('/command', processCommand);

module.exports = router;