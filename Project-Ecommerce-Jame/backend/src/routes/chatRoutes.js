const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const {
    startConversation,
    getConversations,
    getMessages,
    uploadChatImage,
    deleteMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All chat routes require authentication
router.use(protect);

router.post('/start', asyncHandler(startConversation));
router.get('/conversations', asyncHandler(getConversations));
router.get('/:conversationId/messages', asyncHandler(getMessages));
router.post('/upload', upload.single('image'), asyncHandler(uploadChatImage));
router.post('/upload-video', upload.single('video'), asyncHandler(uploadChatImage));
router.delete('/messages/:id', asyncHandler(deleteMessage));

module.exports = router;
