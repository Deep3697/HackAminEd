require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const testTables = async () => {
    try {
        console.log("Checking tables...");
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("Tables:", result.rows.map(r => r.table_name));

    } catch (error) {
        console.error("SQL Error:", error);
    } finally {
        pool.end();
    }
};

testTables();
