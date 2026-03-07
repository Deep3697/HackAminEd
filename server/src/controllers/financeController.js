// server/src/controllers/financeController.js
const pool = require('../lib/db');

// 1. ADMIN/EMPLOYEE DATA: Fetch Ledger & Compliance
exports.getAdminFinance = async (req, res) => {
  try {
    const ledgers = await pool.query("SELECT * FROM general_ledger ORDER BY txn_date DESC, id DESC");
    const compliance = await pool.query("SELECT * FROM statutory_compliance ORDER BY deadline ASC");
    
    res.json({ 
      ledgers: ledgers.rows, 
      compliance: compliance.rows 
    });
  } catch (error) {
    console.error("Error fetching Admin Finance:", error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
};

// 2. CONTRACTOR DATA: Fetch Vendor Invoices
exports.getContractorFinance = async (req, res) => {
  try {
    const vendorId = req.user.id; // From verifyToken
    const invoices = await pool.query(
      "SELECT * FROM vendor_invoice WHERE vendor_id = $1 ORDER BY submitted_at DESC", 
      [vendorId]
    );
    res.json({ invoices: invoices.rows });
  } catch (error) {
    console.error("Error fetching Contractor Finance:", error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// 3. CUSTOMER DATA: Fetch Customer Bills
exports.getCustomerFinance = async (req, res) => {
  try {
    const customerId = req.user.id; // From verifyToken
    const bills = await pool.query(
      "SELECT * FROM customer_bill WHERE customer_id = $1 ORDER BY issued_at DESC", 
      [customerId]
    );
    res.json({ bills: bills.rows });
  } catch (error) {
    console.error("Error fetching Customer Finance:", error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

// 4. POST: Create Journal Entry
exports.createJournalEntry = async (req, res) => {
  try {
    const { account, type, amount, mode } = req.body;
    const txnId = `TXN-${Math.floor(Math.random() * 9000) + 1000}`;
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO general_ledger (txn_id, account_head, txn_type, amount, txn_date, payment_mode, logged_by) 
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6)`,
      [txnId, account, type, amount, mode, userId]
    );
    res.status(201).json({ success: true, message: 'Journal entry posted' });
  } catch (error) {
    console.error("Error posting journal:", error);
    res.status(500).json({ error: 'Failed to post journal entry' });
  }
};