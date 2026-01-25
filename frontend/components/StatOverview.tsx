import React from 'react';

interface Stat {
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
}

interface StatOverviewProps {
    stats: Stat[];
}

const StatOverview: React.FC<StatOverviewProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
                let changeClasses = '';
                let changeIcon = '';

                if (stat.changeType === 'positive') {
                    changeClasses = 'text-green-500';
                    changeIcon = 'fa-solid fa-arrow-up';
                } else if (stat.changeType === 'negative') {
                    changeClasses = 'text-red-500';
                    changeIcon = 'fa-solid fa-arrow-down';
                } else {
                    changeClasses = 'text-gray-500'; // Neutral or no change
                    // No specific icon for neutral, or could use fa-solid fa-minus
                }

                return (
                    <div key={index} className="bg-mambo-panel border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-2">{stat.label}</div>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        {stat.change && (
                            <div className={`${changeClasses} text-xs mt-1`}>
                                {changeIcon && <i className={`${changeIcon} mr-1`}></i>}
                                {stat.change}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatOverview;