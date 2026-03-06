// server/src/lib/db.js
// PostgreSQL connection pool using 'pg' package
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Connected to PostgreSQL database'))
    .catch((err) => console.error('❌ Database connection error:', err.message));

module.exports = pool;
