// server/src/controllers/productionController.js
const pool = require('../lib/db');

exports.getDashboardData = async (req, res) => {
  try {
    const jobs = await pool.query("SELECT * FROM production_job ORDER BY created_at DESC");

    // Wrapped QC in a try/catch just in case the qc_record table is empty or missing
    let qcPending = { rows: [] };
    let qcHistory = { rows: [] };
    try {
      qcPending = await pool.query("SELECT * FROM qc_inspection WHERE status = 'Pending Inspection' ORDER BY id DESC");
      qcHistory = await pool.query("SELECT * FROM qc_inspection WHERE status != 'Pending Inspection' ORDER BY logged_at DESC");
    } catch (qcErr) {
      console.warn("QC Table check skipped or missing, proceeding with jobs only.");
    }

    res.json({ activeJobs: jobs.rows, qcQueue: qcPending.rows, qcHistory: qcHistory.rows });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.createJob = async (req, res) => {
  try {
    // FIX: Accept either 'product_name' or 'product' so it never fails
    const productName = req.body.product_name || req.body.product;
    const qty = req.body.qty;

    const jobId = `JOB-${Math.floor(Math.random() * 900) + 210}`;
    await pool.query(
      "INSERT INTO production_job (job_id, product_name, qty, progress, status) VALUES ($1, $2, $3, 0, 'Queued')",
      [jobId, productName, qty]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

exports.logDowntime = async (req, res) => {
  try {
    const { machine, reason } = req.body;
    await pool.query(
      "INSERT INTO machine_downtime (machine_name, reason, logged_by) VALUES ($1, $2, $3)",
      [machine, reason, req.user?.id || null]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error logging downtime:", error);
    res.status(500).json({ error: 'Failed to log downtime' });
  }
};

exports.updateQc = async (req, res) => {
  try {
    const { id, status, notes } = req.body;
    await pool.query(
      "UPDATE qc_inspection SET status = $1, notes = $2, logged_at = CURRENT_TIMESTAMP WHERE id = $3",
      [status, notes, id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating QC:", error);
    res.status(500).json({ error: 'Failed to update QC' });
  }
};