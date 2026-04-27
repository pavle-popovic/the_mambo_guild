"""
Email 1 of 8 - The Tease
Send date: April 27, 2026

Reads waitlist_users.json, skips unsubscribed / test / disposable addresses,
supports mid-run resume via already_sent_email01.txt.
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

SUBJECT = "48 hours. Wednesday 6pm GMT. The Guild opens."

ASSETS_BASE = "https://www.themamboguild.com/assets/howitworks"

DRY_RUN = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "waitlist_users.json")
ALREADY_SENT_FILE = os.path.join(SCRIPT_DIR, "already_sent_email01.txt")

SKIP_EMAILS = {
    "danielenapoletano92@gmail.com",
    "malzev1@gmail.com",
    "lucy.arellano97@gmail.com",
    "alicia.adamfe@gmail.com",
    "tine.heggernes@gmail.com",
    "lancekaplan@gmail.com",
    "nycoach@ymail.com",
    "karlasutlovic@yahoo.com",
    "almansyahluthfi@gmail.com",
    "qffgqg@ebhtbt.com",
    "test@gmail.com",
    "test@hotmail.com",
    "test3@hotmail.com",
    "test4@gmail.com",
    "yahamo2849@cimario.com",
    "viwakit677@codgal.com",
    "lawhitney.lagasse@inboxorigin.com",
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
    "daniel.guzman3300@gmail.comd",
    "wtd2101@me.cim",
    "kisslaccer@gmail.co",
    "yewape6701@duoley.com",
    "yewap26701@duoley.com",
    "yeaape6701@duoley.com",
    "yeaapesu6701@duoley.com",
    "yaape6701@duoley.com",
    # More allfreemail.net bots
    "mareya.eddington@allfreemail.net",
    "killiam.slaugh@allfreemail.net",
    "sophina.windholz@allfreemail.net",
    "ezri.hoak@allfreemail.net",
    "mchenry.durrett@allfreemail.net",
    "jacobalexander.liss@allfreemail.net",
    "shlonda.gilliard@allfreemail.net",
    "mamcg3448@allfreemail.net",
    "josejr.whitcher@allfreemail.net",
    "ivani.cripe@allfreemail.net",
    "jemere.fulton@allfreemail.net",
    "yamilett.weldon@allfreemail.net",
    "tykisha.gillum@allfreemail.net",
    "corenthia.jordahl@allfreemail.net",
    "vuthy.shetler@allfreemail.net",
    "nychole.everett@allfreemail.net",
    "driston.mcclerkin@allfreemail.net",
    "jereal.kerby@allfreemail.net",
    "rakyia.rambo@allfreemail.net",
    "abednego.pharris@allfreemail.net",
    "napua.mackley@allfreemail.net",
    "ijanae.trimmer@allfreemail.net",
    "bitanya.rhinehart@allfreemail.net",
}
# -----------------------------------------------


def get_html(username: str) -> str:
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
            font-size: 30px;
            color: #111;
            margin: 0 0 6px 0;
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
            font-size: 20px;
            margin-top: 40px;
            margin-bottom: 6px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 8px;
        }
        p {
            font-size: 15px;
            margin-bottom: 12px;
            color: #444;
        }
        ul {
            padding-left: 20px;
            margin: 0 0 16px 0;
        }
        li {
            font-size: 14px;
            margin-bottom: 5px;
            line-height: 1.6;
            color: #333;
        }
        strong { color: #000; }
        .img-caption {
            display: inline-block;
            font-size: 10px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            letter-spacing: 0.2em;
            background-color: #D4AF37;
            color: #000;
            padding: 3px 10px;
            border-radius: 20px;
            margin-bottom: 4px;
        }
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

        <div class="badge">48 Hours</div>
        <h1>The Mambo Guild opens Wednesday at 6pm GMT.</h1>
        <p class="tagline">Not another video dump. Everything below is included, day one.</p>

        <p>You've been on this waitlist for a while. If you enjoyed the free classes, you are going to love what's waiting on the other side.</p>


        <!-- PILLAR 1: Courses -->
        <h2>A full dance school. Day one.</h2>
        <p>Courses, choreographies, history of salsa, science of training. No drip-feed. No upsell.</p>
        <ul>
            <li>500+ classes, beginner to pro</li>
            <li>Full choreographies, broken down</li>
            <li>History of Salsa - 20 modules</li>
            <li>Science of Training - 18 modules</li>
            <li>Technique, styling, musicality</li>
        </ul>
        <img src="__ASSETS__/Image1Courses.png" alt="Course catalog" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:16px auto 32px;border:1px solid #e0e0e0;border-radius:6px;" />


        <!-- PILLAR 2: Video Player -->
        <h2>The practice room pros have been waiting for</h2>
        <p>Every angle. Every speed. 16 languages.</p>
        <ul>
            <li>Mirrored view - zero guessing</li>
            <li>Back view - live-class vibe</li>
            <li>16 languages (captions)</li>
            <li>0.25x to 2x speed + frame-by-frame</li>
            <li>A/B loop</li>
            <li>Summary notes + quizzes</li>
            <li>Course nav inside the player</li>
        </ul>
        <span class="img-caption">MIRRORED VIEW</span>
        <img src="__ASSETS__/Image2VideoPlayerMirrored.png" alt="Mirrored view" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:6px auto 12px;border:1px solid #e0e0e0;border-radius:6px;" />
        <span class="img-caption">BACK VIEW</span>
        <img src="__ASSETS__/Image3VideoPlayerBackview.png" alt="Back view" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:6px auto 32px;border:1px solid #e0e0e0;border-radius:6px;" />


        <!-- PILLAR 3: Skill Tree -->
        <h2>Structured from basic to pro</h2>
        <p>A tech tree for your dancing. Every skill in the right order. You always know what to drill next.</p>
        <ul>
            <li>First step to pro choreo</li>
            <li>Technique-by-technique, prerequisites enforced</li>
            <li>Unlocks as you level up</li>
            <li>Never guess what's next</li>
        </ul>
        <img src="__ASSETS__/Image4SkillTree.png" alt="Skill tree" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:16px auto 32px;border:1px solid #e0e0e0;border-radius:6px;" />


        <!-- PILLAR 4: Community -->
        <h2>Post your videos. Don't dance alone.</h2>
        <p>Post videos. Ask questions. Earn claves. Spend them in the Guild Shop.</p>
        <ul>
            <li>The Stage: post progress videos, +40 claves</li>
            <li>The Lab: ask and answer questions, +12 claves</li>
            <li>Hype or Coach feedback</li>
            <li>38 badges, Bronze to Diamond</li>
            <li>Weekly and all-time leaderboards</li>
        </ul>
        <span class="img-caption">THE FEED</span>
        <img src="__ASSETS__/Image5Community.png" alt="Community feed" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:6px auto 12px;border:1px solid #e0e0e0;border-radius:6px;" />
        <span class="img-caption">YOUR PROFILE</span>
        <img src="__ASSETS__/Image7ProfileShowcase.png" alt="Profile page" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:6px auto 32px;border:1px solid #e0e0e0;border-radius:6px;" />


        <!-- PILLAR 5: VIP -->
        <div class="eyebrow">VIP - 1-TO-1 COACHING &amp; PRIVATE GROUP</div>
        <h2>Train directly with the Maestro</h2>
        <p>1-on-1 coaching and Roundtable Zoom calls (minimum 2 per month). Private group. No crowd.</p>
        <ul>
            <li>Monthly 1-on-1 video coaching</li>
            <li>Roundtable Zoom calls (minimum 2 per month)</li>
            <li>DJ Booth - isolated stems</li>
            <li>The Vault - every past recording</li>
        </ul>
        <img src="__ASSETS__/Image6Vip1to1Coaching.png" alt="VIP coaching" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:16px auto 32px;border:1px solid #e0e0e0;border-radius:6px;" />


        <p>Wednesday. 6pm GMT. See you there.</p>

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


def get_text(username: str) -> str:
    return f"""Hi {username},

The Mambo Guild opens Wednesday at 6pm GMT.

Not another video dump. Everything below is included, day one.

If you enjoyed the free classes, you are going to love what's waiting on the other side.


COURSES & CONTENT
-----------------
A full dance school. Day one.
Courses, choreographies, history of salsa, science of training. No drip-feed. No upsell.
- 500+ classes, beginner to pro
- Full choreographies, broken down
- History of Salsa - 20 modules
- Science of Training - 18 modules
- Technique, styling, musicality


THE VIDEO PLAYER
----------------
The practice room pros have been waiting for.
Every angle. Every speed. 16 languages.
- Mirrored view - zero guessing
- Back view - live-class vibe
- 16 languages (captions)
- 0.25x to 2x speed + frame-by-frame
- A/B loop
- Summary notes + quizzes
- Course nav inside the player


THE SKILL TREE
--------------
Structured from basic to pro.
A tech tree for your dancing. Every skill in the right order. You always know what to drill next.
- First step to pro choreo
- Technique-by-technique, prerequisites enforced
- Unlocks as you level up
- Never guess what's next


THE COMMUNITY
-------------
Post your videos. Don't dance alone.
Post videos. Ask questions. Earn claves. Spend them in the Guild Shop.
- The Stage: post progress videos, +40 claves
- The Lab: ask and answer questions, +12 claves
- Hype or Coach feedback
- 38 badges, Bronze to Diamond
- Weekly and all-time leaderboards


VIP - 1-TO-1 COACHING & PRIVATE GROUP
--------------------------------------
Train directly with the Maestro.
1-on-1 coaching and Roundtable Zoom calls (minimum 2 per month). Private group. No crowd.
- Monthly 1-on-1 video coaching
- Roundtable Zoom calls (minimum 2 per month)
- DJ Booth - isolated stems
- The Vault - every past recording


Wednesday. 6pm GMT. See you there.

Pavle
Founder, The Mambo Guild

---
You're receiving this because you joined the waitlist for The Mambo Guild.
To unsubscribe, reply with "Unsubscribe" in the subject line.
"""
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
        .link { color: #b5952f; text-decoration: underline; }
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

        <div class="badge">48 Hours</div>
        <h1>The Mambo Guild opens Wednesday at 6pm GMT.</h1>
        <p class="tagline">If you enjoyed the free classes, you are going to love what's inside.</p>

        <p>You've been on this waitlist for a while. I've been dropping free choreos, free classes, free content. That was the appetizer.</p>

        <p>Wednesday is the full thing. Here's what you're stepping into.</p>

        <h2>The Vault</h2>
        <p>500+ lessons. Three full Mambo courses, a complete Pachanga course, a full course on Salsa History, and a full course on Effective Training Science. New choreographies and guest teachers added every two weeks.</p>
        <img src="__ASSETS__/Course_page.png" alt="The Vault" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

        <h2>The Skill Tree</h2>
        <p>Every lesson you complete unlocks a node on your personal skill tree. You can see exactly where you are, what you've mastered, and what's next. From Basic Steps to Boss Level.</p>
        <img src="__ASSETS__/skill-tree.png" alt="Skill Tree" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

        <h2>Coaching and Community</h2>
        <p>Submit a video of your dancing and get personal feedback from the Guild Master. Join the community, climb the leaderboard, earn badges. There's a live weekly roundtable every Wednesday.</p>
        <img src="__ASSETS__/community-ui.png" alt="Community" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

        <p>Wednesday. 6pm GMT. Keep an eye on your inbox.</p>

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


def get_text(username: str) -> str:
    return f"""Hi {username},

The Mambo Guild opens Wednesday at 6pm GMT.

You've been on this waitlist for a while. I've been dropping free choreos, free classes, free content. That was the appetizer.

Wednesday is the full thing. Here's what you're stepping into.


THE VAULT
---------
500+ lessons. Three full Mambo courses, a complete Pachanga course, a full course on Salsa History, and a full course on Effective Training Science. New choreographies and guest teachers added every two weeks.


THE SKILL TREE
--------------
Every lesson you complete unlocks a node on your personal skill tree. You can see exactly where you are, what you've mastered, and what's next. From Basic Steps to Boss Level.


COACHING AND COMMUNITY
----------------------
Submit a video of your dancing and get personal feedback from the Guild Master. Join the community, climb the leaderboard, earn badges. There's a live weekly roundtable every Wednesday.


Wednesday. 6pm GMT. Keep an eye on your inbox.

Pavle
Founder, The Mambo Guild

---
You're receiving this because you joined the waitlist for The Mambo Guild.
To unsubscribe, reply with "Unsubscribe" in the subject line.
"""


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
        print(f"Resume mode: {len(already_sent)} already sent - will skip.")

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

        html = get_html(username)
        text = get_text(username)

        if DRY_RUN:
            print(f"  [DRY RUN] would send to {email}")
            continue

        try:
            resend.Emails.send({
                "from": FROM_EMAIL,
                "to": [email],
                "subject": SUBJECT,
                "html": html,
                "text": text,
            })
            print(f"Sent to {email}")
            sent += 1
            try:
                with open(ALREADY_SENT_FILE, "a", encoding="utf-8") as asf:
                    asf.write(email + "\n")
            except Exception:
                pass
            time.sleep(1.0)
        except Exception as e:
            print(f"FAILED {email}: {e}")
            failed += 1

    print("-" * 40)
    print(f"Done. Sent: {sent}  Failed: {failed}  Skipped-unsub: {skipped_unsub}  Skipped-resume: {skipped_resume}")


if __name__ == "__main__":
    send_broadcast()
