const pool = require('./src/lib/db');

async function run() {
    try {
        await pool.query(
            "UPDATE production_job SET progress = 100, status = 'Completed' WHERE job_id = $1",
            ['JOB-202']
        );

        await pool.query(
            "INSERT INTO qc_inspection (job_reference, status) VALUES ($1, 'Pending Inspection') ON CONFLICT (job_reference) DO NOTHING",
            ['JOB-202']
        );
        console.log("SUCCESS");
    } catch (e) {
        console.error("DB ERROR: ", e.message);
        if (e.detail) console.error("DETAIL: ", e.detail);
        if (e.hint) console.error("HINT: ", e.hint);
    } finally {
        await pool.end();
    }
}
run();
