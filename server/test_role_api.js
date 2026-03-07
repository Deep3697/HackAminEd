require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAdminToken = () => {
  return jwt.sign(
    { id: 1, email: 'admin@hackamined.com', role: 'admin' },
    process.env.JWT_SECRET || 'hackamined_secret_key_2023_secure',
    { expiresIn: '1h' }
  );
};

const testUpdateRole = async () => {
  try {
    const token = generateAdminToken();
    console.log('Token Generated. Calling PUT /api/admin/users/1/role...');

    const response = await fetch('http://localhost:5001/api/admin/users/1/role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        role: 'employee',
        employeeType: 'HR & Payroll'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log('=== API RESPONSE ===');
    console.log(data);
  } catch (error) {
    console.error('Fetch Error:', error.message);
  }
};

testUpdateRole();
