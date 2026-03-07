require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const testDashboardSQL = async () => {
  try {
    console.log('Connecting database...');

    const inquiriesResult = await pool.query("SELECT COUNT(*) FROM sales_order WHERE status = 'Pending Quote'");
    const productionResult = await pool.query("SELECT COUNT(*) FROM production_job WHERE status NOT IN ('COMPLETED', 'Completed', 'Cancelled')");
    const receiptsResult = await pool.query("SELECT COUNT(*) FROM qc_inspection WHERE status = 'Pending Inspection'");
    const alertsResult = await pool.query("SELECT COUNT(*) FROM maintenance_record WHERE status = 'Scheduled' OR priority = 'Critical'");

    const salesOrdersResult = await pool.query(`
      SELECT order_number, client_name, created_at, status
      FROM sales_order
      ORDER BY created_at DESC
      LIMIT 4
    `);

    const inventoryAlertsResult = await pool.query(`
      SELECT item_code, name, qty, unit
      FROM inventory_item
      ORDER BY qty ASC
      LIMIT 4
    `);

    const kpis = {
      inquiries: parseInt(inquiriesResult.rows[0].count, 10),
      production: parseInt(productionResult.rows[0].count, 10),
      receipts: parseInt(receiptsResult.rows[0].count, 10),
      alerts: parseInt(alertsResult.rows[0].count, 10)
    };

    console.log('=== SQL RESULTS ===');
    console.log('KPIs:', kpis);
    console.log('Sales Orders:', salesOrdersResult.rows);
    console.log('Inventory:', inventoryAlertsResult.rows);
  } catch (error) {
    console.error('SQL Error:', error);
  } finally {
    pool.end();
  }
};

testDashboardSQL();
