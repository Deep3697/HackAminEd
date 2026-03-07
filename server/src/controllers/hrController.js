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
    res.json({ employees: result.rows });
  } catch (error) {
    console.error("Error fetching Admin Payroll:", error);
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
};

// 2. EMPLOYEE: Fetch personal payslips for the logged-in user
exports.getEmployeePayslips = async (req, res) => {
  try {
    const userId = req.user.id; // From verifyToken middleware
    
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

// 3. ACTION ENDPOINTS (Dummies to make the UI buttons work for now)
exports.runAction = async (req, res) => {
  // In a real app, this would execute heavy payroll math or DB updates
  res.status(200).json({ success: true, message: 'Action completed successfully.' });
};