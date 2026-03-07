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