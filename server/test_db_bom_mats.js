require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function checkDb() {
    try {
        const materials = await pool.query('SELECT * FROM bom_materials');
        console.log('BOM Materials:', materials.rows);
    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await pool.end();
    }
}

checkDb();
