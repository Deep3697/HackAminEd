// server/src/controllers/hrController.js
const pool = require('../lib/db');

// 1. ADMIN: Fetch all employees for a specific payment cycle
exports.getAdminPayroll = async (req, res) => {
  try {
    const { cycle } = req.params; // e.g., 'OCT 2023'

    const query = `
      SELECT 
        p.id, 
        p."fullName" as name, 
        a.attendance_percentage as attendance, 
        pr.gross_pay as gross, 
        pr.net_pay as net, 
        pr.status 
      FROM person p
      JOIN attendance_record a ON p.id = a.employee_id
      JOIN payroll_record pr ON p.id = pr.employee_id
      WHERE a.payment_cycle = $1 AND pr.payment_cycle = $1
    `;

    const result = await pool.query(query, [cycle]);

    // Calculate summary KPIs from this data
    let totalHeads = result.rows.length;
    let totalAttendance = 0;
    let grossTotal = 0;
    let taxTotal = 0;

    result.rows.forEach(emp => {
      totalAttendance += parseFloat(emp.attendance || 0);
      grossTotal += parseFloat(emp.gross || 0);
    });

    // Get tax deductions sum
    const taxQuery = `SELECT COALESCE(SUM(tax_deductions), 0) as tax_total FROM payroll_record WHERE payment_cycle = $1`;
    const taxResult = await pool.query(taxQuery, [cycle]);
    taxTotal = parseFloat(taxResult.rows[0]?.tax_total || 0);

    const avgAttendance = totalHeads > 0 ? (totalAttendance / totalHeads).toFixed(1) : '0.0';

    res.json({
      employees: result.rows,
      summary: {
        totalHeads,
        avgAttendance,
        grossTotal: grossTotal.toFixed(2),
        statutoryDues: taxTotal.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error fetching Admin Payroll:", error);
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
};

// 2. EMPLOYEE: Fetch personal payslips for the logged-in user
exports.getEmployeePayslips = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        payslip_id as id, 
        payment_cycle as cycle, 
        gross_pay as gross, 
        net_pay as net, 
        status 
      FROM payroll_record 
      WHERE employee_id = $1 
      ORDER BY processed_at DESC, id DESC
    `;

    const result = await pool.query(query, [userId]);
    res.json({ payslips: result.rows });
  } catch (error) {
    console.error("Error fetching Employee Payslips:", error);
    res.status(500).json({ error: 'Failed to fetch personal payslips' });
  }
};

// 3. GET ATTENDANCE DETAILS for a specific employee in a month/year
exports.getAttendanceDetails = async (req, res) => {
  try {
    const { employeeId, year, month } = req.params;

    // Get employee name
    const empResult = await pool.query('SELECT "fullName" FROM person WHERE id = $1', [employeeId]);
    const employeeName = empResult.rows[0]?.fullName || 'Unknown';

    // Get daily attendance records for the given month
    const query = `
      SELECT attendance_date, status 
      FROM daily_attendance 
      WHERE employee_id = $1 
        AND EXTRACT(YEAR FROM attendance_date) = $2 
        AND EXTRACT(MONTH FROM attendance_date) = $3
      ORDER BY attendance_date ASC
    `;
    const result = await pool.query(query, [employeeId, year, month]);

    // Build a map of date -> status
    const attendanceMap = {};
    result.rows.forEach(row => {
      const dateStr = new Date(row.attendance_date).toISOString().split('T')[0];
      attendanceMap[dateStr] = row.status;
    });

    res.json({
      success: true,
      employeeName,
      attendance: attendanceMap
    });
  } catch (error) {
    console.error("Error fetching attendance details:", error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// 4. MARK/UPDATE ATTENDANCE for a specific employee on a specific date
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;
    const markedBy = req.user.id;

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "present" or "absent"' });
    }

    const query = `
      INSERT INTO daily_attendance (employee_id, attendance_date, status, marked_by) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (employee_id, attendance_date) 
      DO UPDATE SET status = $3, marked_by = $4
      RETURNING *
    `;
    await pool.query(query, [employeeId, date, status, markedBy]);

    res.json({ success: true, message: `Attendance for ${date} marked as ${status}` });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

// 5. RUN MONTHLY PAYROLL — Recalculates salary based on attendance
exports.runMonthlyPayroll = async (req, res) => {
  try {
    const { cycle } = req.body; // e.g., 'MAR 2026'

    if (!cycle) return res.status(400).json({ error: 'Payment cycle is required' });

    // Parse cycle to get month and year
    const parts = cycle.split(' ');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthNum = monthNames.indexOf(parts[0]) + 1;
    const yearNum = parseInt(parts[1]);

    if (monthNum === 0 || !yearNum) {
      return res.status(400).json({ error: 'Invalid cycle format. Use e.g., "MAR 2026"' });
    }

    // Calculate working days in the month (exclude weekends)
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(yearNum, monthNum - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }

    // Get all employees
    const empQuery = `SELECT id, "fullName" FROM person WHERE role != 'contractor' AND role != 'user'`;
    const empResult = await pool.query(empQuery);

    let processedCount = 0;

    for (const emp of empResult.rows) {
      // Count present days from daily_attendance
      const countQuery = `
        SELECT COUNT(*) as present_days 
        FROM daily_attendance 
        WHERE employee_id = $1 
          AND EXTRACT(YEAR FROM attendance_date) = $2 
          AND EXTRACT(MONTH FROM attendance_date) = $3
          AND status = 'present'
      `;
      const countResult = await pool.query(countQuery, [emp.id, yearNum, monthNum]);
      const presentDays = parseInt(countResult.rows[0]?.present_days || 0);

      // If no daily attendance records, assume full attendance (for existing data)
      const effectivePresentDays = presentDays > 0 ? presentDays : workingDays;
      const attendancePercentage = workingDays > 0 ? ((effectivePresentDays / workingDays) * 100).toFixed(2) : 100;

      // Update/Create attendance_record
      await pool.query(`
        INSERT INTO attendance_record (employee_id, payment_cycle, attendance_percentage, days_present, total_working_days, last_synced)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (employee_id, payment_cycle)
        DO UPDATE SET attendance_percentage = $3, days_present = $4, total_working_days = $5, last_synced = CURRENT_TIMESTAMP
      `, [emp.id, cycle, attendancePercentage, effectivePresentDays, workingDays]);

      // Get or create base salary (check if existing payroll record has base_salary)
      const existingPayroll = await pool.query(
        'SELECT base_salary FROM payroll_record WHERE employee_id = $1 ORDER BY id DESC LIMIT 1',
        [emp.id]
      );
      const baseSalary = existingPayroll.rows[0]?.base_salary || 6000; // Default base salary

      // Calculate pay
      const grossPay = (parseFloat(baseSalary) * parseFloat(attendancePercentage) / 100).toFixed(2);
      const taxDeductions = (parseFloat(grossPay) * 0.10).toFixed(2); // 10% tax deduction
      const netPay = (parseFloat(grossPay) - parseFloat(taxDeductions)).toFixed(2);

      const payslipId = `PS-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update/Create payroll_record
      await pool.query(`
        INSERT INTO payroll_record (payslip_id, employee_id, payment_cycle, base_salary, gross_pay, tax_deductions, net_pay, status, processed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Dispatched', CURRENT_TIMESTAMP)
        ON CONFLICT (employee_id, payment_cycle)
        DO UPDATE SET gross_pay = $5, tax_deductions = $6, net_pay = $7, status = 'Dispatched', processed_at = CURRENT_TIMESTAMP
      `, [payslipId, emp.id, cycle, baseSalary, grossPay, taxDeductions, netPay]);

      processedCount++;
    }

    res.json({
      success: true,
      message: `Payroll processed for ${processedCount} employees in cycle ${cycle}. Salary deducted based on attendance.`
    });
  } catch (error) {
    console.error("Error running payroll:", error);
    res.status(500).json({ error: `Payroll run failed: ${error.message}` });
  }
};

// 6. GET AVAILABLE CYCLES
exports.getAvailableCycles = async (req, res) => {
  try {
    // Get cycles from existing payroll records
    const query = `SELECT DISTINCT payment_cycle FROM payroll_record ORDER BY payment_cycle`;
    const result = await pool.query(query);

    const dbCycles = result.rows.map(r => r.payment_cycle);

    // Also generate the last 24 months dynamically
    const generatedCycles = [];
    const now = new Date();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      generatedCycles.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    // Merge and deduplicate
    const allCycles = [...new Set([...generatedCycles, ...dbCycles])];

    res.json({ success: true, cycles: allCycles });
  } catch (error) {
    console.error("Error fetching cycles:", error);
    res.status(500).json({ error: 'Failed to fetch cycles' });
  }
};

// 7. GET ALL EMPLOYEES FOR ATTENDANCE MODAL
exports.getAllEmployees = async (req, res) => {
  try {
    const query = `SELECT id, "fullName" as name FROM person WHERE role != 'contractor' AND role != 'user' ORDER BY id`;
    const result = await pool.query(query);
    res.json({ success: true, employees: result.rows });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// 8. ACTION ENDPOINTS (kept for backwards compat)
exports.runAction = async (req, res) => {
  res.status(200).json({ success: true, message: 'Action completed successfully.' });
};