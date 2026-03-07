// cleanup_person_columns.js
// One-time helper to drop unnecessary relationship columns from the person table.
// Run manually with: node cleanup_person_columns.js  OR  add an npm script.

const pool = require('./src/lib/db');

async function cleanup() {
  try {
    console.log('⏳ Dropping unnecessary columns from person table (if they exist)...');

    const columnsToDrop = [
      'employees',
      'logistics_movements',
      'machine_downtimes',
      'purchase_orders',
      'qc_inspections',
      'sales_orders',
    ];

    for (const col of columnsToDrop) {
      try {
        // IF EXISTS so it won't error if column is already gone
        await pool.query(`ALTER TABLE person DROP COLUMN IF EXISTS ${col};`);
        console.log(`✔ Column "${col}" dropped (or did not exist).`);
      } catch (colErr) {
        console.error(`Error dropping column "${col}":`, colErr.message);
      }
    }

    console.log('✅ Cleanup complete.');
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
  } finally {
    await pool.end();
  }
}

cleanup();

