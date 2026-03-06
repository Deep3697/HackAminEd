// server/src/lib/initDb.js
// Creates tables if they don't exist, establishes relationships, and seeds default data
const pool = require('./db');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    // 1. Ensure core tables and relationships exist
    await pool.query(`
      -- A. The Master Identity Table
      CREATE TABLE IF NOT EXISTS person (
        id               SERIAL PRIMARY KEY,
        "fullName"       VARCHAR(255) NOT NULL,
        "contactNo"      VARCHAR(50) NOT NULL,
        "whatsappNumber" VARCHAR(50),
        email            VARCHAR(255) UNIQUE NOT NULL,
        address          TEXT,
        password         TEXT NOT NULL,
        role             VARCHAR(50) DEFAULT 'Employee',
        "createdAt"      TIMESTAMP DEFAULT NOW(),
        "updatedAt"      TIMESTAMP DEFAULT NOW()
      );

      -- B. The Employee Specialization Table
      CREATE TABLE IF NOT EXISTS employee (
        id             SERIAL PRIMARY KEY,
        person_id      INTEGER REFERENCES person(id) ON DELETE CASCADE,
        employee_type  VARCHAR(100) NOT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- C. The Sales Order Table (Money Coming In)
      CREATE TABLE IF NOT EXISTS sales_order (
        id                SERIAL PRIMARY KEY,
        order_number      VARCHAR(50) UNIQUE NOT NULL,
        client_name       VARCHAR(255) NOT NULL,
        product_details   TEXT,
        amount            NUMERIC(15, 2) NOT NULL,
        status            VARCHAR(50) DEFAULT 'Pending Quote',
        rep_id            INTEGER REFERENCES person(id) ON DELETE SET NULL,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- D. The Purchase Order Table (Money Going Out)
      CREATE TABLE IF NOT EXISTS purchase_order (
        id                 SERIAL PRIMARY KEY,
        po_number          VARCHAR(50) UNIQUE NOT NULL,
        vendor_name        VARCHAR(255) NOT NULL,
        material_requested TEXT,
        amount             NUMERIC(15, 2) NOT NULL,
        status             VARCHAR(50) DEFAULT 'Awaiting Auth',
        department         VARCHAR(100) NOT NULL,
        created_by_id      INTEGER REFERENCES person(id) ON DELETE SET NULL,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database tables and relationships verified/created');

    // 2. Setup Password Hashing for our seeds
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 3. SEED TEST USERS INDIVIDUALLY
    // By checking each one separately, we avoid the "silent trap"

    // --- A. Seed the Admin ---
    const adminEmail = 'admin@telos.com';
    const checkAdmin = await pool.query('SELECT id FROM person WHERE email = $1', [adminEmail]);
    if (checkAdmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO person ("fullName", "contactNo", email, password, role) VALUES ($1, $2, $3, $4, $5)`,
        ['Amit Admin', '0000000000', adminEmail, defaultPassword, 'Admin']
      );
      console.log(`✅ Seeded Admin -> Email: ${adminEmail} | PW: password123`);
    }

    // --- B. Seed a Production Employee ---
    const prodEmail = 'production@telos.com';
    const checkProd = await pool.query('SELECT id FROM person WHERE email = $1', [prodEmail]);
    if (checkProd.rows.length === 0) {
      const prodResult = await pool.query(
        `INSERT INTO person ("fullName", "contactNo", email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['John Maker', '1111111111', prodEmail, defaultPassword, 'Employee']
      );
      // Link John to the Production team
      await pool.query(
        `INSERT INTO employee (person_id, employee_type) VALUES ($1, $2)`,
        [prodResult.rows[0].id, 'Production']
      );
      console.log(`✅ Seeded Production Worker -> Email: ${prodEmail} | PW: password123`);
    }

    // --- C. Seed a QC Employee ---
    const qcEmail = 'qc@telos.com';
    const checkQC = await pool.query('SELECT id FROM person WHERE email = $1', [qcEmail]);
    if (checkQC.rows.length === 0) {
      const qcResult = await pool.query(
        `INSERT INTO person ("fullName", "contactNo", email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['Sarah Checker', '2222222222', qcEmail, defaultPassword, 'Employee']
      );
      // Link Sarah to the QC team
      await pool.query(
        `INSERT INTO employee (person_id, employee_type) VALUES ($1, $2)`,
        [qcResult.rows[0].id, 'QC']
      );
      console.log(`✅ Seeded QC Worker -> Email: ${qcEmail} | PW: password123`);
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

module.exports = initDatabase;