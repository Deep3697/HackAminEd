// server/src/lib/db.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Required for Neon/managed services to handle self-signed certs
    rejectUnauthorized: false, 
  },
  // Higher timeout to accommodate serverless "cold starts"
  connectionTimeoutMillis: 15000, 
});

// Error handling for idle clients to prevent process crashes
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

// Verification check
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ Connection error:', err.stack));

module.exports = pool;
