import { twMerge } from 'tailwind-merge';

export function Card({ className, children, hover = false, ...props }) {
    return (
        <div
            className={twMerge(
                'bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300',
                hover && 'hover:shadow-2xl hover:-translate-y-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
