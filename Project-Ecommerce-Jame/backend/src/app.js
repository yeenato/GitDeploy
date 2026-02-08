const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// Admin Routes
app.use('/api/admin/categories', require('./routes/admin/categoryRoutes'));
app.use('/api/admin/products', require('./routes/admin/productRoutes'));
app.use('/api/admin/users', require('./routes/admin/userRoutes'));

// Error Handler
app.use(errorHandler);

module.exports = app;
