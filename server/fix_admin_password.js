// One-time fix: set amit.admin@telos.com password to bcrypt('password123')
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/lib/db');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'amit.admin@telos.com').trim().toLowerCase();
const NEW_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

async function fix() {
  try {
    const hashed = await bcrypt.hash(NEW_PASSWORD, await bcrypt.genSalt(10));
    const result = await pool.query(
      `UPDATE person SET password = $1 WHERE LOWER(TRIM(email)) = $2 RETURNING id, "fullName", email, role`,
      [hashed, ADMIN_EMAIL]
    );
    if (result.rowCount === 0) {
      console.log('No user found with email:', ADMIN_EMAIL);
    } else {
      console.log('✅ Password updated for:', result.rows[0].email, '| Role:', result.rows[0].role);
      console.log('   You can now log in with password:', NEW_PASSWORD);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

fix();
