"use client";

import React from 'react';
import { HoverCard, Clickable } from './ui/motion';
import { cn } from '@/lib/utils';

interface PricingCardProps {
    tier: string;
    price: string; // e.g., "29"
    features: string[];
    isPopular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
    tier,
    price,
    features,
    isPopular = false,
}) => {
    return (
        <HoverCard className={cn("h-full", isPopular && "z-10")}>
            <div className={cn(
                "relative border-2 bg-mambo-panel rounded-2xl p-8 flex flex-col shadow-2xl h-full",
                isPopular 
                    ? "border-mambo-blue shadow-blue-900/30" 
                    : "border-gray-800 hover:border-gray-700 shadow-blue-900/10"
            )}>
                {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-mambo-blue to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Most Popular
                    </div>
                )}
                
                <div className="mb-4 mt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{tier}</span>
                </div>
                <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                    ${price}
                    <span className="text-lg text-gray-400 font-normal">/mo</span>
                </div>
                <div className="text-sm text-gray-400 mb-8">Billed monthly.</div>
                
                <ul className="text-left space-y-4 mb-8 flex-1">
                    {features.map((feature, index) => (
                        <li key={index} className="flex gap-3 text-sm text-gray-300 font-medium leading-relaxed">
                            <i className="fa-solid fa-check text-mambo-blue mt-0.5 shrink-0"></i> 
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <Clickable>
                    <button className="block w-full py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                        Start 7-Day Free Trial
                    </button>
                </Clickable>
            </div>
        </HoverCard>
    );
};

export default PricingCard;