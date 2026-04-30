"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/i18n/useTranslations";
import { CONTACT_EMAIL } from "@/lib/site";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const t = useTranslations("footer");
  return (
    <footer className={`border-t border-gray-800 bg-black pt-16 pb-8 mt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-4 gap-6 md:gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2 mb-4">
            <Image
              src="/assets/Logo.png"
              alt="The Mambo Guild"
              width={32}
              height={32}
              className="h-8 w-auto logo-img"
              style={{ mixBlendMode: "screen" }}
            />
            <span className="font-serif text-xl">
              <span className="text-gray-400">THE</span>{" "}
              <span className="text-[#d4af37] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">MAMBO</span>{" "}
              <span className="text-gray-400">GUILD</span>
            </span>
          </Link>
          <p className="text-gray-500 max-w-sm">
            {t("tagline")}
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-mambo-text">{t("learnTitle")}</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link href="/courses" className="hover:text-mambo-blue transition">
                {t("learnCourses")}
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-mambo-blue transition">
                {t("learnPricing")}
              </Link>
            </li>
            <li>
              <Link href="/instructors" className="hover:text-mambo-blue transition">
                {t("learnInstructor")}
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-mambo-blue transition">
                {t("learnCommunity")}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-mambo-blue transition">
                {t("learnBlog")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-mambo-text">{t("connectTitle")}</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <a
                href="https://www.instagram.com/pavlepopovic204/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mambo-blue transition"
              >
                {t("connectInstagram")}
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@TheMamboGuild"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mambo-blue transition"
              >
                {t("connectYoutube")}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Mambo Guild Support")}`}
                className="hover:text-mambo-blue transition"
              >
                {t("connectContactSupport")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between text-xs text-gray-600">
        <p>{t("copyright")}</p>
      </div>
    </footer>
  );
}

