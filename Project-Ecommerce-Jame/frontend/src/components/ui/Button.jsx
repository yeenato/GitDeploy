import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', ...props }) {
    const variants = {
        primary: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 hover:-translate-y-0.5',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg',
        danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/50',
        outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-sm hover:shadow-md',
    };

    return (
        <button
            className={twMerge(
                'px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
