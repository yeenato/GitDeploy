const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const {
    createProduct,
    getMyProducts,
    updateProduct,
    updateProductStatus,
    deleteProduct,
} = require('../controllers/productController');
const { getProducts, getProduct } = require('../controllers/publicProductController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes  
router.get('/', asyncHandler(getProducts)); // Public search

// Protected routes (must come before /:id to avoid conflicts)
router.get('/my-items', protect, asyncHandler(getMyProducts));
router.post('/', protect, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'video', maxCount: 1 }]), asyncHandler(createProduct));
router.put('/:id', protect, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'video', maxCount: 1 }]), asyncHandler(updateProduct));
router.patch('/:id/status', protect, asyncHandler(updateProductStatus));
router.delete('/:id', protect, asyncHandler(deleteProduct));

// Public product details (must be last to avoid matching /my-items as :id)
router.get('/:id', asyncHandler(getProduct));

module.exports = router;
