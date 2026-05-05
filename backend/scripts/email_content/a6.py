"""A6 — May 6, Wednesday. Final call, deadline extended to 06:00 UTC May 7.

Pivoted from "6 hours" -> "end of the day" framing after Pavle moved
the Founder Diamond cutoff to Wed 08:00 Rome (06:00 UTC May 7) to give
the US audience the rest of their day to act.
"""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-06T12:00:00Z"

SUBJECT = "Last day to claim your Founder Diamond"
PREHEADER = "Closes overnight: Wed 8am Rome / 2am NYC / 11pm Tue LA. Take your time."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<h1>You have the end of the day.</h1>

<div style="text-align: center; margin: 18px 0 18px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="140" style="width: 140px; height: auto; display: inline-block;">
</div>

<p>The Founder Diamond closes overnight. After that, the badge is gone for good. <strong>This is the final email.</strong></p>

<p>The exact cutoff is <strong>Wednesday May 7 at 06:00 UTC</strong>, which is:</p>
<ul>
    <li><strong>8am Rome</strong> (Wed morning)</li>
    <li><strong>2am New York</strong> (Wed, late tonight)</li>
    <li><strong>11pm Los Angeles</strong> (Tue, end of today)</li>
</ul>

<h2>If you start your 7-day free trial before then</h2>
<ul>
    <li>Founder Diamond locked in</li>
    <li>$39/month, locked at this rate (cancel anytime in 2 clicks, no questions asked)</li>
    <li>Full Vault, Skill Tree, Stage, Roundtable</li>
</ul>

<h2>If you start after</h2>
<ul>
    <li>Same Vault, Skill Tree, Stage, Roundtable</li>
    <li>Same $39/month founder price (still locked in if you join soon, the public price rises in August)</li>
    <li><strong>No Founder Diamond, ever</strong></li>
</ul>

<div class="cta-wrap">
    <a href="__MAGIC_LINK__" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. If you decide to skip the trial, your free Rookie account is still worth activating. <a href="__MAGIC_LINK__">Activate Rookie</a>, takes one minute.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

YOU HAVE THE END OF THE DAY.

The Founder Diamond closes overnight. After that, the badge is gone for good. This is the final email.

The exact cutoff is Wednesday May 7 at 06:00 UTC, which is:
- 8am Rome (Wed morning)
- 2am New York (Wed, late tonight)
- 11pm Los Angeles (Tue, end of today)


IF YOU START YOUR 7-DAY FREE TRIAL BEFORE THEN
----------------------------------------------
- Founder Diamond locked in
- $39/month, locked at this rate (cancel anytime in 2 clicks, no questions asked)
- Full Vault, Skill Tree, Stage, Roundtable


IF YOU START AFTER
------------------
- Same Vault, Skill Tree, Stage, Roundtable
- Same $39/month founder price (still locked in if you join soon, the public price rises in August)
- NO FOUNDER DIAMOND, EVER


START MY 7-DAY TRIAL
__MAGIC_LINK__

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. If you decide to skip the trial, your free Rookie account is still worth activating. Use the link above, takes one minute.
"""
