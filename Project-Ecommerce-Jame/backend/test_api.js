const fs = require('fs');
const path = require('path');

async function testCreate() {
    try {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const filePath = path.join(__dirname, 'test.png');
        const fileContent = fs.readFileSync(filePath);
        
        // Construct body manually because native FormData in Node is tricky with fetch sometimes
        // or just use 'form-data' package if available.
        // Let's try native fetch with FormData (Node 18+).
        
        const formData = new FormData();
        formData.append('title', 'API Test Product');
        formData.append('description', 'Created via fetch script');
        
        // Append file
        const blob = new Blob([fileContent], { type: 'image/png' });
        formData.append('coverImage', blob, 'test.png');
        formData.append('images', blob, 'test_extra.png');
        
        console.log('Sending request...');
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            body: formData
        });
        
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testCreate();
