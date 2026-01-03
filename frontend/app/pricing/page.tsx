"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <div className="max-w-7xl mx-auto px-8 py-20 pt-28 text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-mambo-text">
          Choose Your Player Mode
        </h1>
        <p className="text-xl text-gray-400 mb-20 max-w-2xl mx-auto">
          Start with the basics or unlock the full academy. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Rookie Tier */}
          <div className="border border-gray-800 bg-gray-900/30 rounded-2xl p-8 flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Rookie
              </span>
            </div>
            <div className="text-4xl font-bold mb-2 text-mambo-text">Free</div>
            <div className="text-sm text-gray-500 mb-8">Forever. No credit card.</div>

            <ul className="text-left space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-gray-300">
                <FaCheck className="text-gray-500 shrink-0 mt-0.5" />
                Access World 1 (The Basics)
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <FaCheck className="text-gray-500 shrink-0 mt-0.5" />
                1 Free Workshop / Month
              </li>
              <li className="flex gap-3 text-sm text-gray-500 line-through">
                <FaTimes className="shrink-0 mt-0.5" />
                Advanced Styling
              </li>
              <li className="flex gap-3 text-sm text-gray-500 line-through">
                <FaTimes className="shrink-0 mt-0.5" />
                Instructor Feedback
              </li>
            </ul>
            <Link
              href={user ? "/courses" : "/register"}
              className="block w-full py-3 border border-gray-600 rounded-lg font-bold hover:bg-gray-800 transition text-mambo-text text-center"
            >
              {user ? "Current Plan" : "Create Free Account"}
            </Link>
          </div>

          {/* Social Dancer Tier - Most Popular */}
          <div className="relative border-2 border-mambo-blue bg-gray-900 rounded-2xl p-8 flex flex-col shadow-2xl shadow-blue-900/20 scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mambo-blue text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
              Most Popular
            </div>

            <div className="mb-4 mt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Social Dancer
              </span>
            </div>
            <div className="text-4xl font-bold mb-2 text-mambo-text">
              $29<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>
            <div className="text-sm text-gray-500 mb-8">Billed monthly.</div>

            <ul className="text-left space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-mambo-text font-semibold">
                <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                Unlimited Course Access
              </li>
              <li className="flex gap-3 text-sm text-mambo-text font-semibold">
                <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                New Workshops Weekly
              </li>
              <li className="flex gap-3 text-sm text-mambo-text font-semibold">
                <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                Advanced Partnerwork
              </li>
              <li className="flex gap-3 text-sm text-mambo-text font-semibold">
                <FaCheck className="text-mambo-blue shrink-0 mt-0.5" />
                Community Challenges
              </li>
            </ul>
            <button className="block w-full py-4 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition shadow-lg shadow-blue-500/25">
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Performer Tier */}
          <div className="border border-gray-800 bg-gray-900/30 rounded-2xl p-8 flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                Performer
              </span>
            </div>
            <div className="text-4xl font-bold mb-2 text-mambo-text">
              $49<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>
            <div className="text-sm text-gray-500 mb-8">For serious students.</div>

            <ul className="text-left space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-gray-300">
                <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                Everything in Social Dancer
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                1 Video Review / Month
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                Direct Chat with Instructors
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <FaCheck className="text-yellow-500 shrink-0 mt-0.5" />
                &quot;Certified&quot; Badge on Profile
              </li>
            </ul>
            <button className="block w-full py-3 border border-gray-600 rounded-lg font-bold hover:bg-gray-800 transition text-mambo-text">
              Get Performer Access
            </button>
          </div>
        </div>

        <div className="mt-20 text-gray-500 text-sm">
          <p>
            Secure payment powered by Stripe. <br />
            Questions? Email support@themamboinn.com
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
