// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDatabase = require('./lib/initDb');

// Initialize database tables on startup
initDatabase();

// 1. Import your new routes file
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commercialRoutes = require('./routes/commercialRoutes');
const app = express();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Use the routes (This makes the URL: http://localhost:5000/api/auth/register)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commercial', commercialRoutes);

// Health Check to test connection
app.get('/api/status', (req, res) => {
  res.json({ success: true, message: "Telos ERP Backend is LIVE" });
});

module.exports = app;