// server/src/controllers/supplyChainController.js
const pool = require('../lib/db');

// 1. Fetch Inventory Items
exports.getInventory = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_item ORDER BY item_code ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Server error while fetching inventory' });
  }
};

// 2. Fetch Fleet Vehicles
exports.getFleet = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fleet_vehicle ORDER BY vehicle_id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Server error while fetching fleet' });
  }
};

// 3. Fetch Logistics Movements
exports.getMovements = async (req, res) => {
  try {
    // We use a JOIN here to get the actual name of the worker who handled it
    const result = await pool.query(`
      SELECT m.*, p."fullName" as handler_name 
      FROM logistics_movement m
      LEFT JOIN person p ON m.handled_by_id = p.id
      ORDER BY m.logged_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: 'Server error while fetching movements' });
  }
};