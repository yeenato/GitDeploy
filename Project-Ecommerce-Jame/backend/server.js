const dotenv = require('dotenv');
// Load env vars before anything else
dotenv.config();

const http = require('http');
const app = require('./src/app');
const { initializeSocket } = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible to our router
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io server ready`);
});
