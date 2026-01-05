"use client";

import React from 'react';
import { HoverCard, StaggerContainer, StaggerItem } from './ui/motion';
import { cn } from '@/lib/utils';

interface Badge {
    emoji: string;
    title: string;
    description: string;
}

interface BadgeGridProps {
    badges: Badge[];
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
    return (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {badges.map((badge, index) => (
                <StaggerItem key={index}>
                    <HoverCard>
                        <div className="bg-mambo-panel p-6 rounded-xl text-center border border-transparent hover:border-blue-500/30 transition-all duration-300 shadow-lg shadow-black/20">
                            <div className="text-4xl mb-3">{badge.emoji}</div>
                            <div className="text-sm font-bold text-mambo-text tracking-tight mb-2">{badge.title}</div>
                            <div className="text-xs text-gray-400 leading-relaxed">{badge.description}</div>
                        </div>
                    </HoverCard>
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
};

export default BadgeGrid;