"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AmbassadorApplyModal from "@/components/AmbassadorApplyModal";
import { useAuth } from "@/contexts/AuthContext";
import { FaInstagram, FaYoutube, FaTrophy, FaMusic, FaBook, FaHistory } from "react-icons/fa";
import { useTranslations } from "@/i18n/useTranslations";

export default function InstructorsPage() {
  const { user } = useAuth();
  const t = useTranslations("instructors");
  const [ambassadorOpen, setAmbassadorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 pt-24 sm:pt-28">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 text-mambo-text">
            {t("pageTitle")}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t("pageSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Pavle Popovic */}
          <div className="bg-mambo-panel border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition">
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-mambo-blue/20 to-purple-600/20 overflow-hidden">
              <Image
                src="/assets/Personal_Pic.jpg"
                alt="Pavle Popovic"
                fill
                className="object-cover object-center"
                style={{ objectPosition: 'center 30%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-mambo-text mb-1">Pavle Popovic</h2>
                  <p className="text-mambo-blue font-semibold">{t("role")}</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/pavlepopovic204/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-mambo-blue transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://www.youtube.com/@TheMamboGuild"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-mambo-blue transition"
                    aria-label="YouTube"
                  >
                    <FaYoutube />
                  </a>
                </div>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {t("bio")}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-mambo-gold shrink-0">
                    <FaTrophy className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mambo-text mb-1">{t("credCertTitle")}</h3>
                    <p className="text-sm text-gray-500">
                      {t("credCertBody")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-mambo-blue shrink-0">
                    <FaMusic className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mambo-text mb-1">{t("credResearchTitle")}</h3>
                    <p className="text-sm text-gray-500">
                      {t("credResearchBody")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-500 italic">
                  &ldquo;{t("quote")}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Timothé Fournier */}
          <div className="bg-mambo-panel border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition">
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-mambo-gold/20 to-mambo-blue/20 overflow-hidden">
              <Image
                src="/assets/TimothePic.png"
                alt="Timothé Fournier"
                fill
                className="object-cover object-center"
                style={{ objectPosition: 'center 20%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-mambo-text mb-1">Timothé Fournier</h2>
                  <p className="text-mambo-blue font-semibold">{t("timotheRole")}</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/timothe.fdance/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-mambo-blue transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://www.amazon.fr/Bible-Salsero-afro-cubaines-moderne-pratiques/dp/2959604008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-mambo-gold transition"
                    aria-label="Book"
                  >
                    <FaBook />
                  </a>
                </div>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {t("timotheBio")}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-mambo-gold shrink-0">
                    <FaHistory className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mambo-text mb-1">{t("timotheHistoryTitle")}</h3>
                    <p className="text-sm text-gray-500">
                      {t("timotheHistoryBody")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-mambo-blue shrink-0">
                    <FaMusic className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-mambo-text mb-1">{t("timotheMamboTitle")}</h3>
                    <p className="text-sm text-gray-500">
                      {t("timotheMamboBody")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-500 italic">
                  &ldquo;{t("timotheQuote")}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-mambo-text mb-4">{t("joinTeamTitle")}</h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {t("joinTeamBody")}
            </p>
            <Link
              href="#"
              className="inline-block px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition text-sm"
            >
              {t("joinTeamCta")}
            </Link>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-mambo-text mb-4">{t("ambassadorTitle")}</h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {t("ambassadorBody")}
            </p>
            <button
              type="button"
              onClick={() => setAmbassadorOpen(true)}
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition text-sm"
            >
              {t("ambassadorCta")}
            </button>
          </div>

          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-mambo-text mb-4">{t("guestTitle")}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("guestBody")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-mambo-blue/10 to-purple-600/10 border border-mambo-blue/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-mambo-text mb-2">{t("learnMoreTitle")}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {t("learnMoreBody")}
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-2 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition text-sm"
            >
              {t("learnMoreCta")}
            </Link>
          </div>
        </div>
      </div>

      <AmbassadorApplyModal
        open={ambassadorOpen}
        onClose={() => setAmbassadorOpen(false)}
      />

      <Footer />
    </div>
  );
}
