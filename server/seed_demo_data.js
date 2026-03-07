// seed_demo_data.js
// Optional one-time/demo seeding for users and supply-chain data.
// Run manually with: npm run seed-demo

const bcrypt = require('bcrypt');
const pool = require('./src/lib/db');

async function seedDemoData() {
  try {
    console.log('⏳ Seeding demo users and supply-chain data...');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const usersToSeed = [
      { email: 'admin@telos.com', name: 'Deep Admin', role: 'Admin', type: null },
      { email: 'logistics@telos.com', name: 'Rahul Transport', role: 'Employee', type: 'Transport & Logistics Worker' },
      { email: 'sales@telos.com', name: 'Neha Sales', role: 'Employee', type: 'Sales & Purchase Manager' },
      { email: 'production@telos.com', name: 'Vikram Prod', role: 'Employee', type: 'Production & Quality Lead' },
      { email: 'hr@telos.com', name: 'Priya HR', role: 'Employee', type: 'HR & Payroll Officer' },
    ];

    for (const u of usersToSeed) {
      const checkUser = await pool.query('SELECT id FROM person WHERE email = $1', [u.email]);
      if (checkUser.rows.length === 0) {
        const res = await pool.query(
          `INSERT INTO person ("fullName", "contactNo", email, password, role)
           VALUES ($1, '0000000000', $2, $3, $4) RETURNING id`,
          [u.name, u.email, defaultPassword, u.role]
        );
        if (u.type) {
          await pool.query(
            `INSERT INTO employee (person_id, employee_type) VALUES ($1, $2)`,
            [res.rows[0].id, u.type]
          );
        }
      }
    }

    await pool.query(`
      -- Inventory
      INSERT INTO inventory_item (item_code, name, category, qty, unit, location, status) VALUES 
      ('RM-501', 'Aluminium Alloy 6061', 'Raw Material', 1200, 'kg', 'A1-S2-B4', 'Healthy'),
      ('RM-505', 'Industrial Grade Resin', 'Raw Material', 45, 'Ltr', 'A4-S1-B2', 'Critical'),
      ('FG-902', 'Assembled Turbine V2', 'Finished Good', 12, 'pcs', 'D2-S3-B1', 'Low Stock')
      ON CONFLICT (item_code) DO NOTHING;

      -- Fleet
      INSERT INTO fleet_vehicle (vehicle_id, driver_name, destination, status, eta) VALUES 
      ('TRK-001', 'Rahul S.', 'Gujarat Plant', 'En Route', '4:30 PM'),
      ('TRK-002', 'Vikram M.', 'Mumbai Port', 'Loading Gate 2', '-'),
      ('TRK-003', 'Unassigned', '-', 'Idle (Yard)', '-')
      ON CONFLICT (vehicle_id) DO NOTHING;

      -- Logistics Movements
      INSERT INTO logistics_movement (movement_id, type, partner, status, handled_by_id) VALUES 
      ('TRK-881', 'INBOUND', 'Global Metals', 'Gate Entry', (SELECT id FROM person WHERE email = 'logistics@telos.com' LIMIT 1)),
      ('DIS-202', 'OUTBOUND', 'Reliance Projects', 'Loading', (SELECT id FROM person WHERE email = 'logistics@telos.com' LIMIT 1)),
      ('TRK-890', 'INBOUND', 'Resin World', 'In Transit', (SELECT id FROM person WHERE email = 'logistics@telos.com' LIMIT 1))
      ON CONFLICT (movement_id) DO NOTHING;

      -- Production Jobs
      INSERT INTO production_job (job_id, product_name, qty, progress, status) VALUES 
      ('JOB-202', 'Industrial Turbine Blade', 50, 75, 'MACHINING'),
      ('JOB-206', 'Hydraulic Seals', 200, 30, 'MOLDING'),
      ('JOB-209', 'Gear Assembly', 15, 95, 'FINISHING')
      ON CONFLICT (job_id) DO NOTHING;

      -- QC Inspections
      INSERT INTO qc_inspection (job_reference, status, notes, inspector_id) VALUES 
      ('JOB-199', 'Pending Inspection', 'Check tolerances on turbine blades', (SELECT id FROM person WHERE email = 'production@telos.com' LIMIT 1)),
      ('JOB-195', 'Rework', 'Seal alignment off by 2mm', (SELECT id FROM person WHERE email = 'production@telos.com' LIMIT 1))
      ON CONFLICT (job_reference) DO NOTHING;
    `);

    console.log('✅ Demo data seeding complete.');
  } catch (err) {
    console.error('❌ Error seeding demo data:', err.message);
  } finally {
    await pool.end();
  }
}

seedDemoData();

