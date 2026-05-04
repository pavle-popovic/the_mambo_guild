"""B2 — Sunday May 3. MotW lead + testimonials for activated-no-trial."""

SEGMENT = "B"
SEND_AT_UTC = "2026-05-03T17:00:00Z"

SUBJECT = "Move of the Week is live. You're one screen away."
PREHEADER = "Casual community challenge, plus what dancers inside are saying."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Just posted the first Move of the Week in the community.</p>

<div class="quote">
Little casual competition for you guys. Learn the move, post your version on The Stage. My favourite gets 100 Claves to spend in the Guild Store and a feature in my Instagram Story, if you want it. No pressure, just for fun. I pick the winner Saturday. :D
</div>

<p>You activated your account already. One screen between you and the trial that opens up The Stage.</p>

<h2>What dancers already inside are saying</h2>

<div class="quote">
    <strong>E.S.</strong>, instructor with 10 years of teaching:<br>
    "Blows all other platforms out of the water. Clear, no fillers. I will be a lifetime member for sure."
</div>

<div class="quote">
    <strong>L.T.</strong>, 10+ years dancing Cuban styles, new to On2:<br>
    "I accomplished Mambo 101 almost in 3 days."
</div>

<div class="quote">
    <strong>D.M.</strong>, Vanguard tester:<br>
    "It actually feels like it is invested in your growth. A refreshing change from the usual watch-and-repeat platforms."
</div>

<div style="text-align: center; margin: 24px 0 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<div class="scarcity">
    <strong>3 days until the Founder Diamond closes</strong> (Wednesday May 6 at 18:00 UTC, permanent badge, first 300 founders only).
</div>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Reply to this email if you have a specific concern about the trial. I read every one and reply within 24 hours.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Just posted the first Move of the Week in the community.

"Little casual competition for you guys. Learn the move, post your version on The Stage. My favourite gets 100 Claves to spend in the Guild Store and a feature in my Instagram Story, if you want it. No pressure, just for fun. I pick the winner Saturday. :D"

You activated your account already. One screen between you and the trial that opens up The Stage.


WHAT DANCERS ALREADY INSIDE ARE SAYING
--------------------------------------
E.S., instructor with 10 years of teaching:
"Blows all other platforms out of the water. Clear, no fillers. I will be a lifetime member for sure."

L.T., 10+ years dancing Cuban styles, new to On2:
"I accomplished Mambo 101 almost in 3 days."

D.M., Vanguard tester:
"It actually feels like it is invested in your growth. A refreshing change from the usual watch-and-repeat platforms."


3 DAYS UNTIL THE FOUNDER DIAMOND CLOSES
(Wednesday May 6 at 18:00 UTC, permanent badge, first 300 founders only.)


START MY 7-DAY TRIAL
__FRONTEND_URL__/pricing

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. Reply to this email if you have a specific concern about the trial. I read every one and reply within 24 hours.
"""
