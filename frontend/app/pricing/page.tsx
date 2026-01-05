"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard, Clickable } from "@/components/ui/motion";

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <FadeIn>
        <div className="max-w-7xl mx-auto px-8 py-20 pt-28 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-mambo-text tracking-tight">
            Choose Your Player Mode
          </h1>
          <p className="text-xl text-gray-300 mb-20 max-w-2xl mx-auto leading-relaxed">
            Start with the basics or unlock the full academy. Cancel anytime.
          </p>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Rookie Tier */}
            <StaggerItem>
              <HoverCard>
                <div className="border border-gray-800 hover:border-gray-700 bg-mambo-panel rounded-2xl p-8 flex flex-col h-full shadow-lg shadow-black/20 transition-all duration-300">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Rookie
              </span>
            </div>
            <div className="text-4xl font-bold mb-2 text-mambo-text">Free</div>
            <div className="text-sm text-gray-500 mb-8">Forever. No credit card.</div>

                  <ul className="text-left space-y-4 mb-8 flex-1">
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-gray-500 shrink-0 mt-0.5" />
                      Access World 1 (The Basics)
                    </li>
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-gray-500 shrink-0 mt-0.5" />
                      1 Free Workshop / Month
                    </li>
                    <li className="flex gap-3 text-sm text-gray-500 line-through leading-relaxed">
                      <FaTimes className="shrink-0 mt-0.5" />
                      Advanced Styling
                    </li>
                    <li className="flex gap-3 text-sm text-gray-500 line-through leading-relaxed">
                      <FaTimes className="shrink-0 mt-0.5" />
                      Instructor Feedback
                    </li>
                  </ul>
                  <Clickable>
                    <Link
                      href={user ? "/courses" : "/register"}
                      className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text text-center shadow-md"
                    >
                      {user ? "Current Plan" : "Create Free Account"}
                    </Link>
                  </Clickable>
                </div>
              </HoverCard>
            </StaggerItem>

            {/* Social Dancer Tier - Most Popular */}
            <StaggerItem>
              <HoverCard>
                <div className="relative border-2 border-mambo-blue bg-mambo-panel rounded-2xl p-8 flex flex-col shadow-2xl shadow-blue-900/30 h-full z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-mambo-blue to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>

                  <div className="mb-4 mt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                      Social Dancer
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                    $29<span className="text-lg text-gray-400 font-normal">/mo</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-8">Billed monthly.</div>

                  <ul className="text-left space-y-4 mb-8 flex-1">
                    <li className="flex gap-3 text-sm text-mambo-text font-medium leading-relaxed">
                      <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                      Unlimited Course Access
                    </li>
                    <li className="flex gap-3 text-sm text-mambo-text font-medium leading-relaxed">
                      <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                      New Workshops Weekly
                    </li>
                    <li className="flex gap-3 text-sm text-mambo-text font-medium leading-relaxed">
                      <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                      Advanced Partnerwork
                    </li>
                    <li className="flex gap-3 text-sm text-mambo-text font-medium leading-relaxed">
                      <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                      Community Challenges
                    </li>
                  </ul>
                  <Clickable>
                    <button className="block w-full py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                      Start 7-Day Free Trial
                    </button>
                  </Clickable>
                </div>
              </HoverCard>
            </StaggerItem>

            {/* Performer Tier */}
            <StaggerItem>
              <HoverCard>
                <div className="border border-gray-800 hover:border-gray-700 bg-mambo-panel rounded-2xl p-8 flex flex-col h-full shadow-lg shadow-black/20 transition-all duration-300">
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                      Performer
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                    $49<span className="text-lg text-gray-400 font-normal">/mo</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-8">For serious students.</div>

                  <ul className="text-left space-y-4 mb-8 flex-1">
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                      Everything in Social Dancer
                    </li>
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                      1 Video Review / Month
                    </li>
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                      Direct Chat with Instructors
                    </li>
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                      &quot;Certified&quot; Badge on Profile
                    </li>
                  </ul>
                  <Clickable>
                    <button className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md">
                      Get Performer Access
                    </button>
                  </Clickable>
                </div>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>

          <div className="mt-20 text-gray-400 text-sm leading-relaxed">
            <p>
              Secure payment powered by Stripe. <br />
              Questions? Email support@themamboinn.com
            </p>
          </div>
        </div>
      </FadeIn>

      <Footer />
    </div>
  );
}
