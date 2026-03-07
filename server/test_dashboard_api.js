require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAdminToken = () => {
  return jwt.sign(
    { id: 1, email: 'admin@hackamined.com', role: 'admin' },
    process.env.JWT_SECRET || 'hackamined_secret_key_2023_secure',
    { expiresIn: '1h' }
  );
};

const testDashboardAPI = async () => {
  try {
    const token = generateAdminToken();
    console.log('Token Generated. Calling /api/admin/dashboard...');

    const response = await fetch('http://localhost:5001/api/admin/dashboard', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log('=== API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error.message);
  }
};

testDashboardAPI();
