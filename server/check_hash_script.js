const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: 'e:/HackAminEd/server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT email, password FROM person LIMIT 1');
        if (res.rows.length === 0) {
            fs.writeFileSync('db_test_result.txt', 'No users found in person table');
        } else {
            const u = res.rows[0];
            fs.writeFileSync('db_test_result.txt', 'Email: ' + u.email + '\nHash Length: ' + String(u.password).length + '\nHash: ' + u.password);
        }
    } catch (e) {
        fs.writeFileSync('db_test_result.txt', 'Error: ' + e.message);
    } finally {
        pool.end();
    }
}

check();
