const db = require('../lib/db');

// 1. BUILD COMMAND CENTER DASHBOARD DATA
exports.getDashboardMetrics = async (req, res) => {
  try {
    // A. Queries for the 4 Top KPI Cards
    const inquiriesResult = await db.query("SELECT COUNT(*) FROM sales_order WHERE status = 'Pending Quote'");
    const productionResult = await db.query("SELECT COUNT(*) FROM production_job WHERE status NOT IN ('COMPLETED', 'Completed', 'Cancelled')");
    const receiptsResult = await db.query("SELECT COUNT(*) FROM qc_inspection WHERE status = 'Pending Inspection'");
    const alertsResult = await db.query("SELECT COUNT(*) FROM maintenance_record WHERE status = 'Scheduled' OR priority = 'Critical'");

    // B. Queries for the 2 Data Tables
    const salesOrdersResult = await db.query(`
      SELECT order_number, client_name, created_at, status 
      FROM sales_order 
      ORDER BY created_at DESC 
      LIMIT 4
    `);

    const inventoryAlertsResult = await db.query(`
      SELECT item_code, name, qty, unit 
      FROM inventory_item 
      ORDER BY qty ASC 
      LIMIT 4
    `);

    // C. Format responses
    const kpis = {
      inquiries: parseInt(inquiriesResult.rows[0].count, 10),
      production: parseInt(productionResult.rows[0].count, 10),
      receipts: parseInt(receiptsResult.rows[0].count, 10),
      alerts: parseInt(alertsResult.rows[0].count, 10)
    };

    const formattedSalesOrders = salesOrdersResult.rows.map(order => {
      let badgeClass = 'badge-processing';
      const lowercaseStatus = order.status.toLowerCase();
      if (lowercaseStatus.includes('shipped') || lowercaseStatus.includes('dispatched')) badgeClass = 'badge-shipped';
      if (lowercaseStatus.includes('pending')) badgeClass = 'badge-warning';

      return {
        id: order.order_number,
        client: order.client_name,
        date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: order.status,
        badgeClass
      };
    });

    const formattedInventory = inventoryAlertsResult.rows.map(item => {
      let levelBadge = 'badge-warning';
      if (item.qty === 0) levelBadge = 'badge-critical';

      return {
        itemCode: item.item_code,
        description: item.name,
        level: `${item.qty} ${item.unit}`,
        badgeClass: levelBadge
      };
    });

    res.json({
      success: true,
      kpis,
      salesOrders: formattedSalesOrders,
      inventoryAlerts: formattedInventory
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ALL USERS (Joining the Employee table, excluding admins, descending order)
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p."fullName", p.email, p.role, e.employee_type
      FROM person p
      LEFT JOIN employee e ON p.id = e.person_id
      WHERE LOWER(TRIM(p.role)) <> 'admin'
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

// 3. UPDATE ROLE AND EMPLOYEE TYPE
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