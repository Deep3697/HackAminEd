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

exports.updateJobProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    // 1. Update the job progress
    let newStatus = 'In Progress';
    if (progress === 0) newStatus = 'Queued';
    if (progress >= 100) newStatus = 'Completed';

    await pool.query(
      "UPDATE production_job SET progress = $1, status = $2 WHERE job_id = $3",
      [progress, newStatus, id]
    );

    // 2. Automatically push it to the QC Inspection queue if 100%
    if (progress >= 100) {
      await pool.query(
        "INSERT INTO qc_inspection (job_reference, status) VALUES ($1, 'Pending Inspection') ON CONFLICT (job_reference) DO NOTHING",
        [id]
      );
    }

    res.status(200).json({ success: true, message: 'Job progress updated ' + (progress >= 100 ? 'and added to QC queue' : '') });
  } catch (error) {
    console.error("Error updating job progress:", error);
    res.status(500).json({ error: `Failed to update job progress: ${error.message}` });
  }
};

// --- UPDATE JOB STATUS (Admin dropdown) ---
exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Queued', 'Assembly', 'Testing', 'Molding', 'Pending', 'Completed', 'In Progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // If setting to Completed, auto-set progress to 100
    if (status === 'Completed') {
      await pool.query(
        "UPDATE production_job SET status = 'Completed', progress = 100 WHERE job_id = $1",
        [id]
      );
      // Push to QC queue
      await pool.query(
        "INSERT INTO qc_inspection (job_reference, status) VALUES ($1, 'Pending Inspection') ON CONFLICT (job_reference) DO NOTHING",
        [id]
      );
    } else {
      await pool.query(
        "UPDATE production_job SET status = $1 WHERE job_id = $2",
        [status, id]
      );
    }

    res.status(200).json({ success: true, message: `Job status updated to ${status}` });
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ error: `Failed to update job status: ${error.message}` });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Update the job to 100% and 'Completed'
    await pool.query(
      "UPDATE production_job SET progress = 100, status = 'Completed' WHERE job_id = $1",
      [id]
    );

    // 2. Automatically push it to the QC Inspection queue
    await pool.query(
      "INSERT INTO qc_inspection (job_reference, status) VALUES ($1, 'Pending Inspection') ON CONFLICT (job_reference) DO NOTHING",
      [id]
    );

    res.status(200).json({ success: true, message: 'Job completed and added to QC queue' });
  } catch (error) {
    console.error("Error completing job:", error);
    res.status(500).json({ error: `Failed to complete job: ${error.message}` });
  }
};

exports.addToQc = async (req, res) => {
  try {
    const jobRef = req.body.jobRef || `JOB-${Math.floor(Math.random() * 900) + 210}`;
    await pool.query(
      "INSERT INTO qc_inspection (job_reference, status) VALUES ($1, 'Pending Inspection')",
      [jobRef]
    );
    res.status(201).json({ success: true, message: 'Added to QC Queue' });
  } catch (error) {
    console.error("Error adding to QC:", error);
    res.status(500).json({ error: 'Failed to add to QC queue' });
  }
};