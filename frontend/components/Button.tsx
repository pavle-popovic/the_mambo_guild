"use client";

import React from 'react';
import { Clickable } from './ui/motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
    variant: 'primary' | 'secondary' | 'outline';
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    variant,
    children,
    onClick,
    className
}) => {
    const baseClasses = "px-8 py-4 font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden";
    let variantClasses = "";

    switch (variant) {
        case 'primary':
            variantClasses = "bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30";
            break;
        case 'secondary':
        case 'outline':
            variantClasses = "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/20";
            break;
        default:
            variantClasses = "bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30";
    }

    const combinedClasses = cn(baseClasses, variantClasses, className);

    return (
        <Clickable>
            <button
                className={combinedClasses}
                onClick={onClick}
            >
                <span className="relative z-10">{children}</span>
            </button>
        </Clickable>
    );
};

export default Button;