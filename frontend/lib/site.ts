export const SITE_URL = "https://themamboguild.com";

export const SITE_NAME = "The Mambo Guild";
export const SITE_TAGLINE = "Salsa On2 from Level 0 to 100";
export const SITE_DESCRIPTION =
    "Learn Salsa On2 (New York Style Mambo) with a 500-lesson structured curriculum by a 2x European Champion. Visual Skill Tree, global community, and expert guest teachers. 7-day free trial.";

export const FOUNDER = {
    name: "Pavle Popovic",
    role: "Founder & Head Instructor",
    sameAs: [] as string[],
    image: `${SITE_URL}/assets/Personal_Pic.jpg`,
    description:
        "Professional Salsa On2 (Mambo) instructor, 2x European Champion, certified in Learning Experience Design and Gamification. 10 years dancing, 7 years teaching across London, Brussels, and Rome.",
};

export const CONTACT_EMAIL = "support@themamboguild.com";

export const PRO_GRANDFATHER_END = "2026-08-01T00:00:00Z";
export const PRO_PRICE_NEXT = "$49/mo";
export const PRO_PRICE_CURRENT = "$39/mo";
export const GUILD_MASTER_PRICE_CURRENT = "$59/mo";
export const GUILD_MASTER_PRICE_NEXT = "$99/mo";

export function daysUntilProGrandfatherEnd(now: number = Date.now()): number {
    const end = new Date(PRO_GRANDFATHER_END).getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / 86_400_000));
}
