"""A5 — May 5, Tuesday. 24-hour alarm."""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-05T17:00:00Z"

SUBJECT = "24 hours until the Founder Diamond closes"
PREHEADER = "Tomorrow at 18:00 UTC the badge disappears from the platform forever."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<h1>24 hours.</h1>

<div style="text-align: center; margin: 18px 0 18px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="140" style="width: 140px; height: auto; display: inline-block;">
</div>

<p>Tomorrow Wednesday May 6 at 18:00 UTC, the Founder Diamond gate closes permanently. The badge is gated on:</p>

<ol>
    <li>Being a waitlist member (you are)</li>
    <li>Starting a 7-day free trial before tomorrow at 18:00 UTC (you have not yet)</li>
</ol>

<p>After tomorrow, the only people on the platform with that badge are the dancers who claimed it during launch week. <strong>No one else, ever.</strong></p>

<p>Everything else about the Guild (the Vault, the Skill Tree, the Stage, the Roundtable) will stay available indefinitely. But the Founder Diamond is genuinely permanent and one-time.</p>

<div class="cta-wrap">
    <a href="__MAGIC_LINK__" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Final reminder going out tomorrow morning before the deadline. After that, no more emails about this.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

24 HOURS.

Tomorrow Wednesday May 6 at 18:00 UTC, the Founder Diamond gate closes permanently. The badge is gated on:

1. Being a waitlist member (you are)
2. Starting a 7-day free trial before tomorrow at 18:00 UTC (you have not yet)

After tomorrow, the only people on the platform with that badge are the dancers who claimed it during launch week. No one else, ever.

Everything else about the Guild (the Vault, the Skill Tree, the Stage, the Roundtable) will stay available indefinitely. But the Founder Diamond is genuinely permanent and one-time.


START MY 7-DAY TRIAL
__MAGIC_LINK__

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. Final reminder going out tomorrow morning before the deadline. After that, no more emails about this.
"""
