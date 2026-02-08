const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const {
    getAllProducts,
    getPendingProducts,
    approveProduct,
    rejectProduct,
} = require('../../controllers/admin/productController');
const { protect } = require('../../middleware/authMiddleware');
const { adminOnly } = require('../../middleware/adminMiddleware');

// All routes require auth + admin
router.use(protect, adminOnly);

router.get('/', asyncHandler(getAllProducts));
router.get('/pending', asyncHandler(getPendingProducts));
router.patch('/:id/approve', asyncHandler(approveProduct));
router.patch('/:id/reject', asyncHandler(rejectProduct));

module.exports = router;
