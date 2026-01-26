"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import { BadgeTrophyCase } from "@/components/BadgeTrophyCase";
import { FaFire, FaBolt, FaMedal, FaStar } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicProfilePage() {
    const params = useParams();
    const username = params?.username as string;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;
            try {
                setLoading(true);
                // We need a specific endpoint for public profile by username
                // Fallback: If current user matches, use that. 
                // AND/OR implement `apiClient.getPublicProfile(username)`
                // For now, let's assume I will add `getPublicProfile` to api.ts
                const data = await apiClient.getPublicProfile(username);
                setProfile(data);
            } catch (err: any) {
                if (currentUser && (currentUser.username === username || currentUser.id === username)) {
                    setProfile(currentUser);
                } else {
                    setError("Dancer not found. They might be practicing in a secret studio.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, currentUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
                <div className="text-gray-400">Scouting talent...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-mambo-dark">
                <NavBar user={currentUser || undefined} />
                <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-xl text-gray-400 mb-8">{error || "User not found"}</p>
                    <Link href="/" className="px-6 py-3 bg-mambo-blue rounded-full font-bold hover:bg-blue-600 transition">
                        Return Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mambo-dark">
            <NavBar user={currentUser || undefined} />

            <div className="max-w-5xl mx-auto px-8 py-12 pt-28">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
                    <div className="relative group">
                        {profile.avatar_url ? (
                            <div className="w-32 h-32 rounded-full shadow-2xl overflow-hidden border-4 border-mambo-gold/20">
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.username || "Dancer"}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-full shadow-2xl bg-gradient-to-br from-mambo-gold to-orange-500 flex items-center justify-center text-black text-4xl font-bold">
                                {(profile.username?.[0] || "U").toUpperCase()}
                            </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-lg z-10">
                            Lvl {profile.level}
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-mambo-text font-serif tracking-tight">
                                @{profile.username}
                            </h1>
                            {currentUser?.username === profile.username && (
                                <Link href="/profile" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition">
                                    Edit Profile
                                </Link>
                            )}
                        </div>
                        <p className="text-gray-400 mb-8">Passionate Dancer • {profile.tier} Tier</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                                <FaFire className="text-orange-500" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Streak</div>
                                    <div className="font-bold text-mambo-text">{profile.streak_count} Days</div>
                                </div>
                            </div>
                            <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                                <FaBolt className="text-mambo-gold" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">XP</div>
                                    <div className="font-bold text-mambo-text">{profile.xp.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Trophy Case (Read Only) */}
                <div className="mt-8">
                    <BadgeTrophyCase
                        initialBadges={profile.badges} // Profile endpoint needs to return badges
                        streakCount={profile.streak_count}
                        userStats={profile.stats}
                        userId={profile.id} // Passing ID puts it in read-only mode
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
}
