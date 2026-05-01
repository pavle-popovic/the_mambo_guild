"""
Day-2 conversion broadcast — "Claim your 7-Day Free Trial"
Send date: 2026-04-30 (day after launch)

Re-sends a per-user magic-link claim email to every waitlister who has
NOT yet converted (no ACTIVE/TRIALING subscription row). Day-1 launch
broadcast went out yesterday; this is the follow-up nudge for the
~95% of the list that hasn't activated.

Same magic-link mechanism as the day-1 script (itsdangerous,
salt="password-reset" → /reset-password endpoint → auto-verifies +
auto-logs in waitlist claimants). No backend changes needed.

Different from day-1:
  - New SUBJECT/PREHEADER/copy focused on the 7-day free trial promise
  - SQL skips users already on ACTIVE/TRIALING (don't pester paying users)
  - New resume file (already_sent_launch_day2.txt) so day-1 recipients
    are NOT auto-skipped — every non-converted waitlister gets day 2

CRITICAL OPERATIONAL NOTE:
  PASSWORD_RESET_EXPIRE_MINUTES=10080 (7 days) must already be set on
  Railway from the day-1 broadcast. If you've reverted it, magic links
  will expire before recipients click.

Modes:
  --dry-run             default; print per-user actions, send nothing
  --apply               actually send
  --limit N             cap at N sends (smoke-test with --apply --limit 3)
  --only EMAIL[,EMAIL]  send only to specific addresses (testing)
"""
import argparse
import os
import sys
import time

# ---------------------------------------------------------------------------
# Bootstrapping
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

resend.api_key = os.environ.get("RESEND_API_KEY")

raw_from = os.environ.get("FROM_EMAIL", "pavlepopovic@themamboguild.com")
FROM_EMAIL = raw_from if "<" in raw_from else f"The Mambo Guild <{raw_from}>"

# Subject + preheader. State-of-the-art B2C launch:
#   - Personal voice (founder name) > corporate "we"
#   - Concrete event > vague benefit
#   - Specific deadline > vague urgency
#   - No caps lock, no exclamation chains, no spam triggers
SUBJECT = "Claim your 7-Day Free Trial"
PREHEADER = (
    "7 days free, full Vault access. Cancel in 2 clicks. "
    "Founder Diamond closes May 6."
)

FRONTEND_URL = settings.FRONTEND_URL.rstrip("/")
FORGOT_PASSWORD_URL = f"{FRONTEND_URL}/forgot-password"

ALREADY_SENT_FILE = os.path.join(SCRIPT_DIR, "already_sent_launch_day2.txt")

# Per-user signing serializer. Same secret + salt as
# services/email_service.send_password_reset_email so the resulting
# /reset-password?token=... URL validates against the existing endpoint
# without any backend changes.
_SERIALIZER = URLSafeTimedSerializer(settings.SECRET_KEY)


# ---------------------------------------------------------------------------
# Skip list — addresses we never email under any circumstances. Mirrors the
# list curated in email_01_the_tease.py. If a new bad actor shows up, add
# them here AND in email_01_the_tease.py so future broadcasts also skip.
# ---------------------------------------------------------------------------
SKIP_EMAILS = {
    "danielenapoletano92@gmail.com", "malzev1@gmail.com",
    "lucy.arellano97@gmail.com", "alicia.adamfe@gmail.com",
    "tine.heggernes@gmail.com", "lancekaplan@gmail.com",
    "nycoach@ymail.com", "karlasutlovic@yahoo.com",
    "almansyahluthfi@gmail.com",
    # Unsubscribed during the launch broadcast
    "sajuran.g8@gmail.com",
    "michaelbeloved01@gmail.com",
    "csjb.tecnologia@gmail.com",
    # Unsubscribed during the day-2 broadcast (May 1)
    "jusanoixi@gmail.com",
    "heinwillems13@gmail.com",
    # GDPR Article 17 deletion request, fulfilled — see scripts/gdpr_deletion_log.txt
    "hakanceylan899@gmail.com",
    # Disposable / nonsense addresses
    "qffgqg@ebhtbt.com", "test@gmail.com", "test@hotmail.com",
    "test3@hotmail.com", "test4@gmail.com",
    "yahamo2849@cimario.com", "viwakit677@codgal.com",
    "lawhitney.lagasse@inboxorigin.com",
    "daniel.guzman3300@gmail.comd", "wtd2101@me.cim",
    "kisslaccer@gmail.co",
    "yewape6701@duoley.com", "yewap26701@duoley.com",
    "yeaape6701@duoley.com", "yeaapesu6701@duoley.com",
    "yaape6701@duoley.com",
    # allfreemail.net farm — every address ending in this domain is
    # blocked at the domain level below; explicit listing here is a
    # belt-and-braces for any historical leak.
    "nocholas.bradbury@allfreemail.net",
    "marsp557@allfreemail.net", "kimblery.eastburn@allfreemail.net",
    "carlean.nailor@allfreemail.net", "rahshon.wingate@allfreemail.net",
    "alanda.fullington@allfreemail.net", "merlee.appell@allfreemail.net",
    "clorissa.vrieze@allfreemail.net", "margeree.christ@allfreemail.net",
    "hance.hunkins@allfreemail.net", "ector.ocheltree@allfreemail.net",
    "dezra.schauer@allfreemail.net", "merrilie.arrant@allfreemail.net",
    "normalee.kirkley@allfreemail.net", "hiroto.shiflett@allfreemail.net",
    "timnesha.mulholland@allfreemail.net", "eray.ornelas@allfreemail.net",
    "nazavier.jaques@allfreemail.net", "faron.zabel@allfreemail.net",
    "riad.garces@allfreemail.net", "sundai.berthold@allfreemail.net",
    "tashae.ferranti@allfreemail.net", "vonda.casebolt@allfreemail.net",
    "paij.huneycutt@allfreemail.net", "melvene.chagnon@allfreemail.net",
    "mareya.eddington@allfreemail.net", "killiam.slaugh@allfreemail.net",
    "sophina.windholz@allfreemail.net", "ezri.hoak@allfreemail.net",
    "mchenry.durrett@allfreemail.net",
    "jacobalexander.liss@allfreemail.net",
    "shlonda.gilliard@allfreemail.net", "mamcg3448@allfreemail.net",
    "josejr.whitcher@allfreemail.net", "ivani.cripe@allfreemail.net",
    "jemere.fulton@allfreemail.net", "yamilett.weldon@allfreemail.net",
    "tykisha.gillum@allfreemail.net",
    "corenthia.jordahl@allfreemail.net",
    "vuthy.shetler@allfreemail.net", "nychole.everett@allfreemail.net",
    "driston.mcclerkin@allfreemail.net", "jereal.kerby@allfreemail.net",
    "rakyia.rambo@allfreemail.net", "abednego.pharris@allfreemail.net",
    "napua.mackley@allfreemail.net", "ijanae.trimmer@allfreemail.net",
    "bitanya.rhinehart@allfreemail.net",
}

SKIP_DOMAINS = {
    # Domain-level blocks for known farms — catches any future address
    # at these domains without needing to enumerate them above.
    "allfreemail.net", "ebhtbt.com", "cimario.com", "codgal.com",
    "inboxorigin.com", "duoley.com",
}


# ---------------------------------------------------------------------------
# Email content
# ---------------------------------------------------------------------------

def get_html(username: str, magic_link: str) -> str:
    """Day-2 HTML. Subject is the trial promise, opener echoes it, value
    recap below the fold for scrollers, Founder Diamond deadline + locked-in
    pricing close the email. Same visual system as day-1 (Georgia serif,
    cream bg, gold-gradient CTA). No em dashes, no caps lock, no spam triggers."""
    html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claim your 7-Day Free Trial</title>
    <style>
        body { font-family: Georgia, 'Times New Roman', Times, serif;
               background-color: #F9F7F1; color: #333333;
               margin: 0; padding: 0; line-height: 1.7; }
        .preheader { display: none; visibility: hidden; opacity: 0;
                     color: transparent; height: 0; width: 0;
                     overflow: hidden; }
        .container { max-width: 600px; margin: 0 auto; padding: 36px 20px;
                     background-color: #F9F7F1; }
        h1 { font-family: Georgia, serif; font-size: 30px; color: #111;
             margin: 0 0 12px 0; line-height: 1.2; }
        h2 { font-family: Georgia, serif; color: #111; font-size: 19px;
             margin-top: 32px; margin-bottom: 8px;
             border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; }
        p { font-size: 15px; margin: 0 0 14px 0; color: #333; }
        ul { padding-left: 20px; margin: 0 0 14px 0; }
        li { font-size: 14px; margin-bottom: 8px; line-height: 1.6;
             color: #333; }
        strong { color: #000; }
        .badge { display: inline-block; background-color: #D4AF37;
                 color: #000; font-size: 11px; font-weight: bold;
                 letter-spacing: 2px; text-transform: uppercase;
                 padding: 6px 14px; border-radius: 2px;
                 margin-bottom: 18px; font-family: Arial, sans-serif; }
        .cta-wrap { text-align: center; margin: 28px 0 8px 0; }
        .cta { display: inline-block;
               background: linear-gradient(135deg,#FCE205 0%,#D4AF37 100%);
               color: #111; font-weight: bold; font-size: 16px;
               text-decoration: none; padding: 16px 28px; border-radius: 6px;
               font-family: Arial, sans-serif; letter-spacing: 0.3px; }
        .cta-sub { text-align: center; font-size: 12px; color: #777;
                   font-family: Arial, sans-serif; margin-top: 4px; }
        .scarcity { background: #fff8e1; border-left: 3px solid #D4AF37;
                    padding: 14px 18px; margin: 24px 0; font-size: 14px;
                    color: #5a4a10; }
        .lock { background: #f3f1ea; border-left: 3px solid #111;
                padding: 14px 18px; margin: 16px 0 24px 0; font-size: 14px;
                color: #333; }
        .footer { margin-top: 44px; font-size: 12px; color: #888;
                  font-style: italic; font-family: Arial, sans-serif;
                  border-top: 1px solid #e0e0e0; padding-top: 18px; }
        .footer a { color: #888; }
    </style>
</head>
<body>
    <div class="preheader">__PREHEADER__</div>
    <div class="container">

        <p>Hi __USERNAME__,</p>

        <div class="badge">7-Day Free Trial</div>
        <h1>Your free trial is one click away.</h1>

        <p>The Mambo Guild went live yesterday. Your waitlist seat is still reserved.</p>

        <div class="cta-wrap">
            <a href="__MAGIC_LINK__" class="cta">Activate my 7-day free trial</a>
            <div class="cta-sub">Card required to open the trial. <strong style="color:#444;">Nothing is charged for 7 days.</strong> Cancel in 2 clicks, anytime.</div>
        </div>

        <h2>What is waiting for you inside</h2>
        <ul>
            <li><strong>The Vault.</strong> 500+ classes across Mambo, Pachanga, History of Salsa, and Effective Training Science. Every angle, every speed, frame-by-frame, A/B loop, captions in 16 languages.</li>
            <li><strong>The Skill Tree.</strong> A clear path from your first basic step to advanced choreo. No more guessing what to study next.</li>
            <li><strong>The Stage.</strong> Post your dance videos, get feedback from the community and from me directly.</li>
        </ul>

        <div class="scarcity">
            <strong>Founder Diamond, 5 days left.</strong> The badge is gated on starting a trial before <strong>May 6, 18:00 UTC</strong>. After the cap or the deadline, whichever comes first, it is gone for good. There is no second window.
        </div>

        <div class="lock">
            <strong>Founder pricing, locked in.</strong> Founders lock in <strong>$39/month for the lifetime of their subscription</strong>. The public price will only go up from here. Stay a Founder, never see an increase.
        </div>

        <h2>About the trial</h2>
        <ul>
            <li><strong>Card required to start the trial.</strong> Stripe needs a payment method on file to open it. Nothing is charged on day 0, and nothing is charged at all if you cancel before day 8.</li>
            <li>Full access to everything inside during the trial.</li>
            <li>$39/month after the trial, locked in for life as a Founder.</li>
            <li><strong>Cancel in 2 clicks</strong> from your account. No phone call, no form, no human in the way.</li>
        </ul>

        <div class="cta-wrap">
            <a href="__MAGIC_LINK__" class="cta">Activate my 7-day free trial</a>
            <div class="cta-sub">Founder Diamond closes May 6, 18:00 UTC</div>
        </div>

        <p style="margin-top: 32px;">See you inside.</p>

        <p>Pavle<br>
        Founder, The Mambo Guild</p>

        <div class="footer">
            <p>If the activation link expires before you click, you can request a fresh one at <a href="__FORGOT_URL__">themamboguild.com/forgot-password</a> using this email address.</p>
            <p>You are receiving this because you joined the waitlist for The Mambo Guild.</p>
            <p style="font-size: 11px;"><a href="mailto:pavlepopovic@themamboguild.com?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20mailing%20list.">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
"""
    return (
        html
        .replace("__USERNAME__", username)
        .replace("__MAGIC_LINK__", magic_link)
        .replace("__FORGOT_URL__", FORGOT_PASSWORD_URL)
        .replace("__PREHEADER__", PREHEADER)
    )


def get_text(username: str, magic_link: str) -> str:
    """Plain-text fallback. Same content, no HTML. Critical for spam scoring
    (text/html parity) and for accessibility / text-only mail clients."""
    return f"""Hi {username},

The Mambo Guild went live yesterday. Your waitlist seat is still reserved.

ACTIVATE MY 7-DAY FREE TRIAL
{magic_link}

Card required to open the trial. Nothing is charged for 7 days. Cancel in 2 clicks, anytime.


WHAT IS WAITING FOR YOU INSIDE
------------------------------
- The Vault: 500+ classes across Mambo, Pachanga, History of Salsa, and Effective Training Science. Every angle, every speed, frame-by-frame, A/B loop, captions in 16 languages.
- The Skill Tree: a clear path from your first basic step to advanced choreo. No more guessing what to study next.
- The Stage: post your dance videos, get feedback from the community and from me directly.


FOUNDER DIAMOND, 5 DAYS LEFT
----------------------------
The badge is gated on starting a trial before May 6, 18:00 UTC. After the cap or the deadline, whichever comes first, it is gone for good. There is no second window.


FOUNDER PRICING, LOCKED IN
--------------------------
Founders lock in $39/month for the lifetime of their subscription. The public price will only go up from here. Stay a Founder, never see an increase.


ABOUT THE TRIAL
---------------
- Card required to start the trial. Stripe needs a payment method on file to open it. Nothing is charged on day 0, and nothing is charged at all if you cancel before day 8.
- Full access to everything inside during the trial.
- $39/month after the trial, locked in for life as a Founder.
- Cancel in 2 clicks from your account. No phone call, no form, no human in the way.


ACTIVATE MY 7-DAY FREE TRIAL
{magic_link}

Founder Diamond closes May 6, 18:00 UTC.

See you inside.

Pavle
Founder, The Mambo Guild

---
If the activation link expires before you click, you can request a fresh one at {FORGOT_PASSWORD_URL} using this email address.

You are receiving this because you joined the waitlist for The Mambo Guild.
To unsubscribe, reply with "Unsubscribe" in the subject line.
"""


# ---------------------------------------------------------------------------
# DB pull + sender
# ---------------------------------------------------------------------------

def _build_magic_link(user_id: str) -> str:
    """Generate a per-user signed token and build the /reset-password URL.
    Uses the same salt as send_password_reset_email so the existing
    /api/auth/reset-password endpoint validates it without backend changes."""
    token = _SERIALIZER.dumps(str(user_id), salt="password-reset")
    return f"{FRONTEND_URL}/reset-password?token={token}"


def _load_waitlisters(only_emails: set = None):
    """Pull every waitlister directly from the prod DB. We use the live DB
    rather than a JSON snapshot because the JSON can be days old by
    launch day; getting last-minute waitlist signups too is the whole
    point of this broadcast.

    If `only_emails` is non-empty, the auth_provider='waitlist' safety
    filter is REPLACED by an explicit email-list filter. This makes
    --only useful for sending tests to your own admin / paying account
    (which is by definition NOT in the waitlist bucket). The wide-blast
    filter still applies on a normal --apply with no --only."""
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
            # Day-2 broadcast: skip waitlisters who have already converted
            # (status=active or trialing). Anyone with no subscription row
            # OR with status in (incomplete, canceled, past_due) is still
            # a target — INCOMPLETE in particular flags people who reached
            # checkout but bounced at the card screen, the highest-intent
            # segment to nudge.
            rows = conn.execute(text("""
                SELECT u.id, u.email, up.username
                FROM users u
                JOIN user_profiles up ON up.user_id = u.id
                LEFT JOIN subscriptions s ON s.user_id = u.id
                WHERE u.auth_provider = 'waitlist'
                  AND u.email IS NOT NULL
                  AND u.email <> ''
                  AND (s.status IS NULL OR s.status NOT IN ('active', 'trialing'))
                ORDER BY u.created_at NULLS LAST
            """)).all()
    return [
        {"id": str(r.id), "email": r.email, "username": r.username or "Dancer"}
        for r in rows
    ]


def _should_skip(email: str):
    """Return a reason string if this email should be skipped, else None."""
    e = email.lower().strip()
    if e in SKIP_EMAILS:
        return "skip-list"
    domain = e.rsplit("@", 1)[-1] if "@" in e else ""
    if domain in SKIP_DOMAINS:
        return f"skip-domain ({domain})"
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true",
                        help="Actually send. Default is dry-run.")
    parser.add_argument("--limit", type=int, default=0,
                        help="Cap at N sends (0 = no cap).")
    parser.add_argument("--only", default="",
                        help="Comma-separated email list — only send to these (testing).")
    parser.add_argument("--sleep-ms", type=int, default=600,
                        help="Throttle between sends (default 600ms = ~100/min, "
                             "well under Resend's free-tier 100/sec ceiling).")
    args = parser.parse_args()

    print(f"From:        {FROM_EMAIL}")
    print(f"Subject:     {SUBJECT}")
    print(f"Frontend:    {FRONTEND_URL}")
    print(f"Mode:        {'APPLY' if args.apply else 'DRY-RUN'}")
    if args.limit:
        print(f"Limit:       {args.limit}")
    if args.only:
        print(f"Only:        {args.only}")
    print()

    # Sanity: token-TTL warning. The /reset-password endpoint validates
    # tokens against settings.PASSWORD_RESET_EXPIRE_MINUTES * 60 seconds.
    # If that's still 60 (default), every magic link expires in an hour
    # and most recipients won't click in time. Emit a loud warning so the
    # operator catches this BEFORE blasting 1k emails.
    ttl_min = settings.PASSWORD_RESET_EXPIRE_MINUTES
    if ttl_min < 1440:
        print(f"WARNING: PASSWORD_RESET_EXPIRE_MINUTES = {ttl_min} min "
              f"({ttl_min // 60}h). For a launch broadcast you almost "
              f"certainly want 10080 (7 days). Set it on Railway and "
              f"redeploy BEFORE running --apply, or magic links will "
              f"expire before recipients click.")
        print()

    if args.apply and not resend.api_key:
        print("Error: RESEND_API_KEY env var not set.")
        sys.exit(1)

    only_set = {e.strip().lower() for e in args.only.split(",") if e.strip()}
    users = _load_waitlisters(only_emails=only_set if only_set else None)
    if only_set:
        print(f"--only override active: loaded {len(users)} matching user(s) "
              f"regardless of auth_provider")
    else:
        print(f"Waitlisters in DB: {len(users)}")

    already_sent = set()
    if os.path.exists(ALREADY_SENT_FILE):
        with open(ALREADY_SENT_FILE, "r", encoding="utf-8") as f:
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
        html = get_html(user["username"], magic_link)
        text_body = get_text(user["username"], magic_link)

        if not args.apply:
            print(f"  [DRY] would send to {email}  (link: {magic_link[:60]}...)")
            sent += 1
            continue

        try:
            resend.Emails.send({
                "from": FROM_EMAIL,
                "to": [email],
                "subject": SUBJECT,
                "html": html,
                "text": text_body,
            })
            print(f"  SENT  {email}")
            sent += 1
            try:
                with open(ALREADY_SENT_FILE, "a", encoding="utf-8") as asf:
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
