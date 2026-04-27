"""
Email 7 of 8 - Final Cutoff
Send date: May 6, 2026

Absolute last chance. Plain text feel. Brutally short.
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

SUBJECT = "Tonight at midnight - that's it for the Founder Badge"

DRY_RUN = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "waitlist_users.json")
ALREADY_SENT_FILE = os.path.join(SCRIPT_DIR, "already_sent_email07.txt")

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
        p {
            font-size: 16px;
            margin-bottom: 18px;
        }
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
        <p>__USERNAME__,</p>

        <p>Tonight at midnight, the Founder Badge closes.</p>

        <p>I won't send another email about it after this.</p>

        <p>If you want it, and to try The Mambo Guild for free, the link is below.</p>

        <p><a href="https://www.themamboguild.com" class="link"><strong>Claim it now - free trial, no card required &rarr;</strong></a></p>

        <p>Whatever you decide: thank you for being on this list. Building this has been a long project, and the fact that you signed up matters.</p>

        <p>Keep dancing,<br>
        Pavle</p>

        <div class="footer">
            <p>You're receiving this because you joined the waitlist for The Mambo Guild.</p>
            <p style="font-size: 11px;">If you no longer wish to receive these emails, <a href="mailto:pavlepopovic@themamboguild.com?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20mailing%20list." style="color: #999;">click here to unsubscribe</a>.</p>
        </div>
    </div>
</body>
</html>
"""
    return html.replace("__USERNAME__", username)


def get_text(username: str) -> str:
    return f"""{username},

Tonight at midnight, the Founder Badge closes.

I won't send another email about it after this.

If you want it, and to try The Mambo Guild for free, the link is below.

https://www.themamboguild.com

Whatever you decide: thank you for being on this list. Building this has been a long project, and the fact that you signed up matters.

Keep dancing,
Pavle

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
