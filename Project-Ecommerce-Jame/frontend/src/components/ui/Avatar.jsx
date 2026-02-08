import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

// Generate a consistent color based on string
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export function Avatar({
    name,
    src,
    size = 'md',
    isOnline = false,
    className,
    showOnlineStatus = true
}) {
    const [failed, setFailed] = useState(false);
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-24 h-24 text-2xl',
        '3xl': 'w-32 h-32 text-3xl'
    };

    const onlineBadgeSizes = {
        sm: 'w-2 h-2 border',
        md: 'w-2.5 h-2.5 border-2',
        lg: 'w-3 h-3 border-2',
        xl: 'w-4 h-4 border-2',
        '2xl': 'w-5 h-5 border-2',
        '3xl': 'w-6 h-6 border-2'
    };

    const gradientColor = stringToColor(name || 'User');
    const initials = getInitials(name);

    return (
        <div className="relative inline-block">
            <div
                className={twMerge(
                    'flex items-center justify-center rounded-full font-bold text-white shadow-lg overflow-hidden',
                    sizes[size],
                    className
                )}
                style={{
                    background: `linear-gradient(135deg, ${gradientColor}, ${gradientColor}dd)`
                }}
            >
                {src && !failed ? (
                    <img 
                        src={src} 
                        alt={name} 
                        className="w-full h-full object-cover"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <span className="leading-none">{initials}</span>
                )}
            </div>
            {showOnlineStatus && isOnline && (
                <span
                    className={twMerge(
                        'absolute bottom-0 right-0 block rounded-full bg-green-500 border-white',
                        onlineBadgeSizes[size]
                    )}
                />
            )}
        </div>
    );
}
