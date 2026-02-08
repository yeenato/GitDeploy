const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../../controllers/admin/categoryController');
const { protect } = require('../../middleware/authMiddleware');
const { adminOnly } = require('../../middleware/adminMiddleware');

// All routes require auth + admin
router.use(protect, adminOnly);

router.get('/', asyncHandler(getCategories));
router.post('/', asyncHandler(createCategory));
router.put('/:id', asyncHandler(updateCategory));
router.delete('/:id', asyncHandler(deleteCategory));

module.exports = router;
