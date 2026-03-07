require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function checkDb() {
    try {
        const bomQuery = `
      SELECT 
        bm.raw_material_id, 
        i.name AS material_name, 
        i.unit, 
        i.current_stock, 
        bm.quantity_required, 
        bm.man_hours_per_unit
      FROM boms b
      JOIN bom_materials bm ON b.id = bm.bom_id
      JOIN items i ON bm.raw_material_id = i.id
      WHERE b.finished_good_id = $1;
    `;

        console.log("Running Query for finished_good_id = 1");
        const result = await pool.query(bomQuery, [1]);
        console.log('Result Length:', result.rows.length);
        console.log('Results:', result.rows);
    } catch (error) {
        console.error('SQL Error Caught:', error.message);
    } finally {
        await pool.end();
    }
}

checkDb();
