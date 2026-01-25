import React from 'react';

interface ActivityItem {
    id: string;
    initials: string;
    initialsBgColor: string; // e.g., "bg-purple-500"
    userName: string;
    action: string;
    timeAgo: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
    return (
        <div className="bg-mambo-panel border border-white/10 rounded-xl p-4 space-y-4">
            {activities.map(activity => (
                <div key={activity.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${activity.initialsBgColor} flex items-center justify-center text-xs font-bold`}>
                        {activity.initials}
                    </div>
                    <div>
                        <div className="text-sm"><span className="font-bold">{activity.userName}</span> {activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.timeAgo}</div>
                    </div>
                </div>
            ))}

            <div className="border-t border-gray-800 pt-4 text-center">
                <a href="#" className="text-sm text-mambo-blue font-bold hover:underline">View Community</a>
            </div>
        </div>
    );
};

export default ActivityFeed;