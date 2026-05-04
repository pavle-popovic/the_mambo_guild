"""B1 — May 1, Friday. Activated-no-trial: acknowledge + soft trial nudge."""

SEGMENT = "BW"
SEND_AT_UTC = "2026-05-01T17:00:00Z"

SUBJECT = "You're in, just one screen left"
PREHEADER = "The Vault is one click away. Founder Diamond closes May 6."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>You activated your account but did not start the trial. Totally fine, it is optional. But I wanted to share what you would unlock if you do.</p>

<p>The 7-day free trial gives you full Vault access (500+ classes), the Skill Tree, posting rights on The Stage, and the Move of the Week challenge in the community.</p>

<h2>Two things to know about the trial</h2>

<ul>
    <li><strong>Card required, nothing charged for 7 days.</strong> Stripe needs a payment method to open the trial. Day 0 you pay $0. Day 7 you can cancel in 2 clicks from your account, no human, no form, no friction. If you stay past day 7, $39/month auto-bills (locked in for life as a Founder).</li>
    <li><strong>Founder Diamond closes May 6 at 18:00 UTC.</strong> Permanent badge, first 300 founders only. After Wednesday it is gone from the platform forever.</li>
</ul>

<div style="text-align: center; margin: 24px 0 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">You are already activated. This takes maybe 90 seconds.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. If the only thing holding you back is the card-on-file, that is a Linear / Cursor / Vercel pattern at this point. The reason: it is the only way to test "what would my actual experience be on day 8" without an artificial paywall in the middle.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

You activated your account but did not start the trial. Totally fine, it is optional. But I wanted to share what you would unlock if you do.

The 7-day free trial gives you full Vault access (500+ classes), the Skill Tree, posting rights on The Stage, and the Move of the Week challenge in the community.


TWO THINGS TO KNOW ABOUT THE TRIAL
----------------------------------
1) Card required, nothing charged for 7 days. Stripe needs a payment method to open the trial. Day 0 you pay $0. Day 7 you can cancel in 2 clicks from your account, no human, no form, no friction. If you stay past day 7, $39/month auto-bills (locked in for life as a Founder).

2) Founder Diamond closes May 6 at 18:00 UTC. Permanent badge, first 300 founders only. After Wednesday it is gone from the platform forever.


START MY 7-DAY TRIAL
__FRONTEND_URL__/pricing

You are already activated. This takes maybe 90 seconds.


Pavle

PS. If the only thing holding you back is the card-on-file, that is a Linear / Cursor / Vercel pattern at this point. The reason: it is the only way to test "what would my actual experience be on day 8" without an artificial paywall in the middle.
"""
