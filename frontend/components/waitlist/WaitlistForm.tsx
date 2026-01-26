import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface WaitlistFormProps {
    onSuccess: (data: { referral_code: string; position: number }) => void;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ onSuccess }) => {
    const { waitlistRegister } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await waitlistRegister(email, username);
            onSuccess(response);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="space-y-4">
                <div className="relative group">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full bg-black/40 border-b-2 border-[#D4AF37]/30 text-white placeholder-gray-500 py-3 px-2 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all font-sans"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#39FF14] transition-all duration-300 group-hover:w-full group-focus-within:w-full" />
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Reserve username (e.g., MamboKing)"
                        required
                        pattern="^[a-zA-Z0-9_]{3,20}$"
                        title="Username must be 3-20 characters, alphanumeric or underscores."
                        className="w-full bg-black/40 border-b-2 border-[#D4AF37]/30 text-white placeholder-gray-500 py-3 px-2 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all font-sans"
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#39FF14] transition-all duration-300 group-hover:w-full group-focus-within:w-full" />
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50"
                >
                    {error}
                </motion.div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold py-4 px-6 rounded-none uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] flex items-center justify-center gap-2 group relative overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" /> Processing...
                        </>
                    ) : (
                        <>
                            Claim My Spot <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </span>
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            </button>

            <p className="text-xs text-center text-gray-500 font-sans mt-2">
                Limited to 200 Maximum. Founder badge secured.
            </p>
        </form>
    );
};

export default WaitlistForm;
