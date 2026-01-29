'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, Check, Twitter, Facebook, Linkedin, Layers, Zap, Star, BookOpen, Footprints, Music2, Award, Users, GraduationCap } from 'lucide-react';
import { PhoneFrame, GlassCard } from '@/components/waitlist/FeatureShowcase';

// Gold Dust Particle Canvas
function GoldDustCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            color: string;
        }

        const particles: Particle[] = [];
        const particleCount = 60;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.5 - 0.1,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.3 ? '#D4AF37' : '#39FF14'
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

// Stat Item Component
interface StatItemProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    delay: number;
}

function StatItem({ icon, value, label, delay }: StatItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="relative group"
        >
            <div className="relative p-4 sm:p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-300">
                {/* RPG slot corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]" />

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="text-[#D4AF37] group-hover:text-[#39FF14] transition-colors">
                        {icon}
                    </div>
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FCE205] bg-clip-text text-transparent">
                        {value}
                    </span>
                    <span className="text-sm sm:text-base text-gray-400 uppercase tracking-wider font-medium">
                        {label}
                    </span>
                </div>

                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-xl bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
            </div>
        </motion.div>
    );
}

// Sticky Bottom Bar
function StickyBottomBar({ show, onJoinClick }: { show: boolean; onJoinClick: () => void }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/90 backdrop-blur-lg border-t border-[#D4AF37]/30 lg:hidden"
                >
                    <button
                        onClick={onJoinClick}
                        className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 active:scale-[0.98] transition-transform"
                    >
                        Join Waitlist
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function WaitlistPage() {
    const { waitlistRegister } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [referrerCode, setReferrerCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<{ referral_code: string; position: number } | null>(null);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [copied, setCopied] = useState(false);

    const heroRef = useRef<HTMLElement>(null);

    // Get referrer code from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) setReferrerCode(ref);
    }, []);

    // Show sticky bar after scrolling past hero
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const heroBottom = heroRef.current.getBoundingClientRect().bottom;
                setShowStickyBar(heroBottom < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToHero = useCallback(() => {
        heroRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await waitlistRegister(email, username, referrerCode || undefined);
            // API returns { referral_code, position } directly on success
            if (result.referral_code) {
                setSuccessData({
                    referral_code: result.referral_code,
                    position: result.position || 0
                });
            } else {
                setError('Something went wrong. Please try again.');
            }
        } catch (err: any) {
            // API throws an error with details on failure
            const message = err?.detail || err?.message || 'Something went wrong. Please try again.';
            setError(typeof message === 'string' ? message : JSON.stringify(message));
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (successData?.referral_code) {
            const link = `${window.location.origin}/waitlist?ref=${successData.referral_code}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Success State
    if (successData) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
                <GoldDustCanvas />
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent z-0 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-lg w-full relative z-10 text-center space-y-6 p-6 sm:p-8 rounded-3xl bg-black/50 backdrop-blur-lg border border-[#39FF14]/30 shadow-[0_0_50px_rgba(57,255,20,0.15)]"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex p-4 rounded-full bg-[#39FF14]/10 border border-[#39FF14]"
                    >
                        <Check size={40} className="text-[#39FF14]" />
                    </motion.div>

                    <h1 className="font-serif text-3xl sm:text-4xl text-white">
                        You're In The Guild
                    </h1>
                    <p className="text-lg text-gray-400">
                        Welcome, Founder. Your spot is secured.
                    </p>

                    <div className="bg-black/60 p-5 rounded-xl border border-[#D4AF37]/30 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-[#D4AF37]">Your Referral Link</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black/80 px-3 py-3 rounded-lg text-sm sm:text-base font-mono text-white border border-[#D4AF37]/20 truncate">
                                {typeof window !== 'undefined' ? `${window.location.origin}/waitlist?ref=${successData.referral_code}` : successData.referral_code}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="p-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#FCE205] transition-colors flex-shrink-0"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            3 referrals = <span className="text-[#39FF14]">Beta Tester Badge</span>
                        </p>
                    </div>

                    <div className="bg-[#D4AF37]/10 p-4 rounded-xl border border-[#D4AF37]/20">
                        <p className="text-gray-300 text-sm">
                            <span className="text-[#39FF14] mr-2">➜</span>
                            Check your emails for a free tip on training and a brief history class.
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 text-gray-400 pt-2">
                        <Twitter className="w-6 h-6 hover:text-[#39FF14] cursor-pointer transition-colors" />
                        <Facebook className="w-6 h-6 hover:text-[#39FF14] cursor-pointer transition-colors" />
                        <Linkedin className="w-6 h-6 hover:text-[#39FF14] cursor-pointer transition-colors" />
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white selection:bg-[#39FF14] selection:text-black overflow-x-hidden relative">
            {/* HERO SECTION */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-16 z-10">
                <GoldDustCanvas />

                <div className="relative z-20 w-full max-w-md mx-auto text-center space-y-6">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40"
                    >
                        <span className="text-[#D4AF37] text-sm font-medium uppercase tracking-wider">Founder Access</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight"
                    >
                        Join The<br />
                        <span className="bg-gradient-to-r from-[#D4AF37] to-[#FCE205] bg-clip-text text-transparent">
                            Mambo Guild
                        </span>
                    </motion.h1>

                    {/* Subhead */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg sm:text-xl text-gray-400"
                    >
                        The World's First Gamified Salsa Academy.
                    </motion.p>

                    {/* Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onSubmit={handleSubmit}
                        className="space-y-4 pt-4"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            required
                            className="w-full px-4 py-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] text-base"
                        />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose your username"
                            required
                            className="w-full px-4 py-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] text-base"
                        />

                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {isLoading ? 'Securing Your Spot...' : 'Claim Founder Status'}
                        </button>

                        <p className="text-xs text-gray-500 pt-2">
                            Reserve your unique username. <span className="text-[#D4AF37]">200 spots</span> remaining.
                        </p>
                    </motion.form>
                </div>
            </section>

            {/* THE VAULT - STAT GRID */}
            <section className="relative py-16 sm:py-24 px-4 z-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">The Vault</h2>
                        <p className="text-gray-400">Your arsenal of dance mastery.</p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <StatItem icon={<Layers size={32} />} value="500+" label="Lessons" delay={0} />
                        <StatItem icon={<Zap size={32} />} value="Weekly" label="Drops" delay={0.1} />
                        <StatItem icon={<Music2 size={32} />} value="3 Full" label="Mambo Courses" delay={0.2} />
                        <StatItem icon={<GraduationCap size={32} />} value="Complete" label="First Steps to Pro" delay={0.3} />
                        <StatItem icon={<Users size={32} />} value="Expert" label="Guest Teachers" delay={0.4} />
                        <StatItem icon={<Footprints size={32} />} value="Full" label="Pachanga Course" delay={0.5} />
                        <StatItem icon={<Award size={32} />} value="Full" label="Body Movement" delay={0.6} />
                        <StatItem icon={<Star size={32} />} value="9" label="Choreographies" delay={0.7} />
                        <StatItem icon={<BookOpen size={32} />} value="Deep" label="Science & History" delay={0.8} />
                    </div>
                </div>
            </section>

            {/* THE SKILL TREE */}
            <section className="relative py-16 sm:py-24 px-4 overflow-hidden z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#39FF14]/5 to-transparent pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <PhoneFrame
                        imageSrc="/assets/skill-tree.png"
                        title="The RPG of Dance"
                        description="Visualize your growth from 'Basic Steps' to 'Boss Level'. Every lesson unlocks new nodes on your skill tree. Track your progress like a true gamer."
                        scanAnimation={true}
                    />
                </div>
            </section>

            {/* THE COMMUNITY */}
            <section className="relative py-16 sm:py-24 px-4 overflow-hidden z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <GlassCard
                        imageSrc="/assets/community-ui.png"
                        title="The Stage"
                        description="Compete, collaborate, and get feedback from real pros. Climb the High Rollers leaderboard and earn legendary badges."
                        glowPosition="top-right"
                    />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 font-mono">
                <p>&copy; {new Date().getFullYear()} The Mambo Guild. All Rights Reserved.</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest">Designed in The Lab</p>
            </footer>

            {/* STICKY BOTTOM BAR (Mobile) */}
            <StickyBottomBar show={showStickyBar} onJoinClick={scrollToHero} />

            {/* Bottom padding for sticky bar */}
            <div className="h-20 lg:hidden" />
        </main>
    );
}
