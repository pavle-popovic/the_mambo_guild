"""
Email service for sending transactional emails using Resend.
"""
import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

try:
    from resend import Resend
    resend_client = Resend(api_key=settings.RESEND_API_KEY) if settings.RESEND_API_KEY else None
    if not settings.RESEND_API_KEY:
        logger.info("Resend API key not configured. Email functionality will be disabled.")
except ImportError:
    logger.warning("Resend package not installed. Email functionality will be disabled.")
    resend_client = None


def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email with a secure token link.
    
    Args:
        email: User's email address
        reset_token: Secure token for password reset
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not resend_client:
        logger.error("Resend client not configured. Cannot send email.")
        return False
    
    if not settings.RESEND_API_KEY:
        logger.error("RESEND_API_KEY not set. Cannot send email.")
        return False
    
    try:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        # Replace with your actual Resend email domain
        from_email = "onboarding@resend.dev"
        
        result = resend_client.emails.send({
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

