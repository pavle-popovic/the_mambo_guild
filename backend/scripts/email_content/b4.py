"""B4 — May 6, Wednesday. Final call for activated-no-trial.

Pivoted from "6 hours" -> "end of the day" framing after Pavle moved
the Founder Badge cutoff to Wed 08:00 Rome (06:00 UTC May 7) to give
the US audience the rest of their day to act.
"""

SEGMENT = "BW"
SEND_AT_UTC = "2026-05-06T12:00:00Z"

SUBJECT = "Last day to claim your Founder Badge"
PREHEADER = "Closes overnight: Wed 8am Rome / 2am NYC / 11pm Tue LA. Take your time."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<h1>You have the end of the day.</h1>

<div style="text-align: center; margin: 18px 0 18px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Badge Badge" width="140" style="width: 140px; height: auto; display: inline-block;">
</div>

<p>The Founder Badge closes overnight. After that, the badge is gone for good.</p>

<p>The exact cutoff is <strong>Wednesday May 7 at 06:00 UTC</strong>:</p>
<ul>
    <li><strong>8am Rome</strong> (Wed morning)</li>
    <li><strong>2am New York</strong> (Wed, late tonight)</li>
    <li><strong>11pm Los Angeles</strong> (Tue, end of today)</li>
</ul>

<p>You activated. You verified. The only step left is the trial start. It takes 90 seconds.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. After the cutoff, the trial is still available, the Vault is still available, $39/month is still available. The Founder Badge is the only thing that is actually one-way.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

YOU HAVE THE END OF THE DAY.

The Founder Badge closes overnight. After that, the badge is gone for good.

The exact cutoff is Wednesday May 7 at 06:00 UTC:
- 8am Rome (Wed morning)
- 2am New York (Wed, late tonight)
- 11pm Los Angeles (Tue, end of today)

You activated. You verified. The only step left is the trial start. It takes 90 seconds.


START MY 7-DAY TRIAL
__FRONTEND_URL__/pricing

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. After the cutoff, the trial is still available, the Vault is still available, $39/month is still available. The Founder Badge is the only thing that is actually one-way.
"""
