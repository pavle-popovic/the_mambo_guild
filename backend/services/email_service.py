"""
Email service for sending transactional emails using Resend.
"""
import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

try:
    import resend
    if settings.RESEND_API_KEY:
        resend.api_key = settings.RESEND_API_KEY
    else:
        logger.info("Resend API key not configured. Email functionality will be disabled.")
except ImportError as e:
    logger.warning(f"Resend package not installed. Email functionality will be disabled. Error: {e}")
    resend = None


def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email with a secure token link.
    
    Args:
        email: User's email address
        reset_token: Secure token for password reset
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send email.")
        return False
    
    try:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        # Use configured FROM_EMAIL
        from_email = settings.FROM_EMAIL
        
        result = resend.Emails.send({
            "from": from_email,
            "to": [email],
            "subject": "Reset Your Password - The Mambo Guild",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .button {{ display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .button:hover {{ background-color: #2563eb; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Reset Your Password</h1>
                    <p>You requested to reset your password for The Mambo Guild account.</p>
                    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                    <a href="{reset_url}" class="button">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">{reset_url}</p>
                </div>
            </body>
            </html>
            """,
        })
        
        logger.info(f"Password reset email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
        return False


def send_waitlist_welcome_email(email: str, username: str, referral_link: str) -> bool:
    """
    Send welcome email to new waitlist members.
    
    Args:
        email: User's email address
        username: Reserved username
        referral_link: Unique referral link for the user
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send welcome email.")
        return False
        
    try:
        from_email = settings.FROM_EMAIL
        
        # "Book Club" / "Prestigious Guild" Aesthetic
        # Colors
        bg_color = "#F9F7F1"  # Cream/Paper
        text_color = "#333333" # Dark Gray/Black
        accent_color = "#D4AF37" # Gold (kept for subtle accents)
        
        result = resend.Emails.send({
            "from": from_email,
            "to": [email],
            "subject": "Welcome to The Mambo Guild",
            "html": f"""
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
                    
                    <p>Here is the link to the weekly tutorial: <a href="https://youtu.be/wcDocNANEVY" class="link">https://youtu.be/wcDocNANEVY</a></p>

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
                    <p>You'll hear "Salsa" and "Mambo" used interchangeably, but context is everything. Here is the 30-second breakdown:</p>
                    <ul>
                        <li><span class="emoji">🥁</span> <strong>The Roots (Mambo)</strong>: In the 1950s, the "Mambo Craze" exploded at New York's Palladium Ballroom. Dancers moved strictly to the rhythm of the conga drum, accenting the "slap" on the second beat.</li>
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
            """,
        })
        
        logger.info(f"Waitlist welcome email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send waitlist welcome email to {email}: {str(e)}")
        return False
