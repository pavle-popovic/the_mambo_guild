import React from 'react';
import { motion } from 'framer-motion';
import WaitlistForm from './WaitlistForm';
import { Sparkles } from 'lucide-react';

interface WaitlistHeroProps {
    onSuccess: (data: { referral_code: string; position: number }) => void;
}

const WaitlistHero: React.FC<WaitlistHeroProps> = ({ onSuccess }) => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#39FF14]/5 rounded-full blur-[80px] animate-pulse-slow" />
            </div>

            <div className="relative z-10 max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">

                {/* Left Column: Text */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 text-center md:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs uppercase tracking-widest">
                        <Sparkles size={12} />
                        <span>Limited Access • Early Alpha</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                            The Mambo
                        </span>
                        <span className="block text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                            Guild
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 font-light max-w-md mx-auto md:mx-0">
                        Join the elite circle of founders shaping the future of salsa education.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
                            24 Spots Remaining
                        </span>
                        <span>•</span>
                        <span>Priority Access</span>
                    </div>
                </motion.div>

                {/* Right Column: Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative group"
                >
                    {/* Border Gradient Animation */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-[#D4AF37] to-[#39FF14] opacity-20 group-hover:opacity-50 transition-opacity rounded-2xl -z-10 blur-sm" />

                    <div className="mb-6">
                        <h3 className="text-2xl font-serif text-white mb-1">Reserve Your Handle</h3>
                        <p className="text-gray-400 text-sm">Secure your unique identity before public launch.</p>
                    </div>

                    <WaitlistForm onSuccess={onSuccess} />
                </motion.div>
            </div>
        </section>
    );
};

export default WaitlistHero;
