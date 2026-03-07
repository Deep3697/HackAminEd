// server/src/controllers/maintenanceController.js
const pool = require('../lib/db');

// 1. Fetch All Assets (For both Admins and Floor Staff)
exports.getAssets = async (req, res) => {
  try {
    const assets = await pool.query("SELECT * FROM asset_registry ORDER BY asset_code ASC");
    res.json({ assets: assets.rows });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: 'Failed to fetch asset data' });
  }
};

// 2. Fetch Audit Logs (Completed Maintenance Records)
exports.getAuditLogs = async (req, res) => {
  try {
    const query = `
      SELECT m.*, a.asset_name, p."fullName" as technician_name
      FROM maintenance_record m
      JOIN asset_registry a ON m.asset_code = a.asset_code
      LEFT JOIN person p ON m.technician_id = p.id
      WHERE m.status = 'Completed'
      ORDER BY m.completed_date DESC
    `;
    const logs = await pool.query(query);
    res.json({ logs: logs.rows });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// 3. Generic Action Endpoint (To handle form submissions for now)
exports.submitAction = async (req, res) => {
  try {
    // In a fully built app, this is where you would INSERT into maintenance_record
    // or UPDATE asset_registry based on req.body.actionType
    res.status(200).json({ success: true, message: 'Action recorded successfully.' });
  } catch (error) {
    console.error("Error processing maintenance action:", error);
    res.status(500).json({ error: 'Failed to process action' });
  }
};