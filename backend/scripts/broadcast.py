"""Generic dispatcher for the May 2026 Founder Week campaign.

Loads pre-staged email content from scripts/email_content/{email_id}.py
and sends it to the right segment. Wraps the body in the shared HTML
template and Resend-sends with the standard skip-list, dry-run, limit,
and only-emails controls.

Usage:
    python scripts/broadcast.py --email-id a1                     # dry-run
    python scripts/broadcast.py --email-id a1 --apply              # live send
    python scripts/broadcast.py --email-id a1 --apply --limit 3    # smoke
    python scripts/broadcast.py --email-id b2 --apply --only x@y.z # to one address

Each email_id has its own resume file (already_sent_{email_id}.txt) so you
can re-run safely without re-sending to the same person.

Segment routing (SQL filter chosen by module.SEGMENT):
  A   — waitlisters who never activated, no active/trialing sub
  B   — activated (email/google/apple), verified, no active/trialing sub
  C   — currently in-trial
  D   — active paying subscribers (any tier)
  BCD — UNION of B+C+D: everyone who has a real account, regardless of
        sub status. Used for one-off cross-cohort sends (e.g. the
        bonus Roundtable invite that goes to every member).
  BW  — B intersected with was_waitlister=TRUE: activated accounts that
        originally came in via the waitlist (excludes direct /register
        signups). Use for Founder-Badge-related emails since the badge
        is gated on waitlist origin.

Token TTL: as long as you ship Segment A emails (which use __MAGIC_LINK__),
PASSWORD_RESET_EXPIRE_MINUTES on Railway must be >= 1440. Script will warn
loudly if not.
"""
import argparse
import importlib
import os
import sys
import time

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(REPO_ROOT, ".env"))
except ImportError:
    print("Warning: python-dotenv not installed. Env vars must be set manually.")

try:
    import resend
except ImportError:
    print("Error: 'resend' not installed. pip install resend")
    sys.exit(1)

from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import text
from models import get_engine
from config import settings

# Reuse the curated skip-list from the day-2 broadcast. Single source of
# truth — adding a new bad address here propagates to every send.
from scripts.broadcast_waitlist import SKIP_EMAILS, SKIP_DOMAINS, _should_skip
from scripts.email_content import _template


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

resend.api_key = os.environ.get("RESEND_API_KEY")

raw_from = os.environ.get("FROM_EMAIL", "pavlepopovic@themamboguild.com")
FROM_EMAIL = raw_from if "<" in raw_from else f"The Mambo Guild <{raw_from}>"

FRONTEND_URL = settings.FRONTEND_URL.rstrip("/")
FORGOT_PASSWORD_URL = f"{FRONTEND_URL}/forgot-password"

_SERIALIZER = URLSafeTimedSerializer(settings.SECRET_KEY)


# ---------------------------------------------------------------------------
# Segment SQL — keyed by SEGMENT letter on the email module
# ---------------------------------------------------------------------------

_SEGMENT_SQL = {
    # Waitlisters who never activated (still auth_provider='waitlist'),
    # excluding anyone already on a paid status. Same filter as day-1/day-2
    # so resume-file overlaps are predictable.
    "A": """
        SELECT u.id, u.email, up.username
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN subscriptions s ON s.user_id = u.id
        WHERE u.auth_provider = 'waitlist'
          AND u.email IS NOT NULL
          AND u.email <> ''
          AND (s.status IS NULL OR s.status NOT IN ('active', 'trialing'))
        ORDER BY u.created_at NULLS LAST
    """,
    # Activated accounts (email/google/apple), email-verified, NOT already
    # paying or in-trial. INCOMPLETE/canceled/past_due all qualify — they're
    # either bounced-from-checkout (highest intent) or churned but reachable.
    "B": """
        SELECT u.id, u.email, up.username
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN subscriptions s ON s.user_id = u.id
        WHERE u.auth_provider IN ('email', 'google', 'apple')
          AND u.is_verified = TRUE
          AND u.email IS NOT NULL
          AND u.email <> ''
          AND (s.status IS NULL OR s.status NOT IN ('active', 'trialing'))
        ORDER BY u.created_at NULLS LAST
    """,
    # Currently in 7-day trial. Used for onboarding / mid-trial / pre-billing
    # nudges. Don't email these people the trial-pitch — they're already in.
    "C": """
        SELECT u.id, u.email, up.username
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        JOIN subscriptions s ON s.user_id = u.id
        WHERE s.status = 'trialing'
          AND u.email IS NOT NULL
          AND u.email <> ''
        ORDER BY u.created_at NULLS LAST
    """,
    # Active paying subscribers (any tier — Advanced + Performer/Guild
    # Master). Use carefully: these are your committed customers, so the
    # bar for emailing them should be high (perk announcements, schedule
    # changes, churn-risk-recovery etc.).
    "D": """
        SELECT u.id, u.email, up.username
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        JOIN subscriptions s ON s.user_id = u.id
        WHERE s.status = 'active'
          AND u.email IS NOT NULL
          AND u.email <> ''
        ORDER BY u.created_at NULLS LAST
    """,
    # B narrowed to former waitlisters only. Use for Founder-Badge
    # nudges (the badge is gated on waitlist origin per
    # project_founder_badge_gate). Excludes direct /register signups
    # who would otherwise be told they can earn a badge they cannot.
    "BW": """
        SELECT u.id, u.email, up.username
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN subscriptions s ON s.user_id = u.id
        WHERE u.auth_provider IN ('email', 'google', 'apple')
          AND u.is_verified = TRUE
          AND up.was_waitlister = TRUE
          AND u.email IS NOT NULL
          AND u.email <> ''
          AND (s.status IS NULL OR s.status NOT IN ('active', 'trialing'))
        ORDER BY u.created_at NULLS LAST
    """,
    # UNION B + C + D. Everyone who has a real account (not a waitlist
    # shadow row), regardless of sub status. EXISTS subqueries instead of
    # JOIN+DISTINCT to avoid duplicate rows for users with multiple
    # historical subscription rows (cancelled then resubscribed, etc.).
    "BCD": """
        SELECT u.id, u.email, up.username
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        WHERE u.email IS NOT NULL
          AND u.email <> ''
          AND (
            EXISTS (SELECT 1 FROM subscriptions s
                    WHERE s.user_id = u.id AND s.status = 'active')
            OR
            EXISTS (SELECT 1 FROM subscriptions s
                    WHERE s.user_id = u.id AND s.status = 'trialing')
            OR
            (u.auth_provider IN ('email', 'google', 'apple')
             AND u.is_verified = TRUE
             AND NOT EXISTS (SELECT 1 FROM subscriptions s2
                             WHERE s2.user_id = u.id
                               AND s2.status IN ('active', 'trialing')))
          )
        ORDER BY u.created_at NULLS LAST
    """,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_email_module(email_id: str):
    """Import scripts.email_content.{email_id} and validate its shape."""
    try:
        module = importlib.import_module(f"scripts.email_content.{email_id}")
    except ImportError as e:
        sys.exit(f"Error: cannot import scripts.email_content.{email_id}: {e}")

    required = ("SEGMENT", "SUBJECT", "PREHEADER", "BODY_HTML", "BODY_TEXT")
    missing = [k for k in required if not hasattr(module, k)]
    if missing:
        sys.exit(f"Error: email module {email_id} missing fields: {missing}")

    if module.SEGMENT not in _SEGMENT_SQL:
        valid = "/".join(_SEGMENT_SQL.keys())
        sys.exit(f"Error: SEGMENT={module.SEGMENT!r} not one of {valid}")

    return module


def _build_magic_link(user_id: str) -> str:
    """Per-user signed token for /reset-password (matches send_password_reset_email
    salt so the existing endpoint validates without backend changes). Used by
    Segment A only — Segment B/C send to /pricing or /community directly."""
    token = _SERIALIZER.dumps(str(user_id), salt="password-reset")
    return f"{FRONTEND_URL}/reset-password?token={token}"


def _load_users(segment: str, only_emails: set = None):
    """Pull recipients from prod DB. With --only, the segment filter is
    bypassed in favor of an explicit email list (useful for sending a test
    to your own admin account, which doesn't fit any of A/B/C buckets)."""
    engine = get_engine()
    with engine.connect() as conn:
        if only_emails:
            rows = conn.execute(text("""
                SELECT u.id, u.email, up.username
                FROM users u
                JOIN user_profiles up ON up.user_id = u.id
                WHERE LOWER(u.email) = ANY(:emails)
                  AND u.email IS NOT NULL
                  AND u.email <> ''
            """), {"emails": list(only_emails)}).all()
        else:
            rows = conn.execute(text(_SEGMENT_SQL[segment])).all()
    return [
        {"id": str(r.id), "email": r.email, "username": r.username or "Dancer"}
        for r in rows
    ]


def _render(module, username: str, magic_link: str) -> tuple[str, str]:
    """Resolve placeholders in the email module's BODY_HTML/BODY_TEXT and
    wrap the HTML in the shared template. Returns (html, text)."""
    body_html = (
        module.BODY_HTML
        .replace("__USERNAME__", username)
        .replace("__MAGIC_LINK__", magic_link)
        .replace("__FRONTEND_URL__", FRONTEND_URL)
    )
    body_text = (
        module.BODY_TEXT
        .replace("__USERNAME__", username)
        .replace("__MAGIC_LINK__", magic_link)
        .replace("__FRONTEND_URL__", FRONTEND_URL)
    )

    html = _template.wrap_html(body_html, module.SUBJECT, module.PREHEADER)
    html = html.replace("__FORGOT_URL__", FORGOT_PASSWORD_URL)
    text_full = _template.wrap_text(body_text)
    text_full = text_full.replace("__FORGOT_URL__", FORGOT_PASSWORD_URL)

    return html, text_full


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email-id", required=True,
                        help="Email module name in scripts/email_content/ (e.g. a1, b2, c3)")
    parser.add_argument("--apply", action="store_true",
                        help="Actually send. Default is dry-run.")
    parser.add_argument("--limit", type=int, default=0,
                        help="Cap at N sends (0 = no cap).")
    parser.add_argument("--only", default="",
                        help="Comma-separated email list — only send to these (testing).")
    parser.add_argument("--sleep-ms", type=int, default=600,
                        help="Throttle between sends (default 600ms = ~100/min).")
    args = parser.parse_args()

    module = load_email_module(args.email_id)
    segment = module.SEGMENT
    resume_file = os.path.join(SCRIPT_DIR, f"already_sent_{args.email_id}.txt")

    print(f"From:        {FROM_EMAIL}")
    print(f"Email ID:    {args.email_id}")
    print(f"Segment:     {segment}")
    print(f"Subject:     {module.SUBJECT}")
    print(f"Preheader:   {module.PREHEADER[:80]}{'...' if len(module.PREHEADER) > 80 else ''}")
    print(f"Send-at:     {getattr(module, 'SEND_AT_UTC', 'n/a')}")
    print(f"Frontend:    {FRONTEND_URL}")
    print(f"Resume file: {os.path.basename(resume_file)}")
    print(f"Mode:        {'APPLY' if args.apply else 'DRY-RUN'}")
    if args.limit:
        print(f"Limit:       {args.limit}")
    if args.only:
        print(f"Only:        {args.only}")
    print()

    # Magic-link TTL warning — only meaningful for Segment A which uses __MAGIC_LINK__.
    # Segment B/C link to /pricing /community directly so no token is involved.
    if segment == "A":
        ttl_min = settings.PASSWORD_RESET_EXPIRE_MINUTES
        if ttl_min < 1440:
            print(f"WARNING: PASSWORD_RESET_EXPIRE_MINUTES = {ttl_min} min "
                  f"({ttl_min // 60}h). For a campaign broadcast you almost "
                  f"certainly want 10080 (7 days). Set it on Railway and "
                  f"redeploy BEFORE running --apply, or magic links will "
                  f"expire before recipients click.")
            print()

    if args.apply and not resend.api_key:
        sys.exit("Error: RESEND_API_KEY env var not set.")

    only_set = {e.strip().lower() for e in args.only.split(",") if e.strip()}
    users = _load_users(segment, only_emails=only_set if only_set else None)
    if only_set:
        print(f"--only override active: loaded {len(users)} matching user(s) "
              f"regardless of segment filter")
    else:
        print(f"Segment {segment} recipients in DB: {len(users)}")

    already_sent = set()
    if os.path.exists(resume_file):
        with open(resume_file, "r", encoding="utf-8") as f:
            already_sent = {ln.strip().lower() for ln in f if ln.strip()}
        print(f"Resume: {len(already_sent)} already sent — will skip")
    print("-" * 60)

    sent = 0
    failed = 0
    skipped_skiplist = 0
    skipped_resume = 0

    for user in users:
        email = user["email"].strip()
        if not email:
            continue
        email_lc = email.lower()

        skip_reason = _should_skip(email_lc)
        if skip_reason:
            skipped_skiplist += 1
            print(f"  SKIP  {email}  ({skip_reason})")
            continue

        if email_lc in already_sent:
            skipped_resume += 1
            continue

        if args.limit and sent >= args.limit:
            print(f"  HIT --limit {args.limit}, stopping")
            break

        magic_link = _build_magic_link(user["id"])
        html, text_body = _render(module, user["username"], magic_link)

        if not args.apply:
            print(f"  [DRY] would send to {email}")
            sent += 1
            continue

        try:
            resend.Emails.send({
                "from": FROM_EMAIL,
                "to": [email],
                "subject": module.SUBJECT,
                "html": html,
                "text": text_body,
            })
            print(f"  SENT  {email}")
            sent += 1
            try:
                with open(resume_file, "a", encoding="utf-8") as asf:
                    asf.write(email + "\n")
            except Exception:
                pass
            time.sleep(args.sleep_ms / 1000.0)
        except Exception as e:
            print(f"  FAIL  {email}: {e}")
            failed += 1

    print("-" * 60)
    print(f"Done. sent={sent} failed={failed} "
          f"skipped_list={skipped_skiplist} skipped_resume={skipped_resume}")


if __name__ == "__main__":
    main()
