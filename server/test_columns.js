require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const checkColumns = async () => {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'employee';
    `);
    fs.writeFileSync('employee_columns.txt', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    fs.writeFileSync('employee_columns.txt', `ERROR: ${err.message}`);
  } finally {
    pool.end();
  }
};

checkColumns();
