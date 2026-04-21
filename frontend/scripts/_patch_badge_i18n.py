"""
Patch the badges.<id>.{name,description} tree across all 14 locales so the
trophy case stops showing raw i18n keys for new/revamped badges.

Scope (minimum useful):
  * Add missing entries for the post-migration-018 families (liked_*, motw_*,
    original_*, guild_*) and the new migration-019 families (motw_love_*,
    original_love_*, guild_love_*, promoter).
  * Update the description for existing families whose thresholds changed in
    migration_019 (new bronze = 1, new gold/diamond pushed higher).
  * Keep already-translated name fields untouched — the English name is only
    used as a fallback when a locale hasn't seen the ID yet.

Running this script is idempotent.
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "el", "ar"]


# English master strings for every currently-active badge_definition ID.
# For non-English locales we fall through to these when no translation exists
# yet — the trophy case also falls back to the DB-side English name.
EN_BADGES: dict[str, dict[str, str]] = {
    # --- Move Master (motw_videos) ---
    "motw_bronze":   {"name": "Move Master I",   "description": "Posted your first Move of the Week video. Welcome to the floor."},
    "motw_silver":   {"name": "Move Master II",  "description": "Posted 10 Move of the Week videos."},
    "motw_gold":     {"name": "Move Master III", "description": "Posted 30 Move of the Week videos. You're a regular."},
    "motw_diamond":  {"name": "Move Master IV",  "description": "Posted 100 Move of the Week videos. Certified weekly legend."},

    # --- The Originator (original_videos) ---
    "original_bronze":  {"name": "The Originator I",   "description": "Shared your first original choreo or freestyle."},
    "original_silver":  {"name": "The Originator II",  "description": "Shared 10 original choreos or freestyles."},
    "original_gold":    {"name": "The Originator III", "description": "Shared 30 original choreos or freestyles. You have a voice."},
    "original_diamond": {"name": "The Originator IV",  "description": "Shared 100 original choreos or freestyles. A true creator."},

    # --- Class Act (guild_videos) ---
    "guild_bronze":  {"name": "Class Act I",   "description": "Posted your first Guild-class choreo."},
    "guild_silver":  {"name": "Class Act II",  "description": "Posted 10 Guild-class choreos."},
    "guild_gold":    {"name": "Class Act III", "description": "Posted 30 Guild-class choreos. Full ensemble material."},
    "guild_diamond": {"name": "Class Act IV",  "description": "Posted 100 Guild-class choreos. Guild pillar."},

    # --- Center Stage (videos_posted) ---
    "center_stage_bronze":  {"name": "Center Stage I",   "description": "Posted your first video to The Stage."},
    "center_stage_silver":  {"name": "Center Stage II",  "description": "Posted 25 videos to The Stage."},
    "center_stage_gold":    {"name": "Center Stage III", "description": "Posted 75 videos to The Stage. Mic check permanent."},
    "center_stage_diamond": {"name": "Center Stage IV",  "description": "Posted 250 videos to The Stage. Headliner status."},

    # --- Crowd Favorite (likes_received, total) ---
    "liked_bronze":  {"name": "Crowd Favorite I",   "description": "Received your first like."},
    "liked_silver":  {"name": "Crowd Favorite II",  "description": "Received 100 total likes across your posts."},
    "liked_gold":    {"name": "Crowd Favorite III", "description": "Received 500 total likes across your posts."},
    "liked_diamond": {"name": "Crowd Favorite IV",  "description": "Received 2,500 total likes. The room loves you."},

    # --- Move Magnet (motw_likes) — NEW ---
    "motw_love_bronze":  {"name": "Move Magnet I",   "description": "Got your first like on a Move of the Week video."},
    "motw_love_silver":  {"name": "Move Magnet II",  "description": "25 likes across your Move of the Week videos."},
    "motw_love_gold":    {"name": "Move Magnet III", "description": "150 likes across your Move of the Week videos."},
    "motw_love_diamond": {"name": "Move Magnet IV",  "description": "1,000 likes across your Move of the Week videos."},

    # --- Fan Favorite (original_likes) — NEW ---
    "original_love_bronze":  {"name": "Fan Favorite I",   "description": "Got your first like on an original post."},
    "original_love_silver":  {"name": "Fan Favorite II",  "description": "25 likes across your original posts."},
    "original_love_gold":    {"name": "Fan Favorite III", "description": "150 likes across your original posts."},
    "original_love_diamond": {"name": "Fan Favorite IV",  "description": "1,000 likes across your original posts."},

    # --- Guild Applause (guild_likes) — NEW ---
    "guild_love_bronze":  {"name": "Guild Applause I",   "description": "Got your first like on a Guild-class post."},
    "guild_love_silver":  {"name": "Guild Applause II",  "description": "25 likes across your Guild-class posts."},
    "guild_love_gold":    {"name": "Guild Applause III", "description": "150 likes across your Guild-class posts."},
    "guild_love_diamond": {"name": "Guild Applause IV",  "description": "1,000 likes across your Guild-class posts."},

    # --- Talent Scout (reactions_given) ---
    "talent_scout_bronze":  {"name": "Talent Scout I",   "description": "Gave your first like."},
    "talent_scout_silver":  {"name": "Talent Scout II",  "description": "Gave 100 likes across the community."},
    "talent_scout_gold":    {"name": "Talent Scout III", "description": "Gave 500 likes. Eye for talent."},
    "talent_scout_diamond": {"name": "Talent Scout IV",  "description": "Gave 2,500 likes. Community champion."},

    # --- The Socialite (comments_posted) ---
    "the_socialite_bronze":  {"name": "The Socialite I",   "description": "Left your first comment."},
    "the_socialite_silver":  {"name": "The Socialite II",  "description": "Left 50 comments."},
    "the_socialite_gold":    {"name": "The Socialite III", "description": "Left 250 comments. You're the conversation."},
    "the_socialite_diamond": {"name": "The Socialite IV",  "description": "Left 1,000 comments."},

    # --- Curious Mind (questions_posted) ---
    "curious_mind_bronze":  {"name": "Curious Mind I",   "description": "Asked your first question in the Lab."},
    "curious_mind_silver":  {"name": "Curious Mind II",  "description": "Asked 15 questions in the Lab."},
    "curious_mind_gold":    {"name": "Curious Mind III", "description": "Asked 50 questions in the Lab."},
    "curious_mind_diamond": {"name": "Curious Mind IV",  "description": "Asked 150 questions. The Lab runs on your why."},

    # --- The Professor (solutions_accepted) ---
    "the_professor_bronze":  {"name": "The Professor I",   "description": "Had your first answer marked as the solution."},
    "the_professor_silver":  {"name": "The Professor II",  "description": "Had 10 answers marked as solutions."},
    "the_professor_gold":    {"name": "The Professor III", "description": "Had 40 answers marked as solutions. Tenured."},
    "the_professor_diamond": {"name": "The Professor IV",  "description": "Had 150 answers marked as solutions. Department chair."},

    # --- Unstoppable (daily_streak) ---
    "unstoppable_bronze":  {"name": "Unstoppable I",   "description": "Logged in two days in a row."},
    "unstoppable_silver":  {"name": "Unstoppable II",  "description": "14-day practice streak."},
    "unstoppable_gold":    {"name": "Unstoppable III", "description": "60-day practice streak. Two months, pure."},
    "unstoppable_diamond": {"name": "Unstoppable IV",  "description": "200-day practice streak. Built different."},

    # --- Promoter (referrals_converted) — NEW ---
    "promoter": {"name": "Promoter", "description": "Brought 3 dancers into the Guild through your referral link."},

    # --- Specials (unchanged; re-listed so descriptions are complete) ---
    "founder_diamond": {"name": "Founder X", "description": "One of the founding members of The Mambo Guild."},
    "beta_tester":     {"name": "Beta Tester", "description": "Helped test the platform during early access. Awarded by invitation only."},
    "pro_member":      {"name": "Pro Member", "description": "Active Advanced-tier subscriber."},
    "guild_master":    {"name": "Guild Master", "description": "Active Performer-tier subscriber."},
}


def patch_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    badges = data.get("badges", {})
    if not isinstance(badges, dict):
        # Older builds had badges: "Badges" (a string). That key lives under
        # profile now. Skip only if it's clearly not our structure.
        print(f"skip {locale}.json — badges is not an object")
        return

    added = 0
    updated = 0
    for bid, strings in EN_BADGES.items():
        existing = badges.get(bid)
        if existing is None:
            # Brand new entry — use English.
            badges[bid] = {"name": strings["name"], "description": strings["description"]}
            added += 1
        else:
            # Keep existing translated name. For description, if it looks
            # thresholdy (contains a digit), overwrite with the new English
            # text so the UI reflects the new curve. Otherwise leave it alone.
            if "description" in existing and any(c.isdigit() for c in existing["description"]):
                if existing["description"] != strings["description"]:
                    existing["description"] = strings["description"]
                    updated += 1
            else:
                # No description at all or a non-threshold description.
                existing.setdefault("name", strings["name"])
                existing.setdefault("description", strings["description"])

    data["badges"] = badges
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"patched {locale}.json  (+{added} new, {updated} description updates)")


def main() -> None:
    for locale in LOCALES:
        patch_locale(locale)


if __name__ == "__main__":
    main()
