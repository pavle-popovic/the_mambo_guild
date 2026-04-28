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


def send_email_verification_email(email: str, verification_token: str) -> bool:
    """
    Send an email-verification link. The token is consumed by
    POST /api/auth/verify-email which flips users.is_verified to True.

    Verification gates trial activation only (not signup or browsing) —
    so this email is the one-and-only friction point an attacker hits
    when farming trials with throwaway domains. A real mailbox is now
    required to extract any trial value.

    Returns True iff Resend accepted the message.
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send verification email.")
        return False

    try:
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        from_email = settings.FROM_EMAIL
        ttl_hours = settings.EMAIL_VERIFICATION_EXPIRE_HOURS

        result = resend.Emails.send({
            "from": from_email,
            "to": [email],
            "subject": "Verify your email - The Mambo Guild",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .button {{ display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: #111; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                    .button:hover {{ background-color: #C7A030; }}
                    .footer {{ color: #888; font-size: 12px; margin-top: 24px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Verify your email</h1>
                    <p>Welcome to The Mambo Guild. To start your free trial and unlock the full library, please confirm this is your email address.</p>
                    <a href="{verify_url}" class="button">Verify my email</a>
                    <p>This link expires in {ttl_hours} hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                    <p>Trouble with the button? Paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">{verify_url}</p>
                    <p class="footer">The Mambo Guild &middot; sent by Pavle Popovic</p>
                </div>
            </body>
            </html>
            """,
        })

        logger.info(f"Email verification sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email verification to {email}: {str(e)}")
        return False


def send_coaching_feedback_email(student_email: str, student_name: str, feedback_url: str) -> bool:
    """
    Send email to student notifying them their coaching feedback video is ready.

    Args:
        student_email: Student's email address
        student_name: Student's first name
        feedback_url: URL to the feedback video (R2 public URL)

    Returns:
        True if sent successfully, False otherwise
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send coaching feedback email.")
        return False

    try:
        from_email = settings.FROM_EMAIL
        view_url = f"{settings.FRONTEND_URL}/guild-master?tab=coaching"

        result = resend.Emails.send({
            "from": from_email,
            "to": [student_email],
            "subject": "Your video feedback is ready",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{
                        font-family: Georgia, 'Times New Roman', Times, serif;
                        background-color: #F9F7F1;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                        line-height: 1.8;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        background-color: #F9F7F1;
                    }}
                    .badge {{
                        display: inline-block;
                        background-color: #D4AF37;
                        color: #000;
                        font-size: 12px;
                        font-weight: bold;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        padding: 4px 12px;
                        border-radius: 2px;
                        margin-bottom: 24px;
                        font-family: Arial, sans-serif;
                    }}
                    h1 {{
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: 28px;
                        color: #111;
                        margin-bottom: 8px;
                    }}
                    p {{
                        font-size: 16px;
                        margin-bottom: 20px;
                    }}
                    .cta-button {{
                        display: inline-block;
                        padding: 14px 32px;
                        background-color: #D4AF37;
                        color: #000000;
                        text-decoration: none;
                        font-family: Arial, sans-serif;
                        font-weight: bold;
                        font-size: 15px;
                        border-radius: 4px;
                        margin: 24px 0;
                    }}
                    .divider {{
                        border: none;
                        border-top: 1px solid #e0e0e0;
                        margin: 32px 0;
                    }}
                    .footer {{
                        font-size: 13px;
                        color: #888;
                        font-style: italic;
                        font-family: Arial, sans-serif;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="badge">Guild Master</div>
                    <h1>Your feedback is ready, {student_name}.</h1>
                    <p>Your 1-on-1 video analysis has been reviewed and your personalised feedback video is now waiting for you in the Guild Master Hub.</p>
                    <p>Head over to your coaching dashboard to watch it. Your instructor has recorded a full breakdown just for you.</p>
                    <a href="{view_url}" class="cta-button">Watch My Feedback</a>
                    <hr class="divider">
                    <p class="footer">
                        You're receiving this because you submitted a coaching video through The Mambo Guild.<br>
                        The Mambo Guild Team
                    </p>
                </div>
            </body>
            </html>
            """,
        })

        logger.info(f"Coaching feedback email sent to {student_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send coaching feedback email to {student_email}: {str(e)}")
        return False


def send_announcement_email(email: str, name: str, subject: str, message: str) -> bool:
    """
    Send a custom announcement email to a student from the admin dashboard.

    Args:
        email: Recipient email address
        name: Recipient first name
        subject: Email subject line
        message: Plain text message body (will be wrapped in branded HTML)

    Returns:
        True if sent successfully, False otherwise
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send announcement email.")
        return False

    try:
        from html import escape

        from_email = settings.FROM_EMAIL

        # HTML-escape user-supplied fields BEFORE expanding newlines to <br>.
        # Without this, an admin (or anyone who eventually gains write access
        # to this endpoint) can inject arbitrary HTML/script into a broadcast
        # email — e.g., a tracking pixel that leaks recipient identity, or
        # a phishing link styled to look like a Mambo Guild action button.
        # Other emails in this module (send_coaching_feedback_email,
        # send_subscription_canceled_email, etc.) already escape the same
        # way; this one was the outlier. Recipient name comes from the
        # user_profiles table and could be self-injected, so escape it too.
        safe_message = escape(message).replace("\n", "<br>")
        safe_name = escape(name)

        result = resend.Emails.send({
            "from": from_email,
            "to": [email],
            "subject": subject,
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{
                        font-family: Georgia, 'Times New Roman', Times, serif;
                        background-color: #F9F7F1;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                        line-height: 1.8;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        background-color: #F9F7F1;
                    }}
                    .badge {{
                        display: inline-block;
                        background-color: #D4AF37;
                        color: #000;
                        font-size: 12px;
                        font-weight: bold;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        padding: 4px 12px;
                        border-radius: 2px;
                        margin-bottom: 24px;
                        font-family: Arial, sans-serif;
                    }}
                    p {{
                        font-size: 16px;
                        margin-bottom: 20px;
                    }}
                    .divider {{
                        border: none;
                        border-top: 1px solid #e0e0e0;
                        margin: 32px 0;
                    }}
                    .footer {{
                        font-size: 13px;
                        color: #888;
                        font-style: italic;
                        font-family: Arial, sans-serif;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="badge">The Mambo Guild</div>
                    <p>Hi {safe_name},</p>
                    <p>{safe_message}</p>
                    <hr class="divider">
                    <p class="footer">
                        You're receiving this because you're a member of The Mambo Guild.<br>
                        Pavle &amp; The Mambo Guild Team
                    </p>
                </div>
            </body>
            </html>
            """,
        })

        logger.info(f"Announcement email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send announcement email to {email}: {str(e)}")
        return False


def send_bug_report_email(
    message: str,
    reporter_email: Optional[str],
    reporter_name: Optional[str],
    page_url: str,
    user_agent: str,
    device_info: dict,
    screenshot_urls: list,
) -> bool:
    """
    Send a bug report email to support@themamboguild.com.

    Args:
        message: User's description of the bug
        reporter_email: User's email (optional, from auth context)
        reporter_name: User's name (optional)
        page_url: URL where the bug occurred
        user_agent: Browser user agent string
        device_info: Dict with screen size, viewport, platform, language, timezone
        screenshot_urls: List of public R2 URLs to attached screenshots/images

    Returns:
        True if sent successfully, False otherwise
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send bug report email.")
        return False

    try:
        from_email = settings.FROM_EMAIL
        support_email = "support@themamboguild.com"

        # Escape user-provided content to avoid HTML injection
        from html import escape
        safe_message = escape(message).replace("\n", "<br>")
        safe_page_url = escape(page_url)
        safe_ua = escape(user_agent)
        safe_reporter = escape(reporter_email or "anonymous")
        safe_name = escape(reporter_name or "(not provided)")

        screenshots_html = ""
        if screenshot_urls:
            thumbs = "".join(
                f'<a href="{escape(url)}" target="_blank" style="display:inline-block;margin:8px 8px 0 0;">'
                f'<img src="{escape(url)}" alt="screenshot" style="max-width:280px;border:1px solid #ddd;border-radius:4px;"/>'
                f"</a>"
                for url in screenshot_urls
            )
            screenshots_html = f"<h3 style='margin-top:24px;'>Screenshots</h3>{thumbs}"

        device_rows = "".join(
            f"<tr><td style='padding:4px 12px;color:#666;'>{escape(str(k))}</td>"
            f"<td style='padding:4px 12px;font-family:monospace;'>{escape(str(v))}</td></tr>"
            for k, v in device_info.items()
        )

        reply_to = reporter_email if reporter_email else from_email

        result = resend.Emails.send({
            "from": from_email,
            "to": [support_email],
            "reply_to": reply_to,
            "subject": f"[Bug Report] {' '.join(message.split())[:60]}{'...' if len(message) > 60 else ''}",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: -apple-system, Segoe UI, Arial, sans-serif; color:#222; max-width:720px; margin:0 auto; padding:24px;">
                <h2 style="border-bottom:2px solid #D4AF37; padding-bottom:8px;">New Bug Report</h2>
                <table style="border-collapse:collapse; margin-bottom:16px;">
                    <tr><td style="padding:4px 12px;color:#666;">From</td><td style="padding:4px 12px;">{safe_name} &lt;{safe_reporter}&gt;</td></tr>
                    <tr><td style="padding:4px 12px;color:#666;">Page</td><td style="padding:4px 12px;"><a href="{safe_page_url}">{safe_page_url}</a></td></tr>
                </table>

                <h3>Message</h3>
                <div style="background:#f9f7f1; border-left:3px solid #D4AF37; padding:12px 16px; white-space:pre-wrap;">{safe_message}</div>

                {screenshots_html}

                <h3 style="margin-top:24px;">Device / Browser</h3>
                <table style="border-collapse:collapse; font-size:13px;">
                    <tr><td style="padding:4px 12px;color:#666;">User Agent</td><td style="padding:4px 12px;font-family:monospace;word-break:break-all;">{safe_ua}</td></tr>
                    {device_rows}
                </table>

                <p style="color:#888; font-size:12px; margin-top:32px;">Sent automatically by The Mambo Guild bug report widget. Reply to this email to contact the reporter directly.</p>
            </body>
            </html>
            """,
        })

        logger.info(f"Bug report email sent to {support_email} (reporter: {reporter_email})")
        return True
    except Exception as e:
        logger.error(f"Failed to send bug report email: {str(e)}")
        return False


def send_ambassador_application_email(
    applicant_name: str,
    applicant_email: str,
    instagram_url: Optional[str],
    location: Optional[str],
    message: str,
    page_url: str,
    client_ip: str,
) -> bool:
    """
    Forward an "apply to become a Guild Ambassador" submission to
    pavlepopovic@themamboguild.com.

    Mirrors the bug-report pattern: Resend with reply_to set to the applicant
    so Pavle can reply directly from his inbox.
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send ambassador application email.")
        return False

    try:
        from_email = settings.FROM_EMAIL
        to_email = "pavlepopovic@themamboguild.com"

        from html import escape
        safe_name = escape(applicant_name)
        safe_email = escape(applicant_email)
        safe_ig = escape(instagram_url or "(not provided)")
        safe_location = escape(location or "(not provided)")
        safe_message = escape(message).replace("\n", "<br>")
        safe_page_url = escape(page_url)
        safe_ip = escape(client_ip)

        result = resend.Emails.send({
            "from": from_email,
            "to": [to_email],
            "reply_to": applicant_email,
            "subject": f"[Ambassador] {applicant_name} wants to represent the Guild",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: -apple-system, Segoe UI, Arial, sans-serif; color:#222; max-width:720px; margin:0 auto; padding:24px;">
                <h2 style="border-bottom:2px solid #D4AF37; padding-bottom:8px;">Ambassador Application</h2>
                <table style="border-collapse:collapse; margin-bottom:16px;">
                    <tr><td style="padding:4px 12px;color:#666;">Name</td><td style="padding:4px 12px;">{safe_name}</td></tr>
                    <tr><td style="padding:4px 12px;color:#666;">Email</td><td style="padding:4px 12px;"><a href="mailto:{safe_email}">{safe_email}</a></td></tr>
                    <tr><td style="padding:4px 12px;color:#666;">Instagram</td><td style="padding:4px 12px;">{safe_ig if not instagram_url else f'<a href="{safe_ig}" target="_blank">{safe_ig}</a>'}</td></tr>
                    <tr><td style="padding:4px 12px;color:#666;">Location</td><td style="padding:4px 12px;">{safe_location}</td></tr>
                    <tr><td style="padding:4px 12px;color:#666;">Submitted from</td><td style="padding:4px 12px;"><a href="{safe_page_url}">{safe_page_url}</a></td></tr>
                    <tr><td style="padding:4px 12px;color:#666;">Client IP</td><td style="padding:4px 12px;font-family:monospace;">{safe_ip}</td></tr>
                </table>

                <h3>Why they want to represent the Guild</h3>
                <div style="background:#f9f7f1; border-left:3px solid #D4AF37; padding:12px 16px; white-space:pre-wrap;">{safe_message}</div>

                <p style="color:#888; font-size:12px; margin-top:32px;">Reply to this email to contact {safe_name} directly.</p>
            </body>
            </html>
            """,
        })

        logger.info(f"Ambassador application email sent to {to_email} (applicant: {applicant_email})")
        return True
    except Exception as e:
        logger.error(f"Failed to send ambassador application email: {str(e)}")
        return False


def send_payment_failed_email(
    email: str,
    name: str,
    manage_billing_url: str,
    tier_label: str,
) -> bool:
    """
    Notify a member that their renewal payment failed and access has been
    paused until they update their card. Linked to the Stripe Customer Portal
    so they can fix it themselves without contacting support.
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send payment failed email.")
        return False

    try:
        from_email = settings.FROM_EMAIL
        from html import escape
        safe_name = escape(name or "there")
        safe_tier = escape(tier_label)
        safe_url = escape(manage_billing_url)

        result = resend.Emails.send({
            "from": f"The Mambo Guild <{from_email}>",
            "to": [email],
            "subject": "Action needed: your Mambo Guild payment did not go through",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{ font-family: Georgia, 'Times New Roman', Times, serif; background-color: #F9F7F1; color: #333333; margin: 0; padding: 0; line-height: 1.8; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F9F7F1; }}
                    .badge {{ display: inline-block; background-color: #D4AF37; color: #000; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; margin-bottom: 24px; font-family: Arial, sans-serif; }}
                    h1 {{ font-family: Georgia, serif; font-size: 26px; color: #111; margin-bottom: 8px; }}
                    p {{ font-size: 16px; margin-bottom: 18px; }}
                    .cta-button {{ display: inline-block; padding: 14px 32px; background-color: #D4AF37; color: #000000; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 15px; border-radius: 4px; margin: 20px 0; }}
                    .divider {{ border: none; border-top: 1px solid #e0e0e0; margin: 32px 0; }}
                    .footer {{ font-size: 13px; color: #888; font-style: italic; font-family: Arial, sans-serif; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="badge">Billing</div>
                    <h1>We could not charge your card, {safe_name}.</h1>
                    <p>Your latest <strong>{safe_tier}</strong> renewal was declined by your bank. Your premium access has been paused while we sort this out.</p>
                    <p>The fix is fast: open the billing portal and update your card. Once we collect a successful payment, your tier comes back automatically.</p>
                    <a href="{safe_url}" class="cta-button">Update payment method</a>
                    <p>Stripe will retry the charge a few more times over the next several days. If none succeed, the subscription will be cancelled and you can re-subscribe whenever you are ready.</p>
                    <hr class="divider">
                    <p class="footer">Need help? Reply to this email and I will personally take a look.<br>Pavle &amp; The Mambo Guild Team</p>
                </div>
            </body>
            </html>
            """,
        })

        logger.info(f"Payment failed email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send payment failed email to {email}: {str(e)}")
        return False


def send_subscription_canceled_email(
    email: str,
    name: str,
    tier_label: str,
    reactivate_url: str,
) -> bool:
    """
    Confirm a cancellation has gone through. Sent on the final
    customer.subscription.deleted event (after period end), not on the
    user's "cancel at period end" click — that one keeps full access.
    """
    if not resend or not settings.RESEND_API_KEY:
        logger.error("Resend client not configured. Cannot send cancellation email.")
        return False

    try:
        from_email = settings.FROM_EMAIL
        from html import escape
        safe_name = escape(name or "there")
        safe_tier = escape(tier_label)
        safe_url = escape(reactivate_url)

        result = resend.Emails.send({
            "from": f"The Mambo Guild <{from_email}>",
            "to": [email],
            "subject": "Your Mambo Guild subscription has ended",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{ font-family: Georgia, 'Times New Roman', Times, serif; background-color: #F9F7F1; color: #333333; margin: 0; padding: 0; line-height: 1.8; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F9F7F1; }}
                    .badge {{ display: inline-block; background-color: #D4AF37; color: #000; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; margin-bottom: 24px; font-family: Arial, sans-serif; }}
                    h1 {{ font-family: Georgia, serif; font-size: 26px; color: #111; margin-bottom: 8px; }}
                    p {{ font-size: 16px; margin-bottom: 18px; }}
                    .cta-button {{ display: inline-block; padding: 14px 32px; background-color: #D4AF37; color: #000000; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 15px; border-radius: 4px; margin: 20px 0; }}
                    .divider {{ border: none; border-top: 1px solid #e0e0e0; margin: 32px 0; }}
                    .footer {{ font-size: 13px; color: #888; font-style: italic; font-family: Arial, sans-serif; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="badge">Subscription</div>
                    <h1>Your {safe_tier} subscription has ended, {safe_name}.</h1>
                    <p>You still have a free Rookie account, so all your XP, badges, streaks and progress are safe and waiting for you whenever you decide to come back.</p>
                    <p>If this was a mistake, or if you change your mind, you can re-activate in one click and pick up exactly where you left off.</p>
                    <a href="{safe_url}" class="cta-button">Re-activate my plan</a>
                    <p>Thank you for the time you spent training with us. Whatever comes next, keep dancing.</p>
                    <hr class="divider">
                    <p class="footer">Pavle &amp; The Mambo Guild Team</p>
                </div>
            </body>
            </html>
            """,
        })

        logger.info(f"Subscription cancellation email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send cancellation email to {email}: {str(e)}")
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

        text_body = f"""Hi {username},

===========================================
WEEKEND BONUS
===========================================

BRUNO MARS CHA CHA CHA
A fresh intermediate cha cha cha routine set to a beloved Bruno Mars banger. Something to move to this weekend before the Guild opens.

Watch the choreo:
https://www.youtube.com/watch?v=c-01Oo_Pzso


BEGINNER CHALLENGE: MAMBO INN
(less than 2 years dancing, Win Lifetime Access)
https://www.youtube.com/watch?v=ticP-zMdeUk

OPEN CHALLENGE: MAMBO GOZON CHOREO
(more advanced, Win Lifetime Access)
https://www.youtube.com/watch?v=omiwxSIxnyc


8 FREE CLASSES
-------------------------------------------
- Salsa Bodymovement Musicality (La Gripe): https://www.youtube.com/watch?v=Ol54zPvVpx0
- 14 Salsa Moves Ep. 2: https://www.youtube.com/watch?v=-Y4By7n2KCQ
- Pachanga Fundamentals: https://www.youtube.com/watch?v=A12yU-b2O_s
- Rankankan Choreography: https://www.youtube.com/watch?v=57-zwVE1VXI
- 14 Salsa Moves Ep. 1: https://www.youtube.com/watch?v=5u_56JspFX8
- Salsa Romantica: https://www.youtube.com/watch?v=wcDocNANEVY
- Afro Mambo Fusion: https://www.youtube.com/watch?v=RIMp6J02Th0
- Pachanga Module 11 (The Kick Tap Chuck): https://www.youtube.com/watch?v=ER1CMXeoAao


Welcome to The Mambo Guild. I really appreciate your trust in joining this project and I am sure that together, we are going to build a beautiful community.

Firstly, a quick intro: My name is Pavle Popovic, I am a professional dancer and have been devoting the past 10 years of my life mastering the art of training and learning about dancing. I started this project because I wanted to create the dance academy I wish I had when I started. I saw too many students getting stuck because most online classes lack a clear structure and path to mastery.

I have studied and hold certifications in Learning Experience Design and Gamification, and decided to apply those scientific principles to this curriculum to ensure you aren't just memorizing steps, but actually learning to dance.

The Guild opens its doors Wednesday, April 29th. Here's a quick tour of what you're about to step into.

THE VAULT
Your arsenal of dance mastery.
- 500+ lessons, from your first basic step to pro-level mechanics
- Three full Mambo courses and a complete Pachanga course
- A full course on Salsa History and a full course on Effective Training Science
- Bi-weekly choreographies and new courses, with expert guest teachers

THE RPG OF DANCE
Visualize your growth from Basic Steps to Boss Level. Every lesson unlocks a new node on your skill tree. Track your progress like a true gamer.

THE STAGE
Compete, collaborate, and get feedback from real pros. Climb the High Rollers leaderboard and earn legendary badges.

Doors open Wednesday, April 29th. Keep an eye on your inbox.

Pavle
Founder, The Mambo Guild

-------------------------------------------
P.S. Want to unlock 'Beta Tester' status early? Invite 3 friends using your unique extraction link:
{referral_link}

To unsubscribe, reply to pavlepopovic@themamboguild.com with "Unsubscribe".
"""

        result = resend.Emails.send({
            "from": f"The Mambo Guild <{from_email}>",
            "to": [email],
            "subject": "Welcome to the Mambo Guild",
            "text": text_body,
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
                    .badge {{
                        display: inline-block;
                        background-color: #D4AF37;
                        color: #000;
                        font-size: 12px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        padding: 6px 14px;
                        border-radius: 2px;
                        font-family: Arial, sans-serif;
                    }}
                    .bonus-callout {{
                        background-color: #fff;
                        border: 1px solid #e0e0e0;
                        border-left: 4px solid #D4AF37;
                        padding: 24px 24px 20px;
                        margin: 24px 0 40px;
                        border-radius: 4px;
                    }}
                    .bonus-callout h3 {{
                        font-family: Georgia, 'Times New Roman', serif;
                        color: #111;
                        font-size: 24px;
                        margin: 10px 0 12px 0;
                        line-height: 1.3;
                    }}
                    .bonus-callout p {{ margin-bottom: 12px; }}
                    .feature-img {{
                        width: 100%;
                        max-width: 560px;
                        height: auto;
                        display: block;
                        margin: 18px auto;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <p>Hi {username},</p>

                    <div class="bonus-callout">
                        <div class="badge">Weekend Bonus</div>
                        <h3><span class="emoji">🎶</span> Bruno Mars Cha Cha Cha</h3>
                        <p>A fresh intermediate cha cha cha routine set to a beloved Bruno Mars banger. Something to move to this weekend before the Guild opens.</p>
                        <p style="margin-bottom:0;"><a href="https://www.youtube.com/watch?v=c-01Oo_Pzso" class="link"><strong>Watch the choreo &rarr;</strong></a></p>
                    </div>

                    <p><strong>🌱 Beginner Challenge: Mambo Inn (less than 2 years dancing, Win Lifetime Access!):</strong><br>
                    <a href="https://www.youtube.com/watch?v=ticP-zMdeUk" class="link">https://www.youtube.com/watch?v=ticP-zMdeUk</a></p>

                    <p><strong>🏆 Open Challenge: Mambo Gozón Choreo (more advanced, Win Lifetime Access!):</strong><br>
                    <a href="https://www.youtube.com/watch?v=omiwxSIxnyc" class="link">https://www.youtube.com/watch?v=omiwxSIxnyc</a></p>

                    <p><strong>8 Free Classes:</strong><br>
                    Salsa Bodymovement Musicality (La Gripe): <a href="https://www.youtube.com/watch?v=Ol54zPvVpx0" class="link">https://www.youtube.com/watch?v=Ol54zPvVpx0</a><br>
                    14 Salsa Moves Ep. 2: <a href="https://www.youtube.com/watch?v=-Y4By7n2KCQ" class="link">https://www.youtube.com/watch?v=-Y4By7n2KCQ</a><br>
                    Pachanga Fundamentals: <a href="https://www.youtube.com/watch?v=A12yU-b2O_s" class="link">https://www.youtube.com/watch?v=A12yU-b2O_s</a><br>
                    Rankankan Choreography: <a href="https://www.youtube.com/watch?v=57-zwVE1VXI" class="link">https://www.youtube.com/watch?v=57-zwVE1VXI</a><br>
                    14 Salsa Moves Ep. 1: <a href="https://www.youtube.com/watch?v=5u_56JspFX8" class="link">https://www.youtube.com/watch?v=5u_56JspFX8</a><br>
                    Salsa Romantica: <a href="https://www.youtube.com/watch?v=wcDocNANEVY" class="link">https://www.youtube.com/watch?v=wcDocNANEVY</a><br>
                    Afro Mambo Fusion: <a href="https://www.youtube.com/watch?v=RIMp6J02Th0" class="link">https://www.youtube.com/watch?v=RIMp6J02Th0</a><br>
                    🎁 Pachanga Module 11 (The Kick Tap Chuck): <a href="https://www.youtube.com/watch?v=ER1CMXeoAao" class="link">https://www.youtube.com/watch?v=ER1CMXeoAao</a></p>

                    <p>Welcome to The Mambo Guild. I really appreciate your trust in joining this project and I am sure that together, we are going to build a beautiful community. <span class="emoji">🥂</span></p>

                    <p>Firstly, a quick intro: My name is <strong>Pavle Popovic</strong>, I am a professional dancer and have been devoting the past 10 years of my life mastering the art of training and learning about dancing. I started this project because I wanted to create the dance academy I wish I had when I started. I saw too many students getting stuck because most online classes lack a clear structure and path to mastery.</p>

                    <p>I have studied and hold certifications in Learning Experience Design and Gamification; and decided to apply those scientific principles to this curriculum to ensure you aren't just memorizing steps, but actually <em>learning to dance</em>.</p>

                    <p>The Guild opens its doors <strong>Wednesday, April 29th</strong>. Here's a quick tour of what you're about to step into. <span class="emoji">👇</span></p>

                    <h2><span class="emoji">📚</span> The Vault</h2>
                    <p><em>Your arsenal of dance mastery.</em></p>
                    <ul>
                        <li>500+ lessons, from your first basic step to pro-level mechanics</li>
                        <li>Three full Mambo courses and a complete Pachanga course</li>
                        <li>A full course on Salsa History and a full course on Effective Training Science</li>
                        <li>Bi-weekly choreographies and new courses, with expert guest teachers</li>
                    </ul>
                    <img src="https://www.themamboguild.com/assets/Course_page.png" alt="The Vault" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

                    <h2><span class="emoji">🌳</span> The RPG of Dance</h2>
                    <p>Visualize your growth from Basic Steps to Boss Level. Every lesson unlocks a new node on your skill tree. Track your progress like a true gamer.</p>
                    <img src="https://www.themamboguild.com/assets/skill-tree.png" alt="Skill tree" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

                    <h2><span class="emoji">🏆</span> The Stage</h2>
                    <p>Compete, collaborate, and get feedback from real pros. Climb the High Rollers leaderboard and earn legendary badges.</p>
                    <img src="https://www.themamboguild.com/assets/community-ui.png" alt="The Stage" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:18px auto;border:1px solid #e0e0e0;border-radius:4px;" />

                    <p>Doors open <strong>Wednesday, April 29th</strong>. Keep an eye on your inbox.</p>

                    <p>Pavle<br>
                    Founder, The Mambo Guild</p>

                    <div class="footer">
                        <p>P.S. Want to unlock 'Beta Tester' status early? Invite 3 friends using your unique extraction link:<br>
                        <a href="{referral_link}" class="link">{referral_link}</a></p>
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
                        <p style="font-size: 11px; color: #999;">If you no longer wish to receive these emails, <a href="mailto:pavlepopovic@themamboguild.com?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20mailing%20list." style="color: #999;">click here to unsubscribe</a>.</p>
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
