const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // Configure this based on your frontend URL
            methods: ['GET', 'POST'],
        },
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userEmail = decoded.email;

            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId} (${socket.userEmail})`);

        // Join a conversation room
        socket.on('join_room', async ({ conversationId }) => {
            try {
                // Verify user is participant
                const conversation = await prisma.conversation.findFirst({
                    where: {
                        id: parseInt(conversationId),
                        participants: {
                            some: {
                                userId: socket.userId,
                            },
                        },
                    },
                });

                if (!conversation) {
                    socket.emit('error', { message: 'Not authorized to join this conversation' });
                    return;
                }

                socket.join(`conversation_${conversationId}`);
                console.log(`User ${socket.userId} joined room: conversation_${conversationId}`);

                // Notify others in the room that I've read their messages
                socket.to(`conversation_${conversationId}`).emit('messages_read', {
                    conversationId: parseInt(conversationId),
                    readerId: socket.userId
                });
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });

        // Mark messages as read
        socket.on('mark_read', async ({ conversationId }) => {
            try {
                // Update in DB
                await prisma.message.updateMany({
                    where: {
                        conversationId: parseInt(conversationId),
                        senderId: { not: socket.userId },
                        isRead: false
                    },
                    data: { isRead: true }
                });

                // Notify sender
                socket.to(`conversation_${conversationId}`).emit('messages_read', {
                    conversationId: parseInt(conversationId),
                    readerId: socket.userId
                });
            } catch (error) {
                console.error('Error marking read:', error);
            }
        });

        // Send message
        socket.on('send_message', async ({ conversationId, content, image, video, productId }) => {
            try {
                if ((!content || !content.trim()) && !image && !video && !productId) {
                    socket.emit('error', { message: 'Message content, image, video, or product is required' });
                    return;
                }

                // Verify user is participant
                const conversation = await prisma.conversation.findFirst({
                    where: {
                        id: parseInt(conversationId),
                        participants: {
                            some: {
                                userId: socket.userId,
                            },
                        },
                    },
                });

                if (!conversation) {
                    socket.emit('error', { message: 'Not authorized to send message to this conversation' });
                    return;
                }

                // Create message
                const message = await prisma.message.create({
                    data: {
                        conversationId: parseInt(conversationId),
                        senderId: socket.userId,
                        content: content || '',
                        image: image || null,
                        video: video || null,
                        productId: productId ? parseInt(productId) : null,
                        isRead: false,
                    },
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
                });

                // Update conversation timestamp
                await prisma.conversation.update({
                    where: { id: parseInt(conversationId) },
                    data: { updatedAt: new Date() },
                });

                // Broadcast message to room
                io.to(`conversation_${conversationId}`).emit('receive_message', message);

                console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', async ({ conversationId, userName }) => {
            try {
                // Broadcast to others in the room
                socket.to(`conversation_${conversationId}`).emit('user_typing', {
                    userId: socket.userId,
                    userName: userName,
                });
            } catch (error) {
                console.error('Error broadcasting typing:', error);
            }
        });

        // Stopped typing
        socket.on('stopped_typing', async ({ conversationId }) => {
            try {
                // Broadcast to others in the room
                socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
                    userId: socket.userId,
                });
            } catch (error) {
                console.error('Error broadcasting stopped typing:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

module.exports = { initializeSocket };
