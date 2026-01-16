"use client";

import { motion } from "framer-motion";
import { FaUsers, FaVideo, FaComments, FaMedal, FaLock } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import AuthPromptModal from "@/components/AuthPromptModal";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function CommunityTeaser() {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const benefits = [
        {
            icon: <FaVideo className="text-2xl text-blue-400" />,
            title: "Share Your Progress",
            description: "Post videos of your practice, get feedback from instructors, and track your improvement over time."
        },
        {
            icon: <FaComments className="text-2xl text-green-400" />,
            title: "Get Expert Feedback",
            description: "Receive detailed critiques and tips from professional instructors and advanced peers."
        },
        {
            icon: <FaUsers className="text-2xl text-purple-400" />,
            title: "Connect with Dancers",
            description: "Join a vibrant community of salsa enthusiasts. Support others and get supported on your journey."
        },
        {
            icon: <FaMedal className="text-2xl text-amber-400" />,
            title: "Earn Rewards",
            description: "Earn Claves and badges for your contributions. Level up your profile as you help others."
        }
    ];

    const handleJoinClick = () => {
        setIsAuthModalOpen(true);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto py-12 px-4">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-6 ring-1 ring-white/10">
                        <FaUsers className="text-3xl text-white/80" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Join the Mambo Inn <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Community</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
                        The heart of our salsa school. Connect, share, and grow with dancers from around the world.
                    </p>

                    <motion.button
                        onClick={handleJoinClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white shadow-lg shadow-purple-500/30 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            <FaLock className="text-sm" />
                            {user ? "Upgrade to Join" : "Join the Community"}
                        </span>
                    </motion.button>
                </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    >
                        <GlassCard className="h-full p-6 hover:bg-white/10 transition-colors border-white/5">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                type={user ? "subscribe" : "login"}
                courseTitle="Community Access"
            />
        </div>
    );
}
