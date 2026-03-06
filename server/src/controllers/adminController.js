const db = require('../lib/db'); 

// 1. GET ALL USERS (Joining the Employee table, excluding admins, descending order)
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p."fullName", p.email, p.role, e.employee_type
      FROM person p
      LEFT JOIN employee e ON p.id = e.person_id
      WHERE p.role != 'admin' 
      ORDER BY p.id DESC
    `;
    const result = await db.query(query);
    
    const formattedUsers = result.rows.map(user => ({
      id: user.id,
      displayId: `USR-${user.id}`,
      name: user.fullName || 'Unknown',
      email: user.email || '',
      role: user.role || 'user',
      // If they have an employee type, show it. Otherwise, show a dash.
      employeeType: user.employee_type || '-' 
    }));

    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. UPDATE ROLE AND EMPLOYEE TYPE
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params; 
    const { role, employeeType } = req.body; 

    // A. Update the main person table
    await db.query('UPDATE person SET role = $1 WHERE id = $2', [role, id]);

    // B. Handle the specific Employee table logic
    if (role === 'employee') {
      // Check if they already exist in the employee table
      const empCheck = await db.query('SELECT * FROM employee WHERE person_id = $1', [id]);
      
      if (empCheck.rows.length > 0) {
        // Update their existing department
        await db.query('UPDATE employee SET employee_type = $1 WHERE person_id = $2', [employeeType, id]);
      } else {
        // Insert them as a brand new employee
        await db.query('INSERT INTO employee (person_id, employee_type) VALUES ($1, $2)', [id, employeeType]);
      }
    } else {
      // If Amit downgrades them to a user or contractor, delete them from the employee table
      await db.query('DELETE FROM employee WHERE person_id = $1', [id]);
    }

    res.json({ success: true, message: "Role and department updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};