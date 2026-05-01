"""A6 — May 6, Wednesday 12:00 UTC. Final 6-hour call."""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-06T12:00:00Z"

SUBJECT = "6 hours"
PREHEADER = "Founder Diamond closes at 18:00 UTC today. No more emails after this."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<h1>6 hours.</h1>

<div style="text-align: center; margin: 18px 0 18px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="140" style="width: 140px; height: auto; display: inline-block;">
</div>

<p>At 18:00 UTC today the Founder Diamond closes for good. <strong>This is the final email.</strong></p>

<h2>If you start your 7-day free trial before then</h2>

<ul>
    <li>Founder Diamond locked in</li>
    <li>$39/month for the lifetime of your subscription</li>
    <li>Full Vault, Skill Tree, Stage, Roundtable</li>
</ul>

<h2>If you start after 18:00 UTC today</h2>

<ul>
    <li>Same Vault, Skill Tree, Stage, Roundtable</li>
    <li>Same $39/month founder price (still locked in if you join soon, the public price rises in August)</li>
    <li><strong>No Founder Diamond, ever</strong></li>
</ul>

<div class="cta-wrap">
    <a href="__MAGIC_LINK__" class="cta">Start my 7-day trial, 6 hours left</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. If you decide to skip the trial, your free Rookie account is still worth activating. The Bruno Mars Cha-Cha-Cha is yours forever, no card. <a href="__MAGIC_LINK__">Activate Rookie</a>.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

6 HOURS.

At 18:00 UTC today the Founder Diamond closes for good. This is the final email.


IF YOU START YOUR 7-DAY FREE TRIAL BEFORE THEN
----------------------------------------------
- Founder Diamond locked in
- $39/month for the lifetime of your subscription
- Full Vault, Skill Tree, Stage, Roundtable


IF YOU START AFTER 18:00 UTC TODAY
-----------------------------------
- Same Vault, Skill Tree, Stage, Roundtable
- Same $39/month founder price (still locked in if you join soon, the public price rises in August)
- NO FOUNDER DIAMOND, EVER


START MY 7-DAY TRIAL, 6 HOURS LEFT
__MAGIC_LINK__

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. If you decide to skip the trial, your free Rookie account is still worth activating. The Bruno Mars Cha-Cha-Cha is yours forever, no card. Activate at the link above.
"""
