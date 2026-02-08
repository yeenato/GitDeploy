import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChatAvatar } from '../components/ui/ChatAvatar';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { EmojiPicker } from '../components/chat/EmojiPicker';
import { Send, MessageCircle, ArrowDown, Search, Image as ImageIcon, X, MapPin, Package, Shield } from 'lucide-react';
import { BACKEND_ORIGIN } from '../config';

export default function Chat() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const { t, language } = useLanguage();
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [previewUrl, setPreviewUrl] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const [myProducts, setMyProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const productMessageSentRef = useRef(false);

    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };

    // Initialize Socket.io connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(BACKEND_ORIGIN, {
            auth: { token },
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('receive_message', (message) => {
            if (message.senderId !== user.id) {
                playNotificationSound();
            }

            if (activeConversation && message.conversationId === activeConversation.id) {
                setMessages((prev) => [...prev, message]);
                // Auto-scroll if near bottom
                if (messagesContainerRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                    if (scrollHeight - scrollTop - clientHeight < 100) {
                        setTimeout(scrollToBottom, 100);
                    }
                }
                
                // Mark as read immediately if viewing this conversation
                newSocket.emit('mark_read', { conversationId: activeConversation.id });
            }
            // Refresh conversation list to show new message preview
            fetchConversations();
        });

        // Listen for read receipts
        newSocket.on('messages_read', ({ conversationId, readerId }) => {
            if (activeConversation && activeConversation.id === conversationId) {
                setMessages(prev => prev.map(msg => {
                    // Mark my messages as read
                    if (msg.senderId === user.id) {
                        return { ...msg, isRead: true };
                    }
                    return msg;
                }));
            }
        });

        newSocket.on('user_typing', ({ userId, userName }) => {
            if (userId !== user.id) {
                setTypingUsers(prev => new Set(prev).add(userName));
            }
        });

        newSocket.on('user_stopped_typing', ({ userId }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                // Remove by finding the user
                conversations.forEach(conv => {
                    const otherUser = conv.participants.find(p => p.userId === userId)?.user;
                    if (otherUser) {
                        newSet.delete(otherUser.name);
                    }
                });
                return newSet;
            });
        });

        newSocket.on('message_deleted', ({ messageId, deleteType, userId: deletedUserId, conversationId }) => {
            setMessages(prev => {
                if (deleteType === 'everyone') {
                    return prev.map(msg => msg.id === messageId ? { ...msg, isDeleted: true } : msg);
                } else if (deleteType === 'me') {
                    if (deletedUserId === user.id) {
                        return prev.filter(msg => msg.id !== messageId);
                    }
                }
                return prev;
            });
            fetchConversations();
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user.id]); // Removed conversations dependency

    // Join room when active conversation changes or socket connects
    useEffect(() => {
        if (socket && activeConversation) {
            socket.emit('join_room', { conversationId: activeConversation.id });
            // Also mark as read when joining/selecting
            socket.emit('mark_read', { conversationId: activeConversation.id });
        }
    }, [socket, activeConversation?.id]);

    // Handle product from navigation state
    useEffect(() => {
        if (activeConversation && socket && location.state?.product) {
            const product = location.state.product;
            
            // Check if we already sent this product message to prevent duplicates
            if (productMessageSentRef.current === product.id) {
                return;
            }

            productMessageSentRef.current = product.id;
            
            // Send message with product
            socket.emit('send_message', {
                conversationId: activeConversation.id,
                content: `สนใจสินค้า ${product.title}`,
                productId: product.id
            });

            // Clear state to prevent sending again
            navigate(location.pathname, { replace: true, state: {} });
            
            // Reset ref after a delay
            setTimeout(() => {
                productMessageSentRef.current = false;
            }, 1000);
        }
    }, [activeConversation, socket, location.state, navigate, location.pathname]);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    // Load conversation from URL
    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            loadConversation(parseInt(conversationId));
        }
    }, [conversationId, conversations]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle scroll to show/hide scroll button
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/chat/conversations');
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
            setLoading(false);
        }
    };

    const loadConversation = async (convId) => {
        try {
            const conversation = conversations.find(c => c.id === convId);
            if (conversation) {
                setActiveConversation(conversation);
                // Focus input
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                // Conversation not found, redirect to chat home
                navigate('/chat');
                return;
            }

            const { data } = await api.get(`/chat/${convId}/messages`);
            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                setMessages([]);
                console.error('Invalid messages format:', data);
            }
            
            // Mark as read on load (API handles DB update, Socket notifies sender)
            if (socket) {
                socket.emit('mark_read', { conversationId: convId });
            }

            // Scroll to bottom after loading
            setTimeout(() => scrollToBottom(false), 100);
        } catch (error) {
            console.error('Failed to load conversation', error);
        }
    };

    const handleTyping = () => {
        if (!socket || !activeConversation) return;

        socket.emit('typing', {
            conversationId: activeConversation.id,
            userName: user.name,
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopped_typing', { conversationId: activeConversation.id });
        }, 3000);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');

            if (!isVideo && !isImage) {
                alert('Please select an image or video file');
                return;
            }

            const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for image
            if (file.size > maxSize) {
                alert(`File size too large (max ${isVideo ? '50MB' : '5MB'})`);
                return;
            }

            setSelectedFile(file);
            setFileType(isVideo ? 'video' : 'image');
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileType(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendLocation = () => {
        if (!navigator.geolocation) {
            alert(t('chat.geolocationNotSupported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                
                if (socket && activeConversation) {
                    socket.emit('send_message', {
                        conversationId: activeConversation.id,
                        content: mapLink,
                    });
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert(t('chat.locationError'));
            }
        );
    };

    const handleRequestDelete = (message) => {
        setMessageToDelete(message);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (type) => {
        if (!messageToDelete) return;
        try {
            await api.delete(`/chat/messages/${messageToDelete.id}`, {
                data: { deleteType: type }
            });
            setDeleteModalOpen(false);
            setMessageToDelete(null);
        } catch (error) {
            console.error('Failed to delete message', error);
            alert('Failed to delete message');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeConversation) return;

        let imageUrl = null;
        let videoUrl = null;

        if (selectedFile) {
            const formData = new FormData();
            if (fileType === 'video') {
                formData.append('video', selectedFile);
                try {
                    const res = await api.post('/chat/upload-video', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    videoUrl = res.data.url;
                } catch (error) {
                    console.error('Error uploading video:', error);
                    alert('Failed to upload video. Please try again.');
                    return;
                }
            } else {
                formData.append('image', selectedFile);
                try {
                    const res = await api.post('/chat/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    imageUrl = res.data.url;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image. Please try again.');
                    return;
                }
            }
        }

        socket.emit('send_message', {
            conversationId: activeConversation.id,
            content: newMessage,
            image: imageUrl,
            video: videoUrl
        });

        setNewMessage('');
        handleRemoveFile();
        setEmojiPickerOpen(false);
        
        // Stop typing indicator immediately
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            socket.emit('stopped_typing', { conversationId: activeConversation.id });
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        handleTyping();
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p.userId !== user.id)?.user;
    };

    const fetchMyProducts = async () => {
        if (myProducts.length > 0) return;
        setLoadingProducts(true);
        try {
            const { data } = await api.get('/products/my-items');
            setMyProducts(data);
        } catch (error) {
            console.error('Failed to fetch my products', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleTradeSelect = (product) => {
        if (!socket || !activeConversation) return;
        
        const tradeMessage = language === 'th' 
            ? `ฉันสนใจแลกกับสินค้าชิ้นนี้: ${product.title}`
            : `I offer this item for trade: ${product.title}`;

        socket.emit('send_message', {
            conversationId: activeConversation.id,
            content: tradeMessage,
            productId: product.id
        });

        setTradeModalOpen(false);
        
        // Stop typing if active
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            socket.emit('stopped_typing', { conversationId: activeConversation.id });
        }
    };

    const handleQuickReply = (text) => {
        if (text === 'สนใจแลกสินค้าไหม' || text === 'Interested in trading?') {
            fetchMyProducts();
            setTradeModalOpen(true);
            return;
        }

        if (!socket || !activeConversation) return;
        socket.emit('send_message', {
            conversationId: activeConversation.id,
            content: text,
        });
        // Stop typing if active
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            socket.emit('stopped_typing', { conversationId: activeConversation.id });
        }
    };

    const quickReplies = language === 'th' ? [
        'สินค้ายังอยู่ไหม?',
        'ลดราคาได้อีกไหม?',
        'สนใจ',
        'สะดวกนัดรับที่ไหน?',
        'สนใจแลกสินค้าไหม'
    ] : [
        'Is this still available?',
        'Can you reduce the price?',
        'I am interested.',
        'Where can we meet?',
        'Interested in trading?'
    ];

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const otherUser = getOtherParticipant(conv);
        return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherUser?.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getAvatarSrc = (u) => {
        if (!u?.profileImage) return undefined;
        if (u.profileImage.startsWith('http') || u.profileImage.startsWith('blob:')) return u.profileImage;
        
        const origin = BACKEND_ORIGIN.endsWith('/') ? BACKEND_ORIGIN.slice(0, -1) : BACKEND_ORIGIN;
        const path = u.profileImage.startsWith('/') ? u.profileImage : `/${u.profileImage}`;
        return `${origin}${path}`;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-16rem)]">
            <div className="mb-6">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('chat.title')}</h1>
                <p className="text-gray-600">{t('chat.subtitle')}</p>
            </div>

            <div className="flex gap-6 h-full">
                {/* Conversations Sidebar */}
                <div className="w-80 flex-shrink-0">
                    <Card className="h-full flex flex-col">
                        <h3 className="text-lg font-bold mb-3 pb-3 border-b border-gray-200">
                            {t('chat.conversations')}
                        </h3>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('chat.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {filteredConversations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                    <p>{searchQuery ? t('chat.noMatching') : t('chat.noConversations')}</p>
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => {
                                    const otherUser = getOtherParticipant(conversation);
                                    const isActive = activeConversation?.id === conversation.id;

                                    return (
                                        <button
                                            key={conversation.id}
                                            onClick={() => {
                                                loadConversation(conversation.id);
                                                navigate(`/chat/${conversation.id}`);
                                            }}
                                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${isActive
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <ChatAvatar
                                                name={otherUser?.name}
                                                src={getAvatarSrc(otherUser)}
                                                size="md"
                                                isOnline={false}
                                                showOnlineStatus={false}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <div className="font-semibold truncate">{otherUser?.name}</div>
                                                    {otherUser?.role === 'ADMIN' && (
                                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-0.5 rounded-full flex-shrink-0" title="Admin">
                                                            <Shield className="w-2.5 h-2.5" />
                                                        </div>
                                                    )}
                                                </div>
                                                {(() => {
                                                    const preview = conversation.messages[0];
                                                    if (!preview) return null;
                                                    const deletedForMe = preview.deletedBy && preview.deletedBy.split(',').includes(user.id.toString());
                                                    const text = preview.isDeleted
                                                        ? (language === 'th' ? 'ข้อความถูกยกเลิก' : 'Message unsent')
                                                        : deletedForMe
                                                            ? ''
                                                            : preview.content;
                                                    return text ? (
                                                        <div className={`text-sm truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                                                            {text}
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col">
                    {activeConversation ? (
                        <Card className="flex-1 flex flex-col h-full">
                            {/* Chat Header */}
                            <div className="pb-4 border-b border-gray-200 mb-4 flex items-center gap-3">
                                <ChatAvatar
                                    name={getOtherParticipant(activeConversation)?.name}
                                    src={getAvatarSrc(getOtherParticipant(activeConversation))}
                                    size="lg"
                                    isOnline={false}
                                    showOnlineStatus={false}
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold">
                                            {getOtherParticipant(activeConversation)?.name}
                                        </h3>
                                        {getOtherParticipant(activeConversation)?.role === 'ADMIN' && (
                                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1 rounded-full" title="Admin">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {getOtherParticipant(activeConversation)?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto mb-4 custom-scrollbar relative"
                            >
                                <div className="space-y-1">
                                    {messages.map((message, index) => {
                                        const isMyMessage = message.senderId === user.id;
                                        return (
                                            <MessageBubble
                                                key={message.id || index}
                                                {...message}
                                                timestamp={message.createdAt}
                                                isOwn={isMyMessage}
                                                status={message.isRead ? 'read' : 'sent'}
                                                showAvatar={!isMyMessage}
                                                senderName={getOtherParticipant(activeConversation)?.name}
                                                senderAvatar={getAvatarSrc(message.sender)}
                                                senderRole={message.sender?.role}
                                                onDelete={() => handleRequestDelete(message)}
                                            />
                                        );
                                    })}

                                    {/* Typing Indicator */}
                                    {Array.from(typingUsers).map(userName => (
                                        <TypingIndicator key={userName} userName={userName} />
                                    ))}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Delete Confirmation Modal */}
                                {deleteModalOpen && createPortal(
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                                        <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                                            <h3 className="text-lg font-semibold mb-4 text-center">
                                                {language === 'th' ? 'ลบข้อความ' : 'Delete Message'}
                                            </h3>
                                            <div className="space-y-3">
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleConfirmDelete('me')}
                                                >
                                                    {language === 'th' ? 'ลบสำหรับฉัน' : 'Delete for me'}
                                                </Button>
                                                {messageToDelete?.senderId === user.id && (
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        onClick={() => handleConfirmDelete('everyone')}
                                                    >
                                                        {language === 'th' ? 'ยกเลิกข้อความ (ทุกคน)' : 'Unsend (Everyone)'}
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    className="w-full mt-2"
                                                    onClick={() => {
                                                        setDeleteModalOpen(false);
                                                        setMessageToDelete(null);
                                                    }}
                                                >
                                                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}

                                {/* Scroll to Bottom Button */}
                                {showScrollButton && (
                                    <button
                                        onClick={() => scrollToBottom()}
                                        className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-all z-10"
                                        title="Scroll to bottom"
                                    >
                                        <ArrowDown className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {/* Image Preview */}
                            {previewUrl && (
                                <div className="px-4 pb-2 flex">
                                    <div className="relative">
                                        {fileType === 'video' ? (
                                            <video 
                                                src={previewUrl} 
                                                className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                                                controls={false}
                                                autoPlay
                                                muted
                                                loop
                                            />
                                        ) : (
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 custom-scrollbar px-1">
                                {quickReplies.map((text, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickReply(text)}
                                        className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded-full text-sm transition-colors border border-gray-200"
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*"
                                    className="hidden"
                                />
                                
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Send image or video"
                                    >
                                        <ImageIcon className="w-6 h-6" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendLocation}
                                        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title={t('chat.sendLocation')}
                                    >
                                        <MapPin className="w-6 h-6" />
                                    </button>
                                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                                </div>

                                <textarea
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t('chat.typeMessage')}
                                    rows={1}
                                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32"
                                    style={{ minHeight: '48px' }}
                                />

                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() && !selectedFile}
                                    className="h-12"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </Card>
                    ) : (
                        <Card className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-xl font-semibold">{t('chat.selectChat')}</p>
                                <p className="text-sm mt-2">{t('chat.startNewConv')}</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            {tradeModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {language === 'th' ? 'เลือกสินค้าที่จะแลกเปลี่ยน' : 'Select Item to Trade'}
                            </h3>
                            <button 
                                onClick={() => setTradeModalOpen(false)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loadingProducts ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : myProducts.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>{language === 'th' ? 'คุณยังไม่มีสินค้า' : 'You have no items'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {myProducts.map(product => {
                                        let imgSrc = null;
                                        try {
                                            const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                                            if (Array.isArray(imgs) && imgs.length > 0) imgSrc = imgs[0];
                                            else if (typeof imgs === 'string') imgSrc = imgs;
                                        } catch (e) {
                                            imgSrc = typeof product.images === 'string' ? product.images.split(',')[0] : null;
                                        }

                                        const finalSrc = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `${BACKEND_ORIGIN}${imgSrc.startsWith('/') ? imgSrc : '/' + imgSrc}`) : null;

                                        return (
                                            <div 
                                                key={product.id} 
                                                onClick={() => handleTradeSelect(product)}
                                                className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group bg-white"
                                            >
                                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                    {finalSrc ? (
                                                        <img 
                                                            src={finalSrc} 
                                                            alt={product.title} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                                <div className="p-2">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</h4>
                                                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                        {language === 'th' ? 'เลือก' : 'Select'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
