"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-mambo-panel border border-gray-800 hover:border-mambo-blue/30 px-6 py-4 rounded-lg flex items-center gap-4 transition-all duration-300 shadow-lg shadow-black/20"
        >
            <i className={cn(icon, "text-mambo-gold text-xl")}></i>
            <div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{label}</div>
                <div className="font-bold text-lg text-mambo-text tracking-tight">{value}</div>
            </div>
        </motion.div>
    );
};

export default StatCard;