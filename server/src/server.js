// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initDatabase = require('./lib/initDb');

// 1. Import your new routes file
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commercialRoutes = require('./routes/commercialRoutes');
const productionRoutes = require('./routes/productionRoutes');
const supplyChainRoutes = require('./routes/supplyChainRoutes');
const financeRoutes = require('./routes/financeRoutes');
const hrRoutes = require('./routes/hrRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

// Initialize database tables on startup (don't block server if DB fails)
initDatabase().catch((err) => console.error('❌ DB init warning:', err.message));

// 2. Initialize App (This MUST come before any app.use calls)
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commercial', commercialRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/simulation', simulationRoutes);

// 5. Health Check to test connection
app.get('/api/status', (req, res) => {
  res.json({ success: true, message: "Telos ERP Backend is LIVE" });
});

module.exports = app;