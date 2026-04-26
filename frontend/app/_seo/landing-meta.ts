/**
 * Server-side per-locale meta (title + description) for the landing pages
 * (/, /courses, /pricing). Synthesised from the existing translation strings
 * in messages/*.json so we don't have to hand-author 96 SEO strings — the
 * titles and descriptions Googlebot sees match the in-app copy users see.
 *
 * Used by the metadata exports in app/[locale]/page.tsx,
 * app/[locale]/courses/page.tsx, app/[locale]/pricing/page.tsx, and the
 * canonical (English) versions in app/page.tsx etc.
 */
import type { Locale } from "@/i18n/config";

import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import fr from "@/messages/fr.json";
import de from "@/messages/de.json";
import it from "@/messages/it.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import zh from "@/messages/zh.json";
import ru from "@/messages/ru.json";
import pl from "@/messages/pl.json";
import nl from "@/messages/nl.json";
import ar from "@/messages/ar.json";
import el from "@/messages/el.json";
import sr from "@/messages/sr.json";
import tr from "@/messages/tr.json";

type Messages = typeof en;

const ALL_MESSAGES: Record<Locale, Messages> = {
  en, es, pt, fr, de, it, ja, ko, zh, ru, pl, nl, ar, el, sr, tr,
};

export type LandingPath = "/" | "/courses" | "/pricing";

export type LandingMeta = { title: string; description: string };

/** Pull the messages for a locale, falling back to English. */
function pick(locale: Locale): { m: Messages; fb: Messages } {
  return { m: ALL_MESSAGES[locale] ?? ALL_MESSAGES.en, fb: ALL_MESSAGES.en };
}

function homeMeta(locale: Locale): LandingMeta {
  const { m, fb } = pick(locale);
  const hero = m.landing?.hero ?? fb.landing.hero;
  // Title is the existing hero.title (already keyword-rich and locale-aware).
  // Description stitches the subtitle + the three bullets which are short
  // benefit statements already translated for every locale.
  return {
    title: hero.title,
    description:
      `${hero.subtitle} ${hero.bulletNoPartner}. ${hero.bulletLanguages}. ${hero.bulletOnDemand}.`.trim(),
  };
}

function coursesMeta(locale: Locale): LandingMeta {
  const { m, fb } = pick(locale);
  const c = m.courses ?? fb.courses;
  return {
    title: c.title,
    description: c.subtitle,
  };
}

function pricingMeta(locale: Locale): LandingMeta {
  const { m, fb } = pick(locale);
  const p = m.landing?.pricing ?? fb.landing.pricing;
  // E.g. "Join The Mambo Guild Now"
  const title = `${p.headingPre} ${p.headingAccent}`.trim();
  // Stitch all three tiers: name + price (period is /mo etc, locale-aware).
  const guest = `${p.guestListName} (${p.guestListPrice})`;
  const pro = `${p.proName} (${p.proPrice}${p.proPeriod})`;
  const guildMaster = `${p.guildMasterName} (${p.guildMasterPrice}${p.guildMasterPeriod})`;
  return {
    title,
    description: `${guest} · ${pro} · ${guildMaster}.`,
  };
}

export function getLandingMeta(path: LandingPath, locale: Locale): LandingMeta {
  switch (path) {
    case "/":         return homeMeta(locale);
    case "/courses":  return coursesMeta(locale);
    case "/pricing":  return pricingMeta(locale);
  }
}
