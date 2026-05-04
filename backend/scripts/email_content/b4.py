"""B4 — May 6, Wednesday 12:00 UTC. Final 6-hour for activated-no-trial."""

SEGMENT = "BW"
SEND_AT_UTC = "2026-05-06T12:00:00Z"

SUBJECT = "6 hours"
PREHEADER = "Founder Diamond closes at 18:00 UTC today. No more emails after this."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<h1>6 hours.</h1>

<div style="text-align: center; margin: 18px 0 18px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="140" style="width: 140px; height: auto; display: inline-block;">
</div>

<p><strong>6 hours until the Founder Diamond closes for good.</strong></p>

<p>You activated. You verified. The only step left is the trial start. It takes 90 seconds.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial, 6 hours left</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. After 18:00 UTC tonight, the trial is still available, the Vault is still available, $39/month is still available. The Founder Diamond is the only thing that is actually one-way.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

6 HOURS.

6 hours until the Founder Diamond closes for good.

You activated. You verified. The only step left is the trial start. It takes 90 seconds.


START MY 7-DAY TRIAL, 6 HOURS LEFT
__FRONTEND_URL__/pricing

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. After 18:00 UTC tonight, the trial is still available, the Vault is still available, $39/month is still available. The Founder Diamond is the only thing that is actually one-way.
"""
