const fs = require('fs');

async function testSimulationError() {
    try {
        // Attempting login first as admin to get token
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'amit.admin@telos.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log('Login status:', loginRes.status);

        if (!loginData.token) {
            console.log('Failed to get token:', loginData);
            return;
        }
        const token = loginData.token;

        // Now trigger the explode API
        const res = await fetch('http://localhost:5001/api/simulation/explode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetItemId: 1, targetQuantity: 10 })
        });

        console.log('HTTP Status:', res.status);
        const data = await res.json();
        console.log('Response Body:', data);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testSimulationError();
