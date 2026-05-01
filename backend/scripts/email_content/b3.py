"""B3 — May 5, Tuesday. 24-hour reminder for activated-no-trial."""

SEGMENT = "B"
SEND_AT_UTC = "2026-05-05T17:00:00Z"

SUBJECT = "24 hours, and one screen between you and the badge"
PREHEADER = "Tomorrow 18:00 UTC the gate closes."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<h1>24 hours.</h1>

<p>Tomorrow Wednesday May 6 at 18:00 UTC, the Founder Diamond closes permanently. You are activated but not on the trial yet, meaning you are literally <strong>one screen</strong> away from securing the badge.</p>

<p>The trial is no-risk. Card required (Stripe minimum), $0 charged for 7 days, cancel in 2 clicks before day 8 if it is not for you.</p>

<p>If you stay past day 7: $39/month locked in for the lifetime of your subscription.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial</a>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Final reminder going out tomorrow morning. After that, no more emails about this.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

24 HOURS.

Tomorrow Wednesday May 6 at 18:00 UTC, the Founder Diamond closes permanently. You are activated but not on the trial yet, meaning you are literally one screen away from securing the badge.

The trial is no-risk. Card required (Stripe minimum), $0 charged for 7 days, cancel in 2 clicks before day 8 if it is not for you.

If you stay past day 7: $39/month locked in for the lifetime of your subscription.


START MY 7-DAY TRIAL
__FRONTEND_URL__/pricing


Pavle

PS. Final reminder going out tomorrow morning. After that, no more emails about this.
"""
