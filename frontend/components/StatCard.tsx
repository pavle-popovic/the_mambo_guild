"use client";

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { UISound } from '@/hooks/useUISound';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
    const handleMouseEnter = useCallback(() => {
        UISound.hover();
    }, []);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            className="bg-black/80 border border-white/10 px-6 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 shadow-lg shadow-black/20 cursor-pointer group hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10"
        >
            <i className={cn(icon, "text-mambo-gold text-xl")}></i>
            <div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{label}</div>
                <div className="font-bold text-lg text-mambo-text tracking-tight">{value}</div>
            </div>
        </div>
    );
};

export default StatCard;