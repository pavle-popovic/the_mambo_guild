import json
import os
import time
import sys

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
FROM_EMAIL = os.environ.get("FROM_EMAIL", "Mambo Guild <founder@themamboguild.com>")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://themamboguild.com")
# -----------------------------------------------

def get_beautiful_html(username, referral_link):
    """
    Returns the formatted HTML email content.
    """
    bg_color = "#F9F7F1"  # Cream/Paper
    text_color = "#333333" # Dark Gray/Black
    
    # TODO: Replace [INSERT URL HERE] with the actual combo URL before sending
    combo_url = "https://youtu.be/Snk7pqMMczc"
    
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
            
            <p>Here is the class for this week (14 Salsa Moves Episode 2): <a href="https://www.youtube.com/watch?v=-Y4By7n2KCQ" class="link">https://www.youtube.com/watch?v=-Y4By7n2KCQ</a></p>
            <p>Pachanga Fundamentals: <a href="https://www.youtube.com/watch?v=A12yU-b2O_s" class="link">https://www.youtube.com/watch?v=A12yU-b2O_s</a></p>
            <p>Salsa Choreography (Baile Inolvidable): <a href="https://www.youtube.com/watch?v=Snk7pqMMczc" class="link">https://www.youtube.com/watch?v=Snk7pqMMczc</a></p>
            <p>Rankankan Choreography: <a href="https://www.youtube.com/watch?v=57-zwVE1VXI" class="link">https://www.youtube.com/watch?v=57-zwVE1VXI</a></p>
            <p>14 Salsa Moves Episode 1: <a href="https://www.youtube.com/watch?v=5u_56JspFX8" class="link">https://www.youtube.com/watch?v=5u_56JspFX8</a></p>
            <p>Salsa Romantica: <a href="https://www.youtube.com/watch?v=wcDocNANEVY" class="link">https://www.youtube.com/watch?v=wcDocNANEVY</a></p>
            <p>Afro Mambo Fusion: <a href="https://www.youtube.com/watch?v=RIMp6J02Th0" class="link">https://www.youtube.com/watch?v=RIMp6J02Th0</a></p>
            <p><strong>🎁 Bonus!</strong> I just unlocked Module 11 (The Kick Tap Chuck) from the premium Pachanga curriculum: <a href="https://www.youtube.com/watch?v=ER1CMXeoAao" class="link">https://www.youtube.com/watch?v=ER1CMXeoAao</a></p>

            <h2><span class="emoji">🧠</span> The Science: Why Talking to Yourself Makes You a Better Dancer</h2>
            <p>Your auditory cortex and motor cortex aren't separate systems — they share a direct anatomical highway called the <strong>dorsal auditory pathway</strong>. When you vocalize rhythm ("ta-ka-ta") while you dance, you create a closed feedback loop: any timing mismatch between your voice and your feet produces an instant error signal your brain can correct <em>within the same rep</em>.</p>
            <p>Even crazier: research shows this doesn't just fix timing — it improves <strong>spatial consistency</strong> too. Your footwork paths get cleaner and your body drifts less. Scatting your rhythms isn't a beginner crutch. It's a precision tool the best dancers never stop using.</p>

            <h2><span class="emoji">🗽</span> The History: How Street Survival Created the Salsa Attitude</h2>
            <p>1970s New York was broke, burning, and hostile. The Latino community in the South Bronx and Spanish Harlem were trapped. <strong>Fania Records</strong> turned that raw struggle into music. Artists like <strong>Willie Colón</strong> ("El Malo") dressed their bands like street hustlers and wrote lyrics about poverty, crime, and cultural survival — no more tropical fantasies.</p>
            <p>The attitude hit the dance floor hard. Dancers adopted the <strong>Pachuco Cross</strong> — an aggressive shine where you cross one foot deep over the other, roll your shoulders forward, drop your chin, and lock eyes like you're in a street fight. It's the exact opposite of elegant ballroom posture. When Willie Colón's trombones hit, that confrontational frame is the only way to interpret the music.</p>

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

    with open(JSON_FILE, 'r') as f:
        users = json.load(f)

    print(f"Found {len(users)} users in the list.")
    print(f"Mode: {'DRY RUN (No emails will be sent)' if DRY_RUN else 'LIVE BROADCAST'}")
    print("-" * 40)

    count = 0
    skipped = 0
    
    # Skip list: test accounts and fake/disposable emails
    SKIP_EMAILS = {
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
        # New allfreemail.net fakes (batch 3)
        "hiroto.shiflett@allfreemail.net",
        "timnesha.mulholland@allfreemail.net",
        "eray.ornelas@allfreemail.net"
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
        
        # Construct referral link
        # Ensure helper works with/without trailing slash
        base_url = FRONTEND_URL.rstrip('/')
        referral_link = f"{base_url}/waitlist?ref={code}"

        # 2. Prepare the Email Content
        subject = "14 Salsa Moves Episode 2 + how street survival shaped Salsa"
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
