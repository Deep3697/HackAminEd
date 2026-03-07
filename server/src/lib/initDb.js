// server/src/lib/initDb.js
// Master Database Initialization (schema + one bootstrap admin only - no other dummy data)
const pool = require('./db');
const bcrypt = require('bcrypt');

async function initDatabase() {
  try {
    console.log('⏳ Initializing database schema...');

    await pool.query(`
      -- A. Master Identity
      CREATE TABLE IF NOT EXISTS person (
        id SERIAL PRIMARY KEY, "fullName" VARCHAR(255) NOT NULL, "contactNo" VARCHAR(50) NOT NULL, "whatsappNumber" VARCHAR(50),
        email VARCHAR(255) UNIQUE NOT NULL, address TEXT, password TEXT NOT NULL, role VARCHAR(50) DEFAULT 'Employee',
        "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      -- B. Employee Roles
      CREATE TABLE IF NOT EXISTS employee (
        id SERIAL PRIMARY KEY, person_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
        employee_type VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- C. Sales & Purchase
      CREATE TABLE IF NOT EXISTS sales_order (
        id SERIAL PRIMARY KEY, order_number VARCHAR(50) UNIQUE NOT NULL, client_name VARCHAR(255) NOT NULL,
        product_details TEXT, amount NUMERIC(15, 2) NOT NULL, status VARCHAR(50) DEFAULT 'Pending Quote',
        rep_id INTEGER REFERENCES person(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS purchase_order (
        id SERIAL PRIMARY KEY, po_number VARCHAR(50) UNIQUE NOT NULL, vendor_name VARCHAR(255) NOT NULL,
        material_requested TEXT, amount NUMERIC(15, 2) NOT NULL, status VARCHAR(50) DEFAULT 'Awaiting Auth',
        department VARCHAR(100) NOT NULL, created_by_id INTEGER REFERENCES person(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- D. Inventory & Logistics
      CREATE TABLE IF NOT EXISTS inventory_item (
        item_code VARCHAR(50) PRIMARY KEY, name VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL,
        qty INTEGER NOT NULL DEFAULT 0, unit VARCHAR(20) NOT NULL, location VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Healthy', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS fleet_vehicle (
        vehicle_id VARCHAR(50) PRIMARY KEY, driver_name VARCHAR(255) DEFAULT 'Unassigned', destination VARCHAR(255) DEFAULT '-',
        status VARCHAR(100) DEFAULT 'Idle (Yard)', eta VARCHAR(50) DEFAULT '-', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS logistics_movement (
        movement_id VARCHAR(50) PRIMARY KEY, type VARCHAR(50) NOT NULL, partner VARCHAR(255) NOT NULL,
        status VARCHAR(100) NOT NULL, handled_by_id INTEGER REFERENCES person(id) ON DELETE SET NULL,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- E. Production & QC
      CREATE TABLE IF NOT EXISTS production_job (
        job_id VARCHAR(50) PRIMARY KEY, product_name VARCHAR(255) NOT NULL, qty INTEGER NOT NULL,
        progress INTEGER DEFAULT 0, status VARCHAR(100) DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS qc_inspection (
        id SERIAL PRIMARY KEY, job_reference VARCHAR(50) UNIQUE NOT NULL, inspector_id INTEGER REFERENCES person(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'Pending Inspection', notes TEXT, logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- F. Finance & Statutory Tables
      CREATE TABLE IF NOT EXISTS general_ledger (
        id SERIAL PRIMARY KEY,
        txn_id VARCHAR(50) UNIQUE NOT NULL,
        account_head VARCHAR(255) NOT NULL,
        txn_type VARCHAR(50) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        txn_date DATE NOT NULL,
        payment_mode VARCHAR(100),
        logged_by INTEGER REFERENCES person(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS statutory_compliance (
        id SERIAL PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        deadline DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Upcoming',
        severity VARCHAR(50) DEFAULT 'mid'
      );

      CREATE TABLE IF NOT EXISTS vendor_invoice (
        id SERIAL PRIMARY KEY,
        invoice_ref VARCHAR(50) UNIQUE NOT NULL,
        vendor_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending Approval',
        submitted_at DATE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customer_bill (
        id SERIAL PRIMARY KEY,
        bill_ref VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
        order_ref VARCHAR(50),
        amount NUMERIC(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Unpaid',
        issued_at DATE NOT NULL
      );

      -- ==========================================
      -- HR & PAYROLL MODULE TABLES
      -- ==========================================

      -- 1. Attendance Record
      CREATE TABLE IF NOT EXISTS attendance_record (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
        payment_cycle VARCHAR(50) NOT NULL, -- e.g., 'OCT 2023'
        attendance_percentage NUMERIC(5, 2) DEFAULT 100.00,
        days_present INTEGER NOT NULL,
        total_working_days INTEGER NOT NULL,
        last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, payment_cycle)
      );

      -- 2. Payroll & Payslip Record
      CREATE TABLE IF NOT EXISTS payroll_record (
        id SERIAL PRIMARY KEY,
        payslip_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'PS-9920'
        employee_id INTEGER REFERENCES person(id) ON DELETE CASCADE,
        payment_cycle VARCHAR(50) NOT NULL,
        base_salary NUMERIC(15, 2) NOT NULL,
        gross_pay NUMERIC(15, 2) NOT NULL,
        tax_deductions NUMERIC(15, 2) DEFAULT 0.00,
        net_pay NUMERIC(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Processing', 'Dispatched'
        processed_at TIMESTAMP,
        UNIQUE(employee_id, payment_cycle)
      );

      -- ==========================================
      -- MAINTENANCE & ASSETS MODULE TABLES
      -- ==========================================

      -- 1. Asset Master Registry
      CREATE TABLE IF NOT EXISTS asset_registry (
        id SERIAL PRIMARY KEY,
        asset_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'AST-501'
        asset_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Running', -- 'Running', 'Critical', 'Idle', 'Maintenance'
        health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
        capital_value NUMERIC(15, 2) NOT NULL,
        last_service DATE,
        next_service_date DATE, -- Can be a specific date or null for 'URGENT/Pending'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Maintenance Work Orders & Audit Log
      CREATE TABLE IF NOT EXISTS maintenance_record (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'WO-1001'
        asset_code VARCHAR(50) REFERENCES asset_registry(asset_code) ON DELETE CASCADE,
        reported_by INTEGER REFERENCES person(id) ON DELETE SET NULL, -- Operator who reported it
        technician_id INTEGER REFERENCES person(id) ON DELETE SET NULL, -- Assigned technician
        task_type VARCHAR(50) NOT NULL, -- 'Preventive', 'Corrective', 'Emergency'
        priority VARCHAR(50) DEFAULT 'Standard', -- 'Standard', 'Critical'
        issue_description TEXT,
        action_performed TEXT,
        cost NUMERIC(15, 2) DEFAULT 0.00, -- Links to Finance expenditures
        status VARCHAR(50) DEFAULT 'Scheduled', -- 'Scheduled', 'In Progress', 'Completed'
        scheduled_date DATE,
        completed_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- ==========================================
      -- REVERSE EXPLOSION & SIMULATION TABLES
      -- ==========================================

      -- 1. Items Master List (Finished Goods & Raw Materials)
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL, -- e.g., 'kg', 'Ltr', 'Units'
        current_stock NUMERIC(10, 2) DEFAULT 0,
        unit_cost NUMERIC(15, 2) DEFAULT 0.00 -- Used to calculate Indent gap costs
      );

      -- 2. Bills of Material (BOM) Master
      CREATE TABLE IF NOT EXISTS boms (
        id SERIAL PRIMARY KEY,
        finished_good_id INTEGER REFERENCES items(id) ON DELETE CASCADE UNIQUE
      );

      -- 3. BOM Materials (The Recipe components)
      CREATE TABLE IF NOT EXISTS bom_materials (
        id SERIAL PRIMARY KEY,
        bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE,
        raw_material_id INTEGER REFERENCES items(id) ON DELETE RESTRICT,
        quantity_required NUMERIC(10, 2) NOT NULL,
        man_hours_per_unit NUMERIC(10, 2) DEFAULT 0.00
      );

      -- 4. Simulation Audit History (New Table for the UI)
      CREATE TABLE IF NOT EXISTS simulation_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES person(id) ON DELETE SET NULL, -- Who ran the simulation
        target_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        target_qty INTEGER NOT NULL,
        procurement_gap NUMERIC(15, 2) DEFAULT 0.00,
        simulated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      -- ==========================================
      -- REMINDERS MODULE TABLES
      -- ==========================================
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        contact_person VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        invoice_date DATE NOT NULL,
        credit_period_days INTEGER NOT NULL DEFAULT 30,
        due_date DATE GENERATED ALWAYS AS (invoice_date + credit_period_days) STORED,
        amount NUMERIC(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS communication_logs (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        channel VARCHAR(50) NOT NULL, 
        message_type VARCHAR(50) NOT NULL, 
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'success'
      );
    `);

    // Single bootstrap admin so login works (amit.admin@telos.com / password123)
    const adminEmail = (process.env.ADMIN_EMAIL || 'amit.admin@telos.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const check = await pool.query('SELECT id FROM person WHERE LOWER(TRIM(email)) = $1', [adminEmail]);
    if (check.rows.length === 0) {
      const hashed = await bcrypt.hash(adminPassword, await bcrypt.genSalt(10));
      await pool.query(
        `INSERT INTO person ("fullName", "contactNo", email, address, password, role) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Amit Admin', '0000000000', adminEmail, 'System admin', hashed, 'admin']
      );
      console.log('✅ Bootstrap admin created:', adminEmail);
    }

    console.log('✅ Database schema verified/created.');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

module.exports = initDatabase;