// reset_dummy_passwords.js
// Dev helper script: reset ALL non-admin users' passwords to "password123"

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetDummyPasswords() {
  try {
    const NEW_PASSWORD = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(NEW_PASSWORD, salt);

    const result = await pool.query(
      `
        UPDATE person
        SET password = $1
        WHERE role <> 'admin'
        RETURNING id, "fullName", email, role
      `,
      [hashed]
    );

    console.log('✅ Password reset complete for non-admin users.');
    console.log('Total updated rows:', result.rowCount);
    console.log('All non-admin users now have password:', NEW_PASSWORD);
  } catch (err) {
    console.error('❌ Error resetting dummy passwords:', err.message);
  } finally {
    await pool.end();
  }
}

resetDummyPasswords();

