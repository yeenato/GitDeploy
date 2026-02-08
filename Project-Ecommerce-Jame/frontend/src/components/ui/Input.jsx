import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({ className, label, error, ...props }) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={twMerge(
                    'w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300',
                    error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
        </div>
    );
}
