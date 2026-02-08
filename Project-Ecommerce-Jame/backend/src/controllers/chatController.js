const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Start or get existing conversation
// @route   POST /api/chat/start
// @access  Private
const startConversation = async (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (!targetUserId) {
        res.status(400);
        throw new Error('Target user ID is required');
    }

    if (parseInt(targetUserId) === currentUserId) {
        res.status(400);
        throw new Error('Cannot start conversation with yourself');
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
        where: {
            participants: {
                every: {
                    userId: {
                        in: [currentUserId, parseInt(targetUserId)],
                    },
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            role: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    });

    if (existingConversation && existingConversation.participants.length === 2) {
        return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
        data: {
            participants: {
                create: [
                    { userId: currentUserId },
                    { userId: parseInt(targetUserId) },
                ],
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            role: true,
                        },
                    },
                },
            },
            messages: true,
        },
    });

    res.status(201).json(conversation);
};

// @desc    Get all conversations for logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId,
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            role: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
        orderBy: { updatedAt: 'desc' },
    });

    const filtered = conversations.map(conv => {
        const visible = (conv.messages || []).filter(msg => {
            if (msg.isDeleted) return false;
            if (!msg.deletedBy) return true;
            const arr = msg.deletedBy.split(',').filter(Boolean);
            return !arr.includes(userId.toString());
        });
        return {
            ...conv,
            messages: visible.length > 0 ? [visible[0]] : [],
        };
    });

    res.json(filtered);
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: parseInt(conversationId),
            participants: {
                some: {
                    userId,
                },
            },
        },
    });

    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found or access denied');
    }

    // Mark unread messages as read
    await prisma.message.updateMany({
        where: {
            conversationId: parseInt(conversationId),
            senderId: { not: userId },
            isRead: false
        },
        data: {
            isRead: true
        }
    });

    const messages = await prisma.message.findMany({
        where: { conversationId: parseInt(conversationId) },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                    role: true,
                },
            },
            product: {
                select: {
                    id: true,
                    title: true,
                    images: true,
                    status: true,
                    ownerId: true,
                    description: true,
                    owner: {
                        select: {
                            name: true
                        }
                    },
                    category: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'asc' },
    });

    // Filter out messages deleted by this user
    const visibleMessages = messages.filter(msg => {
        if (!msg.deletedBy) return true;
        const deletedByArray = msg.deletedBy.split(',');
        return !deletedByArray.includes(userId.toString());
    });

    res.json(visibleMessages);
};

// @desc    Upload chat image
// @route   POST /api/chat/upload
// @access  Private
const uploadChatImage = async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
        url: fileUrl,
    });
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
    const { id } = req.params;
    const { deleteType } = req.body; // 'me' or 'everyone'
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
        where: { id: parseInt(id) },
    });

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    if (deleteType === 'everyone') {
        if (message.senderId !== userId) {
            res.status(401);
            throw new Error('Not authorized to delete this message for everyone');
        }

        const updatedMessage = await prisma.message.update({
            where: { id: parseInt(id) },
            data: { isDeleted: true },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        status: true,
                        ownerId: true,
                    }
                }
            }
        });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation_${message.conversationId}`).emit('message_deleted', {
                messageId: parseInt(id),
                deleteType: 'everyone',
                conversationId: message.conversationId
            });
        }

        res.json(updatedMessage);
    } else if (deleteType === 'me') {
        let deletedBy = message.deletedBy || "";
        const deletedByArray = deletedBy.split(',').filter(id => id);

        if (!deletedByArray.includes(userId.toString())) {
            deletedByArray.push(userId);
            deletedBy = deletedByArray.join(',');

            const updatedMessage = await prisma.message.update({
                where: { id: parseInt(id) },
                data: { deletedBy },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            status: true,
                            ownerId: true,
                        }
                    }
                }
            });

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(`conversation_${message.conversationId}`).emit('message_deleted', {
                    messageId: parseInt(id),
                    deleteType: 'me',
                    userId: userId,
                    conversationId: message.conversationId
                });
            }

            res.json(updatedMessage);
        } else {
            res.json(message);
        }
    } else {
        res.status(400);
        throw new Error('Invalid delete type');
    }
};

module.exports = {
    startConversation,
    getConversations,
    getMessages,
    uploadChatImage,
    deleteMessage,
};
