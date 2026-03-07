// server/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { processCommand } = require('../controllers/aiController');

// support two common endpoint names in case the frontend env changed
// previous versions used '/command'; newer setups may prefer '/chat' or '/message'
// this way the frontend can simply change VITE_AI_ENDPOINT without touching the server.
router.post(['/command', '/chat', '/message'], processCommand);

module.exports = router;