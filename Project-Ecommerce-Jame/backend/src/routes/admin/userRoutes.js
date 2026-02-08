const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const {
    getUsers,
    updateUserRole,
    deleteUser,
} = require('../../controllers/admin/userController');
const { protect } = require('../../middleware/authMiddleware');
const { adminOnly } = require('../../middleware/adminMiddleware');

// All routes require auth + admin
router.use(protect, adminOnly);

router.get('/', asyncHandler(getUsers));
router.patch('/:id/role', asyncHandler(updateUserRole));
router.delete('/:id', asyncHandler(deleteUser));

module.exports = router;
