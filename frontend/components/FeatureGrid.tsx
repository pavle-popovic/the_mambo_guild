import React from 'react';

interface FeatureGridProps { }

const FeatureGrid: React.FC<FeatureGridProps> = () => {
    return (
        <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">

                <div data-aos="fade-right" className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-30 blur-xl"></div>
                    <img src="https://images.unsplash.com/photo-1545959798-ac97e937d99f?auto=format&fit=crop&w=800&q=80" className="relative rounded-2xl shadow-2xl border border-white/10" alt="Person dancing salsa" />
                    <div data-aos="zoom-in" data-aos-delay="300" className="absolute -bottom-6 -right-6 bg-gray-900 p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-bold"><i className="fa-solid fa-check"></i></div>
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Streak</div>
                            <div className="text-sm font-bold">14 Days Active</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 data-aos="fade-up" className="text-4xl font-bold mb-6">Don't just watch.<br /><span className="text-mambo-blue">Play the game.</span></h2>
                    <p data-aos="fade-up" data-aos-delay="100" className="text-gray-400 text-lg mb-8 leading-relaxed">
                        Most online courses leave you lonely. At The Salsa Lab, every step is a level. Every combo is a boss battle. Track your XP, earn badges, and get verified feedback from our instructors.
                    </p>

                    <div className="space-y-6">
                        <div data-aos="fade-up" data-aos-delay="200" className="flex gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-mambo-blue shrink-0">
                                <i className="fa-solid fa-layer-group"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Structured Worlds</h3>
                                <p className="text-gray-500 text-sm">No random videos. A clear path from Beginner to Pro.</p>
                            </div>
                        </div>

                        <div data-aos="fade-up" data-aos-delay="300" className="flex gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-mambo-gold shrink-0">
                                <i className="fa-solid fa-trophy"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Earn Your Rank</h3>
                                <p className="text-gray-500 text-sm">Unlock advanced styling only when you master the basics.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;