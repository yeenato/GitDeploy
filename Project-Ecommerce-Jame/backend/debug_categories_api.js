
// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

async function testApi() {
    try {
        console.log('Testing GET http://localhost:3000/api/categories...');
        const response = await fetch('http://localhost:3000/api/categories');
        
        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Categories received:', data.length);
            console.log(JSON.stringify(data.slice(0, 3), null, 2));
        } else {
            console.log('Response text:', await response.text());
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

testApi();
