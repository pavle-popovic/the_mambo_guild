import json
import os
import time
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load from project root .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env')
    load_dotenv(env_path)
except ImportError:
    print("⚠️ Warning: 'python-dotenv' not installed. Environment variables must be set manually.")

# Try to import resend, handle if missing
try:
    import resend
except ImportError:
    print("❌ Error: 'resend' package not found. Please install it using: pip install resend")
    sys.exit(1)

# ---------------- CONFIGURATION ----------------
# 1. Make sure your JSON file is named 'waitlist_users.json' and is in the same folder.
#    We look for the file in the same directory as this script.
script_dir = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(script_dir, 'waitlist_users.json')

# 2. Resend API Key
#    Try to get from environment, otherwise you can hardcode it here (not recommended for git).
resend.api_key = os.environ.get("RESEND_API_KEY")

# 3. DRY RUN MODE: Set to True to test without actually sending emails.
#    Set to False when you are ready to blast.
DRY_RUN = False 

# 4. Email Configuration
raw_from = os.environ.get("FROM_EMAIL", "pavlepopovic@themamboguild.com")
if "<" not in raw_from:
    FROM_EMAIL = f"The Mambo Guild <{raw_from}>"
else:
    FROM_EMAIL = raw_from
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://themamboguild.com")
# -----------------------------------------------

def get_beautiful_html(username, referral_link):
    """
    Returns the formatted HTML email content.
    """
    bg_color = "#F9F7F1"  # Cream/Paper
    text_color = "#333333" # Dark Gray/Black
    
    weekly_class_url = "https://www.youtube.com/watch?v=Ol54zPvVpx0"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ 
                font-family: Georgia, 'Times New Roman', Times, serif; 
                background-color: {bg_color}; 
                color: {text_color}; 
                margin: 0; 
                padding: 0; 
                line-height: 1.8;
            }}
            .container {{ 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 40px 20px; 
                background-color: {bg_color};
            }}
            h2 {{
                font-family: Georgia, 'Times New Roman', serif;
                color: #111;
                font-size: 20px;
                margin-top: 35px;
                margin-bottom: 15px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 10px;
            }}
            p, li {{ 
                font-size: 16px; 
                margin-bottom: 20px;
            }}
            strong {{
                color: #000;
            }}
            .highlight {{
                background-color: #fff;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                margin: 30px 0;
            }}
            .link {{ 
                color: #b5952f; 
                text-decoration: underline; 
            }}
            .footer {{ 
                margin-top: 50px; 
                font-size: 14px; 
                color: #666; 
                border-top: 1px solid #ddd; 
                padding-top: 20px; 
                font-style: italic;
            }}
            .emoji {{
                font-style: normal;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <p>Hi {username},</p>

            <h2>🌱 Welcome to The Mambo Guild Beginner Challenge</h2>

            <p>This Challenge is for dancers that have been dancing salsa for <strong>less than 2 years</strong>! Obviously, this is not rocket science, but if you are a more experienced dancer please share this with someone that is getting started!</p>

            <h2>THE PRIZE:</h2>
            <p>The first place, winner of the challenge gets a lifetime free access to the entire Mambo Guild platform. That means 30+ hours of mechanics, practice drills, and full access to our interactive Skill Tree and "Clave" point system.</p>

            <h2>HOW TO ENTER:</h2>
            <p>1. Learn this choreo (Mambo Inn):<br>
            <a href="https://www.youtube.com/watch?v=ticP-zMdeUk" class="link">https://www.youtube.com/watch?v=ticP-zMdeUk</a></p>
            <p>2. Film yourself executing the sequence.</p>
            <p>3. Post your video and <strong>tag me before April 26th</strong>.</p>

            <h2>SUBMISSION RULES:</h2>
            <p>You can post your video as a <strong>Reel</strong> or an <strong>IG Story</strong>.<br>
            ⚠️ <strong>Crucial:</strong> If you post it as a Story, you <strong>MUST</strong> send the raw video to my DMs after posting. Stories disappear in 24 hours. (Posting a Reel is highly preferred).</p>

            <p>💪 Feel like you're more advanced? The <strong>Open Challenge</strong> below is for you. Check it out.</p>

            <h2>🏆 The Mambo Guild Open Challenge: Mambo Gozón</h2>

            <p>Same prize, same rules, same deadline (<strong>April 26th</strong>). Just a harder choreo for the more experienced dancers. Learn the <strong>Mambo Gozón</strong> Choreography (the choreo starts at <strong>13min47</strong>):<br>
            <a href="https://www.youtube.com/watch?v=omiwxSIxnyc" class="link">https://www.youtube.com/watch?v=omiwxSIxnyc</a></p>

            <p>Film it, follow me on Instagram, tag me, and you're in. Let's go.</p>

            <h2>📚 8 Free Classes:</h2>
            <p>Salsa Bodymovement Musicality (La Gripe): <a href="{weekly_class_url}" class="link">{weekly_class_url}</a><br>
            14 Salsa Moves Ep. 2: <a href="https://www.youtube.com/watch?v=-Y4By7n2KCQ" class="link">https://www.youtube.com/watch?v=-Y4By7n2KCQ</a><br>
            Pachanga Fundamentals: <a href="https://www.youtube.com/watch?v=A12yU-b2O_s" class="link">https://www.youtube.com/watch?v=A12yU-b2O_s</a><br>
            Rankankan Choreography: <a href="https://www.youtube.com/watch?v=57-zwVE1VXI" class="link">https://www.youtube.com/watch?v=57-zwVE1VXI</a><br>
            14 Salsa Moves Ep. 1: <a href="https://www.youtube.com/watch?v=5u_56JspFX8" class="link">https://www.youtube.com/watch?v=5u_56JspFX8</a><br>
            Salsa Romantica: <a href="https://www.youtube.com/watch?v=wcDocNANEVY" class="link">https://www.youtube.com/watch?v=wcDocNANEVY</a><br>
            Afro Mambo Fusion: <a href="https://www.youtube.com/watch?v=RIMp6J02Th0" class="link">https://www.youtube.com/watch?v=RIMp6J02Th0</a><br>
            🎁 Pachanga Module 11 (The Kick Tap Chuck): <a href="https://www.youtube.com/watch?v=ER1CMXeoAao" class="link">https://www.youtube.com/watch?v=ER1CMXeoAao</a></p>

            <p>See you in the next one,</p>

            <p>Pavle</p>

            <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p style="font-size: 11px; color: #999;">If you no longer wish to receive these emails, <a href="mailto:pavlepopovic@themamboguild.com?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20mailing%20list." style="color: #999;">click here to unsubscribe</a>.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_broadcast():
    if not os.path.exists(JSON_FILE):
        print(f"❌ Error: Could not find {JSON_FILE}")
        return
    
    # Check API Key
    if not resend.api_key:
        print("❌ Error: RESEND_API_KEY environment variable is not set.")
        print("   On Windows PowerShell: $env:RESEND_API_KEY='re_123...'")
        print("   Then run the script again.")
        if not DRY_RUN:
            return
        else:
            print("   (Proceeding anyway because DRY_RUN is True)")

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        users = json.load(f)

    # Resume support: skip any emails already successfully sent in a prior run
    already_sent_file = os.path.join(script_dir, 'already_sent.txt')
    already_sent = set()
    if os.path.exists(already_sent_file):
        with open(already_sent_file, 'r', encoding='utf-8') as f:
            already_sent = {line.strip().lower() for line in f if line.strip()}
        print(f"Resume mode: {len(already_sent)} emails already sent in prior run — will skip.")

    print(f"Found {len(users)} users in the list.")
    print(f"Mode: {'DRY RUN (No emails will be sent)' if DRY_RUN else 'LIVE BROADCAST'}")
    print("-" * 40)

    count = 0
    skipped = 0
    
    # Skip list: test accounts and fake/disposable emails
    SKIP_EMAILS = {
        # Unsubscribed
        "danielenapoletano92@gmail.com",
        
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
        # allfreemail.net - all disposable
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
        # New allfreemail.net fakes
        "dezra.schauer@allfreemail.net",
        "merrilie.arrant@allfreemail.net",
        "normalee.kirkley@allfreemail.net",
        # Typo'd domains - will bounce
        "daniel.guzman3300@gmail.comd",
        "wtd2101@me.cim",
        "kisslaccer@gmail.co",
        # New allfreemail.net fakes (batch 3)
        "hiroto.shiflett@allfreemail.net",
        "timnesha.mulholland@allfreemail.net",
        "eray.ornelas@allfreemail.net",
        # New allfreemail.net fakes (batch 4)
        "nazavier.jaques@allfreemail.net",
        "faron.zabel@allfreemail.net",
        "riad.garces@allfreemail.net",
        "sundai.berthold@allfreemail.net",
        "tashae.ferranti@allfreemail.net",
        "vonda.casebolt@allfreemail.net",
        "paij.huneycutt@allfreemail.net",
        "melvene.chagnon@allfreemail.net",
        # duoley.com bot cluster
        "yewape6701@duoley.com",
        "yewap26701@duoley.com",
        "yeaape6701@duoley.com",
        "yeaapesu6701@duoley.com",
        "yaape6701@duoley.com",
        # Unsubscribed users
        "malzev1@gmail.com",
        "lucy.arellano97@gmail.com",
        "alicia.adamfe@gmail.com",
        "tine.heggernes@gmail.com",
        "lancekaplan@gmail.com",
        "nycoach@ymail.com",
        "karlasutlovic@yahoo.com",
    }


    
    for user in users:
        # 1. Extract Data safely
        email = user.get('email')
        username = user.get('username', 'Dancer') # Fallback if missing
        code = user.get('referral_code', 'MAMBO2026') # Fallback if missing
        
        # Skip test/fake emails
        if email in SKIP_EMAILS:
            print(f"   [SKIPPED] {email} (test/fake)")
            skipped += 1
            continue

        # Skip already-sent in a prior run (resume support)
        if email and email.lower() in already_sent:
            skipped += 1
            continue
        
        # Construct referral link
        # Ensure helper works with/without trailing slash
        base_url = FRONTEND_URL.rstrip('/')
        referral_link = f"{base_url}/waitlist?ref={code}"

        # 2. Prepare the Email Content
        subject = "🌱 Beginner Challenge: Win Lifetime Access"
        html_content = get_beautiful_html(username, referral_link)

        # 3. Send (or Print)
        print(f"Preparing to send to: {email} (User: {username})")
        
        if DRY_RUN:
            print(f"   [DRY RUN] Would send email with subject: '{subject}'")
            print(f"   [DRY RUN] Referral Link: {referral_link}")
            time.sleep(0.1) # Fast simulation
        else:
            try:
                resend.Emails.send({
                    "from": FROM_EMAIL,
                    "to": [email],
                    "subject": subject,
                    "html": html_content
                })
                print(f"Sent to: {email}")
                count += 1
                try:
                    with open(already_sent_file, 'a', encoding='utf-8') as asf:
                        asf.write(email + '\n')
                except Exception:
                    pass
                time.sleep(1.0) # Small pause to be gentle on the API
            except Exception as e:
                print(f"FAILED to send to {email}: {e}")

    print("-" * 40)
    print(f"Job Complete. Total sent: {count}, Skipped: {skipped}")
    if DRY_RUN:
        print("\n⚠️  This was a DRY RUN. No emails were actually sent.")
        print("   Set DRY_RUN = False in the script to send for real.")

if __name__ == "__main__":
    send_broadcast()
