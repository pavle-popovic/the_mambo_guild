"""
Launch-week announcement broadcast.

Reads backend/scripts/waitlist_users.json, skips unsubscribed / test /
fake / disposable addresses (SKIP_EMAILS), and supports mid-run resume
via already_sent_launch.txt.
"""
import json
import os
import time
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env')
    load_dotenv(env_path)
except ImportError:
    print("Warning: python-dotenv not installed. Env vars must be set manually.")

try:
    import resend
except ImportError:
    print("Error: 'resend' not installed. pip install resend")
    sys.exit(1)

# ---------------- CONFIGURATION ----------------
resend.api_key = os.environ.get("RESEND_API_KEY")

raw_from = os.environ.get("FROM_EMAIL", "pavlepopovic@themamboguild.com")
if "<" not in raw_from:
    FROM_EMAIL = f"The Mambo Guild <{raw_from}>"
else:
    FROM_EMAIL = raw_from

# Hardcode www. canonical origin: some email clients (Outlook/Hotmail image proxy)
# don't follow the apex->www redirect, which breaks image rendering.
ASSETS_BASE = "https://www.themamboguild.com/assets"

SUBJECT = "Weekend choreo: Bruno Mars Cha Cha Cha"

# Set True to preview without sending.
DRY_RUN = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "waitlist_users.json")
ALREADY_SENT_FILE = os.path.join(SCRIPT_DIR, "already_sent_launch.txt")

# Unsubscribed + test/fake/disposable addresses.
# Mirrors the list in broadcast_waitlist.py.
SKIP_EMAILS = {
    # Unsubscribed
    "danielenapoletano92@gmail.com",
    "malzev1@gmail.com",
    "lucy.arellano97@gmail.com",
    "alicia.adamfe@gmail.com",
    "tine.heggernes@gmail.com",
    "lancekaplan@gmail.com",
    "nycoach@ymail.com",
    "karlasutlovic@yahoo.com",
    # Obvious test accounts
    "qffgqg@ebhtbt.com",
    "test@gmail.com",
    "test@hotmail.com",
    "test3@hotmail.com",
    "test4@gmail.com",
    # Disposable/fake domains
    "yahamo2849@cimario.com",
    "viwakit677@codgal.com",
    "lawhitney.lagasse@inboxorigin.com",
    # allfreemail.net — all disposable
    "nocholas.bradbury@allfreemail.net",
    "marsp557@allfreemail.net",
    "kimblery.eastburn@allfreemail.net",
    "carlean.nailor@allfreemail.net",
    "rahshon.wingate@allfreemail.net",
    "alanda.fullington@allfreemail.net",
    "merlee.appell@allfreemail.net",
    "clorissa.vrieze@allfreemail.net",
    "margeree.christ@allfreemail.net",
    "hance.hunkins@allfreemail.net",
    "ector.ocheltree@allfreemail.net",
    "dezra.schauer@allfreemail.net",
    "merrilie.arrant@allfreemail.net",
    "normalee.kirkley@allfreemail.net",
    "hiroto.shiflett@allfreemail.net",
    "timnesha.mulholland@allfreemail.net",
    "eray.ornelas@allfreemail.net",
    "nazavier.jaques@allfreemail.net",
    "faron.zabel@allfreemail.net",
    "riad.garces@allfreemail.net",
    "sundai.berthold@allfreemail.net",
    "tashae.ferranti@allfreemail.net",
    "vonda.casebolt@allfreemail.net",
    "paij.huneycutt@allfreemail.net",
    "melvene.chagnon@allfreemail.net",
    # Typo'd domains — will bounce
    "daniel.guzman3300@gmail.comd",
    "wtd2101@me.cim",
    "kisslaccer@gmail.co",
    # duoley.com bot cluster
    "yewape6701@duoley.com",
    "yewap26701@duoley.com",
    "yeaape6701@duoley.com",
    "yeaapesu6701@duoley.com",
    "yaape6701@duoley.com",
}
# -----------------------------------------------


def get_launch_html(username: str) -> str:
    html = """<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Georgia, 'Times New Roman', Times, serif;
            background-color: #F9F7F1;
            color: #333333;
            margin: 0;
            padding: 0;
            line-height: 1.8;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #F9F7F1;
        }
        .badge {
            display: inline-block;
            background-color: #D4AF37;
            color: #000;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 6px 14px;
            border-radius: 2px;
            margin-bottom: 24px;
            font-family: Arial, sans-serif;
        }
        h1 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 34px;
            color: #111;
            margin: 0 0 8px 0;
            line-height: 1.2;
        }
        .tagline {
            font-size: 16px;
            color: #666;
            font-style: italic;
            margin-bottom: 32px;
        }
        h2 {
            font-family: Georgia, 'Times New Roman', serif;
            color: #111;
            font-size: 22px;
            margin-top: 40px;
            margin-bottom: 12px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
        }
        p, li {
            font-size: 16px;
            margin-bottom: 18px;
        }
        strong { color: #000; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; line-height: 1.6; }
        .feature-img {
            width: 100%;
            max-width: 560px;
            height: auto;
            display: block;
            margin: 18px auto;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
        }
        .link { color: #b5952f; text-decoration: underline; }
        .emoji { font-style: normal; }
        .deadline-box {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-left: 4px solid #D4AF37;
            padding: 16px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .deadline-box p { margin: 0; }
        .bonus-callout {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-left: 4px solid #D4AF37;
            padding: 24px 24px 20px;
            margin: 24px 0 40px;
            border-radius: 4px;
        }
        .bonus-callout h3 {
            font-family: Georgia, 'Times New Roman', serif;
            color: #111;
            font-size: 24px;
            margin: 10px 0 12px 0;
            line-height: 1.3;
        }
        .bonus-callout p { margin-bottom: 12px; }
        .footer {
            margin-top: 50px;
            font-size: 13px;
            color: #888;
            font-style: italic;
            font-family: Arial, sans-serif;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>Hi __USERNAME__,</p>

        <div class="badge">New Choreo</div>
        <h1><span class="emoji">🎶</span> Bruno Mars Cha Cha Cha</h1>
        <p class="tagline">An intermediate cha cha cha routine to a beloved Bruno Mars banger.</p>

        <p>A little weekend bonus before the Guild doors open. I put together an intermediate cha cha cha to a song you already know. Bruno Mars doing what Bruno Mars does best. Film it, post it, tag me.</p>

        <p><a href="https://www.youtube.com/watch?v=c-01Oo_Pzso" class="link"><strong>Watch the choreo &rarr;</strong></a></p>

        <h2><span class="emoji">⏳</span> Last Chance: The Launch Challenges</h2>
        <p>Before the doors open, I'm giving away <strong>lifetime access</strong> to the Guild. Two challenges, one winner each. Deadline is <strong>April 26th</strong>. Only days left.</p>

        <div class="deadline-box">
            <p><strong>🌱 Beginner Challenge: Mambo Inn</strong><br>
            For dancers with less than 2 years of salsa. Learn the choreo, film yourself, tag me on Instagram.<br>
            <a href="https://www.youtube.com/watch?v=ticP-zMdeUk" class="link">Watch the Mambo Inn choreo</a></p>
        </div>

        <div class="deadline-box">
            <p><strong>🏆 Open Challenge: Mambo Gozón</strong><br>
            For experienced dancers. Same prize, same rules, harder choreo (starts at 13:47).<br>
            <a href="https://www.youtube.com/watch?v=omiwxSIxnyc" class="link">Watch the Mambo Gozón choreo</a></p>
        </div>

        <p>Film a Reel or a Story (if Story, DM me the raw video so it doesn't disappear). Tag me. That's it.</p>

        <h2><span class="emoji">🎁</span> Your 8 Exclusive Free Choreographies</h2>
        <p>While you wait for launch day, here are the eight classes I've dropped for this list. Save them, dance them, use them to warm up.</p>
        <ul>
            <li>Salsa Bodymovement Musicality (La Gripe): <a href="https://www.youtube.com/watch?v=Ol54zPvVpx0" class="link">watch</a></li>
            <li>14 Salsa Moves Ep. 1: <a href="https://www.youtube.com/watch?v=5u_56JspFX8" class="link">watch</a></li>
            <li>14 Salsa Moves Ep. 2: <a href="https://www.youtube.com/watch?v=-Y4By7n2KCQ" class="link">watch</a></li>
            <li>Pachanga Fundamentals: <a href="https://www.youtube.com/watch?v=A12yU-b2O_s" class="link">watch</a></li>
            <li>Pachanga Module 11 (The Kick Tap Chuck): <a href="https://www.youtube.com/watch?v=ER1CMXeoAao" class="link">watch</a></li>
            <li>Rankankan Choreography: <a href="https://www.youtube.com/watch?v=57-zwVE1VXI" class="link">watch</a></li>
            <li>Salsa Romantica: <a href="https://www.youtube.com/watch?v=wcDocNANEVY" class="link">watch</a></li>
            <li>Afro Mambo Fusion: <a href="https://www.youtube.com/watch?v=RIMp6J02Th0" class="link">watch</a></li>
        </ul>

        <hr style="border:none;border-top:1px solid #e0e0e0;margin:50px 0 40px;" />

        <div class="badge">Launch Week</div>
        <h1>The Guild opens Wednesday, April 29.</h1>
        <p class="tagline">After three months of building, The Mambo Guild goes live next Wednesday.</p>

        <p>You've been on this list since the start, and I wanted you to be the first to hear it: <strong>The Mambo Guild launches Wednesday, April 29th.</strong></p>

        <p>Everything I've been teasing, the courses, the skill tree, the community, all of it is ready. Here's a quick tour of what you're about to step into.</p>

        <h2><span class="emoji">📚</span> The Vault</h2>
        <p><em>Your arsenal of dance mastery.</em></p>
        <ul>
            <li>500+ lessons, from your first basic step to pro-level mechanics</li>
            <li>Three full Mambo courses and a complete Pachanga course</li>
            <li>A full course on Salsa History and a full course on Effective Training Science</li>
            <li>Bi-weekly choreographies and new courses, with expert guest teachers</li>
        </ul>
        <img src="__ASSETS__/Course_page.png" alt="The Vault" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

        <h2><span class="emoji">🌳</span> The RPG of Dance</h2>
        <p>Visualize your growth from Basic Steps to Boss Level. Every lesson unlocks a new node on your skill tree. Track your progress like a true gamer.</p>
        <img src="__ASSETS__/skill-tree.png" alt="Skill tree" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

        <h2><span class="emoji">🏆</span> The Stage</h2>
        <p>Compete, collaborate, and get feedback from real pros. Climb the High Rollers leaderboard and earn legendary badges.</p>
        <img src="__ASSETS__/community-ui.png" alt="The Stage" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

        <p>Doors open Wednesday, April 29. Keep an eye on your inbox.</p>

        <p>Pavle<br>
        Founder, The Mambo Guild</p>

        <div class="footer">
            <p>You're receiving this because you joined the waitlist for The Mambo Guild.</p>
            <p style="font-size: 11px;">If you no longer wish to receive these emails, <a href="mailto:pavlepopovic@themamboguild.com?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20mailing%20list." style="color: #999;">click here to unsubscribe</a>.</p>
        </div>
    </div>
</body>
</html>
"""
    return html.replace("__USERNAME__", username).replace("__ASSETS__", ASSETS_BASE)


def send_broadcast():
    if not resend.api_key and not DRY_RUN:
        print("Error: RESEND_API_KEY env var not set.")
        return

    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found. Run pull_waitlist_users.py first.")
        return

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        users = json.load(f)

    already_sent = set()
    if os.path.exists(ALREADY_SENT_FILE):
        with open(ALREADY_SENT_FILE, "r", encoding="utf-8") as f:
            already_sent = {line.strip().lower() for line in f if line.strip()}
        print(f"Resume mode: {len(already_sent)} already sent — will skip.")

    skip_lower = {e.lower() for e in SKIP_EMAILS}

    print(f"Loaded {len(users)} users from JSON")
    print(f"Skip-list: {len(skip_lower)} addresses")
    print(f"Mode: {'DRY RUN' if DRY_RUN else 'LIVE'}")
    print(f"Subject: {SUBJECT}")
    print(f"From: {FROM_EMAIL}")
    print("-" * 40)

    sent = 0
    failed = 0
    skipped_unsub = 0
    skipped_resume = 0

    for user in users:
        email = (user.get("email") or "").strip()
        if not email:
            continue
        email_lc = email.lower()
        username = user.get("username") or "Dancer"

        if email_lc in skip_lower:
            skipped_unsub += 1
            continue
        if email_lc in already_sent:
            skipped_resume += 1
            continue

        html = get_launch_html(username)

        if DRY_RUN:
            print(f"  [DRY RUN] would send to {email}")
            continue

        try:
            resend.Emails.send({
                "from": FROM_EMAIL,
                "to": [email],
                "subject": SUBJECT,
                "html": html,
            })
            print(f"Sent to {email}")
            sent += 1
            try:
                with open(ALREADY_SENT_FILE, "a", encoding="utf-8") as asf:
                    asf.write(email + "\n")
            except Exception:
                pass
            time.sleep(1.0)  # Gentle on the Resend API
        except Exception as e:
            print(f"FAILED {email}: {e}")
            failed += 1

    print("-" * 40)
    print(f"Done. Sent: {sent}  Failed: {failed}  Skipped-unsub: {skipped_unsub}  Skipped-resume: {skipped_resume}")


if __name__ == "__main__":
    send_broadcast()
