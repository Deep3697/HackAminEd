require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function checkDb() {
    try {
        const boms = await pool.query('SELECT * FROM boms');
        console.log('BOMs:', boms.rows);

        const items = await pool.query('SELECT id, name FROM items');
        console.log('Items:', items.rows);
    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await pool.end();
    }
}

checkDb();
