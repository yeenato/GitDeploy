const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getCategories } = require('../controllers/admin/categoryController');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', asyncHandler(getCategories));

module.exports = router;
