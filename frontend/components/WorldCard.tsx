"use client";

import React from 'react';
import { HoverCard } from './ui/motion';
import { cn } from '@/lib/utils';

interface WorldResponse {
    id: string;
    name: string;
    tag: string;
    imageSrc: string;
    description: string;
    progressPercentage: number;
    buttonText: string;
    buttonActionLink?: string;
}

interface WorldCardProps {
    world: WorldResponse;
}

const WorldCard: React.FC<WorldCardProps> = ({ world }) => {
    return (
        <HoverCard className="h-full">
            <div className="bg-mambo-panel border border-transparent hover:border-blue-500/30 rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer h-full flex flex-col shadow-lg shadow-black/20">
                <div className="h-48 relative overflow-hidden">
                    <img 
                        src={world.imageSrc} 
                        alt={world.name} 
                        className="w-full h-full object-cover aspect-video group-hover:scale-105 transition duration-500 rounded-t-xl" 
                    />
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">{world.tag}</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg tracking-tight group-hover:text-mambo-blue transition text-mambo-text">{world.name}</h3>
                        <i className="fa-solid fa-play-circle text-mambo-blue text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-300 mb-6 line-clamp-2 leading-relaxed flex-1">{world.description}</p>
                    
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 mb-4">
                        <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500" style={{ width: `${world.progressPercentage}%` }}></div>
                        </div>
                        <span className="text-white font-bold">{world.progressPercentage}%</span>
                    </div>
                    <button className="w-full py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 rounded-lg text-sm font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/10">
                        {world.buttonText}
                    </button>
                </div>
            </div>
        </HoverCard>
    );
};

export default WorldCard;