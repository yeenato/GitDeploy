import { useLanguage } from '../../context/LanguageContext';
import './TypingIndicator.css';

export function TypingIndicator({ userName = 'Someone' }) {
    const { t } = useLanguage();
    
    return (
        <div className="flex items-start gap-2 mb-4">
            <div className="typing-bubble bg-gray-100 rounded-2xl px-4 py-3 shadow-md">
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600 mr-2">{userName} {t('chat.isTyping')}</span>
                    <div className="typing-dot"></div>
                    <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}
