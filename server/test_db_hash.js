// /tmp/test_db_hash.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function checkHash() {
    try {
        const result = await pool.query('SELECT email, password FROM person LIMIT 1');
        if (result.rows.length === 0) {
            console.log('No users found in "person" table.');
            return;
        }

        const user = result.rows[0];
        console.log('Found user:', user.email);
        console.log('Hash length:', user.password.length);
        console.log('Hash value:', user.password);

        // Normal bcrypt hash length is 60 characters
        if (user.password.length !== 60) {
            console.log('🚨 WARNING: Hash length is not 60! The database column might be truncating the hash.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
    }
}

checkHash();
