"use client";

import { useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FadeIn, Clickable } from "@/components/ui/motion";

export default function HomePage() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize AOS if available
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.init({
        once: true,
        offset: 100,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-mambo-dark relative">
      <NavBar user={user || undefined} />

      {/* Full-screen background video */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover object-center"
          style={{ objectPosition: 'center 20%' }}
        >
          <source src="/assets/Background_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero content - centered on top of video */}
      <header className="relative min-h-screen flex items-center justify-center z-10 pt-20">
        <FadeIn className="text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-xs font-bold tracking-widest mb-8 text-white mt-16">
            ONLINE SALSA ACADEMY
          </div>
          
          {/* Main headline - stacked */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8 text-white">
            Turn the<br />
            Dancefloor<br />
            Into Your<br />
            Playground.
          </h1>
          
          {/* Sub-text */}
          <p className="text-lg sm:text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Structured courses. Real feedback.<br />
            Stop memorizing steps—start mastering the game.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Clickable>
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/75 flex items-center justify-center gap-2 min-w-[160px]"
              >
                Register
              </Link>
            </Clickable>
            <Clickable>
              <Link
                href="#about"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-full font-bold transition-all duration-300 text-white min-w-[160px]"
              >
                How It Works
              </Link>
            </Clickable>
          </div>
        </FadeIn>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-gray-400">
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </header>

      <FadeIn delay={0.2}>
        <section id="about" className="relative py-40 px-6 max-w-7xl mx-auto z-10 bg-mambo-dark">
          <div className="max-w-4xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-mambo-text tracking-tight">
                Don&apos;t just watch.<br />
                <span className="text-mambo-blue">Play the game.</span>
              </h2>
              <p className="text-gray-300 text-lg mb-12 leading-relaxed">
                Most online courses leave you lonely. At The Mambo Inn, every step is a level.
                Every combo is a boss battle. Track your XP, earn badges, and get verified
                feedback from our instructors.
              </p>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-mambo-blue shrink-0 shadow-lg">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-mambo-text mb-2 tracking-tight">Structured Worlds</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      No random videos. A clear path from Beginner to Pro.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-mambo-gold shrink-0 shadow-lg">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-mambo-text mb-2 tracking-tight">Earn Your Rank</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Unlock advanced styling only when you master the basics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <Footer className="relative z-10" />
    </div>
  );
}
