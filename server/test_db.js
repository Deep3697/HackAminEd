require('dotenv').config({ path: 'e:/HackAminEd/server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const res = await pool.query('SELECT * FROM person');
        console.log("Person table rows:", res.rows);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        pool.end();
    }
}

check();
