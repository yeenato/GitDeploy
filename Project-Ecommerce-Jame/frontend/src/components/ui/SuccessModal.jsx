import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X } from 'lucide-react';
import { Button } from './Button';

export function SuccessModal({
    isOpen,
    onClose,
    title,
    message,
    buttonText = 'OK'
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-end">
                    <Button 
                        variant="primary"
                        onClick={onClose}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
