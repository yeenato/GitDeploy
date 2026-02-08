import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function EmojiPicker({ onEmojiSelect }) {
    const { t } = useLanguage();
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        }

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiSelect = (emoji) => {
        onEmojiSelect(emoji.native);
        setShowPicker(false);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title={t('chat.addEmoji')}
            >
                <Smile className="w-6 h-6" />
            </button>

            {showPicker && (
                <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-lg overflow-hidden">
                    <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="search"
                    />
                </div>
            )}
        </div>
    );
}
