const db = require('../lib/db');

// --- 1. GET ALL SALES ORDERS ---
exports.getSalesOrders = async (req, res) => {
  try {
    const query = `
      SELECT s.order_number, s.client_name, s.amount, s.status, s.created_at, p."fullName" as rep
      FROM sales_order s
      LEFT JOIN person p ON s.rep_id = p.id
      ORDER BY s.id DESC
    `;
    const result = await db.query(query);

    // Format the raw database data to match your frontend exactly
    const formattedSales = result.rows.map(row => ({
      id: row.order_number,
      client: row.client_name,
      amount: `₹${Number(row.amount).toLocaleString()}`,
      status: row.status,
      date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rep: row.rep || 'Unknown'
    }));

    res.json({ success: true, sales: formattedSales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. GET ALL PURCHASE INDENTS ---
exports.getPurchaseOrders = async (req, res) => {
  try {
    const query = `
      SELECT po.po_number, po.vendor_name, po.amount, po.status, po.department, po.created_at, p."fullName" as created_by
      FROM purchase_order po
      LEFT JOIN person p ON po.created_by_id = p.id
      ORDER BY po.id DESC
    `;
    const result = await db.query(query);

    const formattedPurchases = result.rows.map(row => ({
      id: row.po_number,
      vendor: row.vendor_name,
      amount: `₹${Number(row.amount).toLocaleString()}`,
      status: row.status,
      dept: row.department,
      date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdBy: row.created_by || 'Unknown'
    }));

    res.json({ success: true, purchases: formattedPurchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. CREATE NEW SALES INQUIRY ---
exports.createSalesOrder = async (req, res) => {
  try {
    const { client, product, amount } = req.body;
    const repId = req.user.id; // Automatically grabbed from whoever is logged in!

    // Generate a clean order number, e.g., SO-8492
    const orderNumber = `SO-${Math.floor(1000 + Math.random() * 9000)}`;

    const query = `
      INSERT INTO sales_order (order_number, client_name, product_details, amount, rep_id, status)
      VALUES ($1, $2, $3, $4, $5, 'Pending Quote')
      RETURNING *
    `;
    await db.query(query, [orderNumber, client, product, amount, repId]);

    res.json({ success: true, message: "Sales Inquiry created successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. CREATE NEW PURCHASE INDENT ---
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendor, item, amount, department } = req.body;
    const creatorId = req.user.id;

    // Generate a clean PO number, e.g., PO-3910
    const poNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

    const query = `
      INSERT INTO purchase_order (po_number, vendor_name, material_requested, amount, department, created_by_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Awaiting Auth')
      RETURNING *
    `;
    await db.query(query, [poNumber, vendor, item, amount, department, creatorId]);

    res.json({ success: true, message: "Purchase Indent sent for approval!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 5. ADMIN APPROVE PURCHASE ORDER ---
exports.approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params; // The PO number (e.g., PO-1234)

    const query = `UPDATE purchase_order SET status = 'Approved' WHERE po_number = $1 RETURNING *`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Purchase order not found." });
    }

    res.json({ success: true, message: "Purchase Order Approved!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. ADMIN REJECT PURCHASE ORDER ---
exports.rejectPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `UPDATE purchase_order SET status = 'Rejected' WHERE po_number = $1 AND status = 'Awaiting Auth' RETURNING *`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Purchase order not found or already processed." });
    }
    res.json({ success: true, message: "Purchase Order Rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. CANCEL PURCHASE ORDER (Creator or Admin) ---
exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only allow cancel if the user created the order OR is admin
    let query, params;
    if (userRole === 'admin') {
      query = `UPDATE purchase_order SET status = 'Cancelled' WHERE po_number = $1 AND status = 'Awaiting Auth' RETURNING *`;
      params = [id];
    } else {
      query = `UPDATE purchase_order SET status = 'Cancelled' WHERE po_number = $1 AND status = 'Awaiting Auth' AND created_by_id = $2 RETURNING *`;
      params = [id, userId];
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found, already processed, or not yours to cancel." });
    }
    res.json({ success: true, message: "Purchase Order Cancelled." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 8. GET GST FILINGS (Vendor compliance check) ---
exports.getGstFilings = async (req, res) => {
  try {
    const query = `
      SELECT vendor_name, 
             COUNT(*) as total_orders,
             COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_orders,
             MAX(created_at) as last_order_date
      FROM purchase_order
      GROUP BY vendor_name
      ORDER BY last_order_date DESC
    `;
    const result = await db.query(query);

    const vendors = result.rows.map(row => {
      const daysSinceLastOrder = Math.floor((Date.now() - new Date(row.last_order_date).getTime()) / (1000 * 60 * 60 * 24));
      const compliant = daysSinceLastOrder < 180 && Number(row.approved_orders) > 0;
      return {
        vendor: row.vendor_name,
        totalOrders: Number(row.total_orders),
        approvedOrders: Number(row.approved_orders),
        lastOrderDate: new Date(row.last_order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        compliant
      };
    });

    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 9. GET TREND ANALYTICS (Monthly aggregated data for charts) ---
exports.getTrendAnalytics = async (req, res) => {
  try {
    const salesQuery = `
      SELECT TO_CHAR(created_at, 'Mon YYYY') as month_label,
             EXTRACT(YEAR FROM created_at) as yr,
             EXTRACT(MONTH FROM created_at) as mn,
             SUM(amount) as total
      FROM sales_order
      GROUP BY month_label, yr, mn
      ORDER BY yr DESC, mn DESC
      LIMIT 12
    `;
    const purchaseQuery = `
      SELECT TO_CHAR(created_at, 'Mon YYYY') as month_label,
             EXTRACT(YEAR FROM created_at) as yr,
             EXTRACT(MONTH FROM created_at) as mn,
             SUM(amount) as total
      FROM purchase_order
      GROUP BY month_label, yr, mn
      ORDER BY yr DESC, mn DESC
      LIMIT 12
    `;

    const [salesRes, purchaseRes] = await Promise.all([
      db.query(salesQuery),
      db.query(purchaseQuery)
    ]);

    res.json({
      success: true,
      salesByMonth: salesRes.rows.map(r => ({ month: r.month_label, total: Number(r.total) })),
      purchaseByMonth: purchaseRes.rows.map(r => ({ month: r.month_label, total: Number(r.total) }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};