'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WaitlistHero from '@/components/waitlist/WaitlistHero';
import Showcase from '@/components/waitlist/Showcase';
import { Copy, Check, Twitter, Facebook, Linkedin } from 'lucide-react';

export default function WaitlistPage() {
    const [successData, setSuccessData] = useState<{ referral_code: string; position: number } | null>(null);

    const handleSuccess = (data: { referral_code: string; position: number }) => {
        setSuccessData(data);
    };

    const copyToClipboard = () => {
        if (successData?.referral_code) {
            const link = `${window.location.origin}/waitlist?ref=${successData.referral_code}`;
            navigator.clipboard.writeText(link);
        }
    };

    if (successData) {
        return (
            <main className="min-h-screen bg-black-void text-white flex items-center justify-center p-4 relative overflow-hidden">
                {/* Success Background */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-black z-0 pointer-events-none" />

                <div className="max-w-xl w-full relative z-10 text-center space-y-8 p-8 rounded-3xl glass-panel border border-[#39FF14]/30 shadow-[0_0_50px_rgba(57,255,20,0.1)]">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 rounded-full bg-[#39FF14]/10 border border-[#39FF14] mb-4"
                    >
                        <Check size={48} className="text-[#39FF14]" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-serif text-white">
                        You're In The Guild
                    </h1>
                    <p className="text-xl text-gray-400">
                        Welcome, Founder. Your spot is reserved.
                    </p>

                    {/* Referral Section */}
                    <div className="bg-black/50 p-6 rounded-xl border border-white/10 space-y-4">
                        <p className="text-sm uppercase tracking-widest text-[#D4AF37]">Your Access Code</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black/80 p-4 rounded-lg text-2xl font-mono text-white tracking-widest border border-[#D4AF37]/30">
                                {typeof window !== 'undefined' ? `${window.location.origin}/waitlist?ref=${successData.referral_code}` : successData.referral_code}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="p-4 bg-[#D4AF37] text-black rounded-lg hover:bg-[#FCE205] transition-colors"
                            >
                                <Copy size={24} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Share this link. 3 referrals = <span className="text-[#39FF14]">Beta Tester Badge</span>.
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 text-gray-400">
                        <Twitter className="hover:text-[#39FF14] cursor-pointer transition-colors" />
                        <Facebook className="hover:text-[#39FF14] cursor-pointer transition-colors" />
                        <Linkedin className="hover:text-[#39FF14] cursor-pointer transition-colors" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-black-void min-h-screen text-white selection:bg-[#39FF14] selection:text-black">
            <WaitlistHero onSuccess={handleSuccess} />
            <Showcase />

            {/* Footer */}
            <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 font-mono">
                <p>&copy; {new Date().getFullYear()} The Mambo Guild. All Rights Reserved.</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest">Designed in The Lab</p>
            </footer>
        </main>
    );
}
