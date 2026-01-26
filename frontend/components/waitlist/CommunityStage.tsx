import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const MOCK_VIDEOS = [
    { id: 1, title: "Pachanga Basics", duration: "12:04", views: "1.2k" },
    { id: 2, title: "Advanced Partnerwork", duration: "18:30", views: "854" },
    { id: 3, title: "Musicality Drill", duration: "05:15", views: "3.4k" },
    { id: 4, title: "Spin Technique", duration: "09:22", views: "2.1k" },
    { id: 5, title: "Shines & Footwork", duration: "14:10", views: "900" },
    { id: 6, title: "Body Isolation", duration: "08:45", views: "1.5k" },
];

const CommunityStage: React.FC = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-black-void to-[#0a0a0a] border-t border-white/5">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">The Sage</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-16">
                    Connect with dancers worldwide. Share your progress, get feedback from pros, and climb the leaderboards.
                </p>

                {/* Marquee effect for video cards */}
                <div className="relative w-full overflow-hidden mask-linear-fade">
                    <div className="flex gap-6 animate-scroll-left w-max hover:pause-animation">
                        {[...MOCK_VIDEOS, ...MOCK_VIDEOS].map((video, idx) => (
                            <div
                                key={idx}
                                className="w-[280px] h-[360px] bg-white/5 rounded-xl overflow-hidden border border-white/10 group cursor-pointer relative shrink-0"
                            >
                                {/* Thumbnail Placeholder */}
                                <div className="h-[60%] w-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors relative flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play size={20} className="ml-1 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 text-left">
                                    <h4 className="text-white font-bold truncate">{video.title}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded text-[10px]">PRO</span>
                                        <span>{video.duration}</span>
                                        <span>•</span>
                                        <span>{video.views} views</span>
                                    </div>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 border-2 border-[#D4AF37] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-20">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-transparent border border-[#39FF14] text-[#39FF14] font-bold rounded hover:bg-[#39FF14]/10 transition-colors uppercase tracking-widest text-sm"
                    >
                        Explore The Community
                    </motion.button>
                </div>
            </div>

            <style jsx>{`
        .mask-linear-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
};

export default CommunityStage;
