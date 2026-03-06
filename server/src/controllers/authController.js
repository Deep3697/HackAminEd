const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../lib/db'); // Your direct pg database connection

// ==========================================
// 1. REGISTER LOGIC
// ==========================================
exports.register = async (req, res) => {
  try {
    const { fullName, contactNo, whatsappNumber, email, address, password } = req.body;

    // Check if the email is already taken
    const userCheck = await db.query('SELECT * FROM person WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Scramble the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Neon Database with the default 'user' role
    const insertQuery = `
      INSERT INTO person ("fullName", "contactNo", "whatsappNumber", email, address, password, role)
      VALUES ($1, $2, $3, $4, $5, $6, 'user') RETURNING id, "fullName", email, role
    `;
    const newUser = await db.query(insertQuery, [fullName, contactNo, whatsappNumber, email, address, hashedPassword]);

    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to the User Dashboard.",
      user: newUser.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. LOGIN LOGIC
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Fetch the user AND their specific employee department (if they have one)
    const query = `
      SELECT p.*, e.employee_type 
      FROM person p 
      LEFT JOIN employee e ON p.id = e.person_id 
      WHERE p.email = $1
    `;
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const person = result.rows[0];

    // 2. Verify the password
    const isMatch = await bcrypt.compare(password, person.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Create the security token
    const token = jwt.sign(
      { id: person.id, role: person.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );

    // 4. Send the data back to the frontend (including the new employeeType!)
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: person.id,
        fullName: person.fullName, 
        email: person.email, 
        role: person.role,
        employeeType: person.employee_type || '-' // <--- This dictates their specific dashboard view
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};