"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LessonResponse {
    id: string;
    title: string;
    duration: string; // e.g., "10 min"
    xp: string;       // e.g., "50 XP"
}

interface LessonItemProps {
    lesson: LessonResponse;
    isActive: boolean;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, isActive }) => {
    return (
        <motion.div
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "p-4 rounded-lg cursor-pointer flex gap-3 items-center transition-all duration-300",
                isActive
                    ? 'bg-blue-900/20 border border-blue-500/30 shadow-md shadow-blue-500/10'
                    : 'hover:bg-gray-800/50 border border-transparent hover:border-gray-700'
            )}
        >
            <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300",
                isActive ? 'bg-gradient-to-br from-mambo-blue to-blue-600' : 'bg-gray-700'
            )}>
                <i className="fa-solid fa-play"></i>
            </div>
            <div className="flex-1">
                <div className={cn(
                    "text-sm font-bold tracking-tight",
                    isActive ? 'text-blue-200' : 'text-gray-300'
                )}>
                    {lesson.title}
                </div>
                <div className={cn(
                    "text-xs mt-0.5",
                    isActive ? 'text-blue-400' : 'text-gray-500'
                )}>
                    {lesson.duration} • {lesson.xp}
                </div>
            </div>
        </motion.div>
    );
};

export default LessonItem;