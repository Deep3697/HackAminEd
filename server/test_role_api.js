require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAdminToken = () => {
  return jwt.sign(
    { id: 1, email: 'admin@hackamined.com', role: 'admin' },
    process.env.JWT_SECRET || 'hackamined_secret_key_2023_secure',
    { expiresIn: '1h' }
  );
};

const testUpdateJob = async () => {
  try {
    const token = generateAdminToken();
    console.log('Calling PUT /api/production/jobs/JOB-202/complete...');

    const axios = require('axios');
    const response = await axios.put('http://localhost:5001/api/production/jobs/JOB-202/complete', {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log('STATUS:', response.status);
    console.log('BODY:', response.data);
  } catch (error) {
    console.error('Fetch Error:', error.response ? error.response.data : error.message);
  }
};

testUpdateJob();
