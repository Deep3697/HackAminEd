// server/src/controllers/simulationController.js
const pool = require('../lib/db'); // FIXED: Changed from config/db to lib/db

exports.calculateExplosion = async (req, res) => {
  try {
    const { targetItemId, targetQuantity } = req.body;
    const userId = req.user.id; // Comes from the verifyToken middleware
    console.log(`🚀 Running Simulation for Item ID: ${targetItemId}, Qty: ${targetQuantity} by User: ${userId}`);

    // Grab the recipe and current stock in one go
    const bomQuery = `
      SELECT 
        bm.raw_material_id, 
        i.name AS material_name, 
        i.unit, 
        i.current_stock, 
        bm.quantity_required, 
        bm.man_hours_per_unit
      FROM boms b
      JOIN bom_materials bm ON b.id = bm.bom_id
      JOIN items i ON bm.raw_material_id = i.id
      WHERE b.finished_good_id = $1;
    `;
    
    const result = await pool.query(bomQuery, [targetItemId]);
    const materials = result.rows;

    if (materials.length === 0) {
      console.log("⚠️ No BOM found for this item.");
      return res.status(404).json({ message: "No Bill of Materials found for this item." });
    }

    let totalManHours = 0;
    let totalProcurementGap = 0;
    const explosionResults = [];

    materials.forEach(material => {
      // Convert to Numbers to prevent string math errors
      const currentStock = Number(material.current_stock);
      const qtyPerUnit = Number(material.quantity_required);
      const hoursPerUnit = Number(material.man_hours_per_unit);

      const totalRequired = qtyPerUnit * targetQuantity;
      const shortfall = currentStock - totalRequired;
      const actualShortfall = shortfall < 0 ? Math.abs(shortfall) : 0;
      
      totalManHours += (hoursPerUnit * targetQuantity);

      // Calculate cost gap (mocking $45/unit to match the frontend UI)
      if (actualShortfall > 0) {
        totalProcurementGap += (actualShortfall * 45); 
      }

      explosionResults.push({
        materialId: material.raw_material_id,
        materialName: material.material_name,
        unit: material.unit,
        requiredQty: totalRequired,
        currentStock: currentStock,
        shortfall: actualShortfall, 
        status: shortfall < 0 ? 'Shortfall' : 'In Stock'
      });
    });

    // Save the simulation run to the History Table
    await pool.query(
      `INSERT INTO simulation_history (user_id, target_item_id, target_qty, procurement_gap) 
       VALUES ($1, $2, $3, $4)`,
      [userId, targetItemId, targetQuantity, totalProcurementGap]
    );

    console.log("✅ Simulation complete and logged. Sending results...");
    res.status(200).json({
      targetQuantity,
      totalManHours,
      materialsNeeded: explosionResults
    });

  } catch (error) {
    console.error("❌ SQL ERROR:", error.message);
    res.status(500).json({ message: "Server error during simulation.", error: error.message });
  }
};

// NEW FUNCTION: Fetch the history for the Admin Audit Modal
exports.getSimulationHistory = async (req, res) => {
  try {
    const query = `
      SELECT sh.*, i.name as item_name, p."fullName" as user_name
      FROM simulation_history sh
      JOIN items i ON sh.target_item_id = i.id
      LEFT JOIN person p ON sh.user_id = p.id
      ORDER BY sh.simulated_at DESC
      LIMIT 30
    `;
    const result = await pool.query(query);
    res.json({ history: result.rows });
  } catch (error) {
    console.error("Error fetching simulation history:", error.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};