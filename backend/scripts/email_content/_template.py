"""Shared HTML + text wrapper for all May 2026 Founder Week emails.

Same visual system as the day-2 broadcast (Georgia serif, cream bg,
gold-gradient CTA). Don't change the CSS without testing on Gmail
mobile + Apple Mail dark mode + Outlook desktop.
"""

HTML_HEAD = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>__SUBJECT__</title>
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
        a { color: #5a4a10; }
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
        .quote { background: #fafaf6; border-left: 3px solid #888;
                 padding: 12px 18px; margin: 12px 0; font-style: italic;
                 font-size: 14px; color: #444; }
        .footer { margin-top: 44px; font-size: 12px; color: #888;
                  font-style: italic; font-family: Arial, sans-serif;
                  border-top: 1px solid #e0e0e0; padding-top: 18px; }
        .footer a { color: #888; }
    </style>
</head>
<body>
    <div class="preheader">__PREHEADER__</div>
    <div class="container">
"""

HTML_FOOT = """
        <div class="footer">
            <p>If the activation link expires before you click, you can request a fresh one at <a href="__FORGOT_URL__">themamboguild.com/forgot-password</a> using this email address.</p>
            <p>You are receiving this because you joined the waitlist for The Mambo Guild.</p>
            <p style="font-size: 11px;"><a href="mailto:pavlepopovic@themamboguild.com?subject=Unsubscribe&body=Please%20remove%20me%20from%20the%20mailing%20list.">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>"""


TEXT_FOOT = """

---
If the activation link expires before you click, you can request a fresh one at __FORGOT_URL__ using this email address.

You are receiving this because you joined the waitlist for The Mambo Guild.
To unsubscribe, reply with "Unsubscribe" in the subject line.
"""


def wrap_html(body: str, subject: str, preheader: str) -> str:
    """Wrap an email body in the shared HTML template.

    Body content includes the salutation, content blocks, and signature
    BUT NOT the outer <html><body> or the footer. The footer (with the
    unsubscribe + token-expired-fallback link) is appended automatically.
    """
    head = (
        HTML_HEAD
        .replace("__SUBJECT__", subject)
        .replace("__PREHEADER__", preheader)
    )
    return head + body + HTML_FOOT


def wrap_text(body: str) -> str:
    """Append the shared text-mode footer."""
    return body + TEXT_FOOT
