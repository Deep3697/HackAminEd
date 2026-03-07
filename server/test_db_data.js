require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function checkDb() {
    try {
        console.log('--- SAMPLE DATA ---');
        const jobs = await pool.query('SELECT * FROM production_job LIMIT 2');
        console.log('production_job:', jobs.rows);

        const qc = await pool.query('SELECT * FROM qc_inspection LIMIT 2');
        console.log('qc_inspection:', qc.rows);

        const hr = await pool.query('SELECT * FROM employee LIMIT 2');
        console.log('employee:', hr.rows);

        const assets = await pool.query('SELECT * FROM asset_registry LIMIT 2');
        console.log('asset_registry:', assets.rows);

    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await pool.end();
    }
}

checkDb();
