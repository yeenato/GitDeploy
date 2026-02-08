
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/me', protect, asyncHandler(getMe));
router.put('/me', protect, upload.single('profileImage'), asyncHandler(updateMe));

module.exports = router;
