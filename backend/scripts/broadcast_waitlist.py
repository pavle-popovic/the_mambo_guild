import json
import os
import time
import sys

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
            
            <p>Welcome to The Mambo Guild. I really appreciate your trust in joining this project and I am sure that together, we are going to build a beautiful community. <span class="emoji">🥂</span></p>

            <p>Firstly, a quick intro: My name is <strong>Pavle Popovic</strong>, I am a professional dancer and have been devoting the past 10 years of my life mastering the art of training and learning about dancing. I started this project because I wanted to create the dance academy I wish I had when I started. I saw too many students getting stuck because most online classes lack a clear structure and path to mastery.</p>

            <p>I have studied and hold certifications in Learning Experience Design and Gamification; and decided to apply those scientific principles to this curriculum to ensure you aren't just memorizing steps, but actually <em>learning to dance</em>.</p>

            <p>To kick things off properly, I want to give you a head start. Here are two critical insights you need to know right now. <span class="emoji">👇</span></p>

            <h2><span class="emoji">🧠</span> The Science: What is "Segmentation" ?</h2>
            <p>In cognitive science, there is a concept called <strong>Chunking</strong> (or Segmentation).</p>
            <p>Your working memory has a limit. If you try to learn the feet, the arms, the timing, and the partner connection all at once, your brain gets "Cognitive Overload." You freeze. <span class="emoji">🥶</span></p>
            <p>At the Guild, we use <strong>Modular Segmentation</strong>: We break complex patterns into isolated "chunks" so your brain can digest them faster.</p>
            <ul>
                <li><span class="emoji">🦶</span> <strong>The Feet</strong>: We isolate the footwork first until it becomes automatic.</li>
                <li><span class="emoji">👐</span> <strong>The Styling</strong>: We layer on the arm mechanics and styling options which can be applied to all footworks.</li>
                <li><span class="emoji">🧩</span> <strong>The Integration</strong>: We only combine them once the individual parts are semi-automatic.</li>
            </ul>
            <p>The Result: You learn faster, have more fun, and stop feeling overwhelmed!</p>

            <h2><span class="emoji">📜</span> The History: What are we actually dancing?</h2>
            <p>You’ll hear "Salsa" and "Mambo" used interchangeably, but context is everything. Here is the 30-second breakdown:</p>
            <ul>
                <li><span class="emoji">🥁</span> <strong>The Roots (Mambo)</strong>: In the 1950s, the "Mambo Craze" exploded at New York’s Palladium Ballroom. Dancers moved strictly to the rhythm of the conga drum, accenting the "slap" on the second beat.</li>
                <li><span class="emoji">🎺</span> <strong>The Evolution (Salsa)</strong>: By the 70s, Latin Jazz music was evolving and starting to become increasingly "popular". The marketing term "Salsa" was born to package this incredible blend of rhythms for the world.</li>
                <li><span class="emoji">🗽</span> <strong>The Structure (On2)</strong>: While many danced "On1" (following the melody), the legendary Eddie Torres formalized "New York Style On2" to preserve that original Palladium connection to the rhythm section.</li>
            </ul>

            <p>For more information I strongly recommend the following documentary: <br>
            <a href="https://www.youtube.com/watch?v=hlYgFQjTyTc" class="link">https://www.youtube.com/watch?v=hlYgFQjTyTc</a></p>

            <p>Keep an eye on your inbox, because I will be sending you free choreographies, full classes, and deep dives into dance science and history every single week.</p>

            <p>Pavle<br>
            Founder, The Mambo Guild</p>

            <div class="footer">
                <p>P.S. Want to unlock 'Beta Tester' status early? Invite 3 friends using your unique extraction link:<br>
                <a href="{referral_link}" class="link">{referral_link}</a></p>
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
    for user in users:
        # 1. Extract Data safely
        email = user.get('email')
        username = user.get('username', 'Dancer') # Fallback if missing
        code = user.get('referral_code', 'MAMBO2026') # Fallback if missing
        
        # Construct referral link
        # Ensure helper works with/without trailing slash
        base_url = FRONTEND_URL.rstrip('/')
        referral_link = f"{base_url}/waitlist?ref={code}"

        # 2. Prepare the Email Content
        subject = "Welcome to The Mambo Guild"
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
    print(f"Job Complete. Total sent: {count}")
    if DRY_RUN:
        print("\n⚠️  This was a DRY RUN. No emails were actually sent.")
        print("   Set DRY_RUN = False in the script to send for real.")

if __name__ == "__main__":
    send_broadcast()
