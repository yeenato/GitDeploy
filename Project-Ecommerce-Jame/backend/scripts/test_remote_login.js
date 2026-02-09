const axios = require('axios');

async function testLogin(baseUrl) {
    const email = 'beelzebub132@gmail.com';
    const password = 'password123';

    console.log(`Testing login against: ${baseUrl}`);
    try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
            email,
            password
        });
        console.log(`✅ Success! Token: ${response.data.token.substring(0, 10)}...`);
        return true;
    } catch (error) {
        if (error.response) {
            console.log(`❌ Failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`❌ Network/Other Error: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    console.log('--- Testing Remote Login ---');
    
    // URL 1: The original one found in config
    await testLogin('https://denchai-marketplace-dz9y.onrender.com');
    
    // URL 2: The one I guessed based on frontend URL
    await testLogin('https://jame-shop-backend.onrender.com');

    // URL 3: Localhost (just in case)
    await testLogin('http://localhost:3000');
}

main();
