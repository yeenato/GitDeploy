
// const fetch = require('node-fetch'); // Native fetch in Node 18+

async function debugAdminApi() {
    try {
        // 1. Login as admin
        const loginUrl = 'http://localhost:3000/api/auth/login';
        const loginBody = {
            email: 'beelzebubrock2@gmail.com', // Admin user
            password: 'admin123'
        };

        console.log('Logging in...');
        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginBody)
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch admin users
        const url = 'http://localhost:3000/api/admin/users';
        console.log(`Fetching users from ${url}...`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('API Error:', response.status, await response.text());
        } else {
            const data = await response.json();
            console.log('API Success!');
            console.log('Data type:', typeof data);
            console.log('Is Array?', Array.isArray(data));
            console.log('Data length:', data.length);
            console.log('First user sample:', JSON.stringify(data[0], null, 2));
        }

    } catch (error) {
        console.error('Debug script error:', error);
    }
}

debugAdminApi();
