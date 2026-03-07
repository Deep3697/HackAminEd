require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const testTables = async () => {
    try {
        const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = result.rows.map(r => r.table_name).join(', ');
        fs.writeFileSync('db_tables.txt', tables);
    } catch (error) {
        fs.writeFileSync('db_tables.txt', "Error: " + error.message);
    } finally {
        pool.end();
    }
};

testTables();
