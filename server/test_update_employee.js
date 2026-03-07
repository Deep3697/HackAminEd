require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const testUpdate = async () => {
    try {
        console.log("Connecting database...");

        // Test parameters similar to what frontend passes
        const employeeType = 'Sales & Purchase';
        const id = 1; // Assuming person_id 1 is Amit Admin

        // The problematic line 119
        console.log("Running Line 119 Query...");
        const res = await pool.query('UPDATE employee SET employee_type = $1 WHERE person_id = $2 RETURNING *', [employeeType, id]);

        console.log("Success! ResultSet:", res.rows);

    } catch (error) {
        console.error("SQL Error CAUGHT:", error);
    } finally {
        pool.end();
    }
};

testUpdate();
