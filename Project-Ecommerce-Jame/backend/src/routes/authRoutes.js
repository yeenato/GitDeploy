
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));

module.exports = router;
