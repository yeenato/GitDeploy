import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    isLoading = false
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
                        {isDestructive && (
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant={isDestructive ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : confirmText}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
