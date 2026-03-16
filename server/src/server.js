// server/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables.  The .env file now lives inside the server
// folder (not at workspace root).  dotenv will silently succeed even if the
// file is missing, so we log a warning for convenience during development.
const envPath = path.resolve(__dirname, '../.env');
const result = require('dotenv').config({ path: envPath });
if (result.error) {
  console.warn(`⚠️ .env file not found at ${envPath}. Using process.env values.`);
}

const initDatabase = require('./lib/initDb');
const { initReminderJob } = require('./jobs/reminderJob');

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
const aiRoutes = require('./routes/aiRoutes');

// Initialize database tables on startup (don't block server if DB fails)
initDatabase().then(() => {
  // Start the background jobs once DB is up
  initReminderJob();
}).catch((err) => console.error('❌ DB init warning:', err.message));

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
app.use('/api/ai', aiRoutes);

// 5. Health Check to test connection
app.get('/api/status', (req, res) => {
  res.json({ success: true, message: "Telos ERP Backend is LIVE" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;