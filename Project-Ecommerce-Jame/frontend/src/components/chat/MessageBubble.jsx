import { Check, CheckCheck, Trash2, Package, MapPin, Shield } from 'lucide-react';
import { ChatAvatar } from '../ui/ChatAvatar';
import { format, isToday, isYesterday } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { BACKEND_ORIGIN } from '../../config';
import './MessageBubble.css';

function formatMessageTime(date, language) {
    const messageDate = new Date(date);
    const locale = language === 'th' ? th : enUS;

    if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm', { locale });
    } else if (isYesterday(messageDate)) {
        const yesterdayText = language === 'th' ? 'เมื่อวาน' : 'Yesterday';
        return `${yesterdayText} ${format(messageDate, 'HH:mm', { locale })}`;
    } else {
        const formatStr = language === 'th' ? 'd MMM, HH:mm' : 'MMM d, HH:mm';
        return format(messageDate, formatStr, { locale });
    }
}

export function MessageBubble({
    content,
    image,
    video,
    product,
    isOwn,
    timestamp,
    status = 'sent', // sent, delivered, read
    showAvatar = false,
    senderName,
    senderAvatar,
    senderRole,
    isDeleted,
    onDelete
}) {
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const BASE_URL = BACKEND_ORIGIN;

    const isLocationMessage = content && (content.includes('maps.google.com') || content.includes('google.com/maps'));

    if (isDeleted) {
        return (
            <div className={`message-bubble-container ${isOwn ? 'own-message' : 'other-message'}`}>
                <div className={`message-bubble italic text-gray-500 border border-gray-200 bg-gray-50`}>
                    {language === 'th' ? 'ข้อความถูกยกเลิก' : 'Message unsent'}
                </div>
            </div>
        );
    }

    return (
        <div className={`message-bubble-container group items-center gap-2 ${isOwn ? 'own-message' : 'other-message'}`}>
            {!isOwn && showAvatar && (
                <div className="self-end mb-1 shrink-0">
                    <ChatAvatar 
                        name={senderName} 
                        src={senderAvatar} 
                        size="sm" 
                        showOnlineStatus={false}
                    />
                </div>
            )}
            {isOwn && onDelete && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
                    title={language === 'th' ? 'ลบข้อความ' : 'Delete message'}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            <div
                className={`message-bubble ${isOwn
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
            >
                {!isOwn && senderName && (
                    <div className="text-xs font-semibold mb-1 text-indigo-600 flex items-center gap-1">
                        {senderName}
                        {senderRole === 'ADMIN' && (
                            <Shield className="w-3 h-3 text-purple-600" />
                        )}
                    </div>
                )}
                
                {product && (
                    <div className={`mb-3 overflow-hidden rounded-xl w-64 ${
                        isOwn ? 'bg-white/10' : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                        {/* Image */}
                        {(() => {
                            let imgPath = '';
                            try {
                                let parsed = product.images;
                                if (typeof parsed === 'string') {
                                    if (parsed.startsWith('[') || parsed.startsWith('{')) {
                                        try {
                                            parsed = JSON.parse(parsed);
                                        } catch (e) {
                                            // If parse fails, treat as simple string
                                        }
                                    }
                                }
                                
                                if (Array.isArray(parsed)) {
                                    imgPath = parsed.length > 0 ? parsed[0] : '';
                                } else {
                                    imgPath = parsed;
                                }
                            } catch (e) {
                                imgPath = typeof product.images === 'string' ? product.images.split(',')[0] : '';
                            }

                            if (!imgPath) {
                                return (
                                    <div className="h-24 w-full bg-gray-100 flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                );
                            }

                            // Ensure slash and origin
                            const finalSrc = (() => {
                                if (imgPath.startsWith('http')) return imgPath;
                                const origin = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                                const path = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
                                return `${origin}${path}`;
                            })();

                            return (
                                <div className="h-32 w-full overflow-hidden bg-gray-100">
                                    <img 
                                        src={finalSrc}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22v-9"></path></svg></div>'; // Fallback to Package icon
                                        }}
                                    />
                                </div>
                            );
                        })()}
                        
                        {/* Content */}
                        <div className="p-3">
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <h4 className={`font-bold line-clamp-1 text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                                    {product.title}
                                </h4>
                                {product.category && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                                        isOwn ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                                    }`}>
                                        {product.category.name}
                                    </span>
                                )}
                            </div>
                            
                            {product.description && (
                                <p className={`text-xs line-clamp-2 mb-2 ${isOwn ? 'text-white/80' : 'text-gray-600'}`}>
                                    {product.description}
                                </p>
                            )}
                            
                            <div className={`text-xs mb-3 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                <span className="font-semibold">{t('home.owner') || 'Owner'}:</span> {product.owner?.name || 'Unknown'}
                            </div>
                            
                            <button
                                onClick={() => navigate(`/products/${product.id}`)}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                                    isOwn 
                                        ? 'bg-white text-indigo-600 hover:bg-gray-50' 
                                        : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                }`}
                            >
                                {t('home.viewDetails') || 'View Details'}
                            </button>
                        </div>
                    </div>
                )}

                {video && typeof video === 'string' && (
                    <div className="mb-2">
                        <video 
                            src={video.startsWith('http') ? video : `${BASE_URL}${video}`} 
                            className="max-w-full rounded-lg max-h-60 object-cover"
                            controls
                        />
                    </div>
                )}

                {image && (
                    <div className="mb-2">
                        <img 
                            src={image.startsWith('http') ? image : `${BASE_URL}${image}`} 
                            alt="Shared" 
                            className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(image.startsWith('http') ? image : `${BASE_URL}${image}`, '_blank')}
                        />
                    </div>
                )}

                {isLocationMessage ? (
                    <a 
                        href={content} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                            isOwn 
                                ? 'bg-white/20 hover:bg-white/30 text-white' 
                                : 'bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-100'
                        }`}
                        title={t('chat.viewOnMap')}
                    >
                        <div className={`p-2 rounded-full ${isOwn ? 'bg-white/20' : 'bg-indigo-100'}`}>
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{t('chat.location')}</span>
                            <span className="text-xs opacity-80">{t('chat.viewOnMap')}</span>
                        </div>
                    </a>
                ) : (
                    content && <div className="break-words whitespace-pre-wrap">{content}</div>
                )}
                
                <div className={`message-time ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                    {formatMessageTime(timestamp, language)}
                    {isOwn && (
                        <span className="ml-1 inline-flex items-center gap-1 text-[10px]">
                            {status === 'read' ? (
                                <>
                                    <span>{language === 'th' ? 'อ่านแล้ว' : 'Read'}</span>
                                    <CheckCheck className="w-3 h-3 text-blue-300" />
                                </>
                            ) : (
                                <>
                                    <span>{language === 'th' ? 'ส่งแล้ว' : 'Sent'}</span>
                                    <Check className="w-3 h-3 text-white/70" />
                                </>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {!isOwn && onDelete && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
                    title={language === 'th' ? 'ลบข้อความ' : 'Delete message'}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
