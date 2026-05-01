"""A3 — May 3, Sunday. Testimonial-led social proof, no specific stats."""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-03T17:00:00Z"

SUBJECT = "Here is what dancers inside the Guild are saying"
PREHEADER = "3 days until Founder Diamond closes. Real words from real members."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Day five since launch. <strong>Hundreds of dancers have already claimed their accounts</strong>, and a chunk of them are inside on the 7-day trial.</p>

<p>Here is what some of them are saying (initials only, all real members):</p>

<div class="quote">
    <strong>E.S.</strong>, instructor with 10 years of teaching:<br>
    "Blows all other platforms out of the water. Clear, no fillers. I will be a lifetime member for sure."
</div>

<div class="quote">
    <strong>L.T.</strong>, 10+ years dancing Cuban styles, new to On2:<br>
    "I accomplished Mambo 101 almost in 3 days. Thank you Pavle for building such a game for us."
</div>

<div class="quote">
    <strong>M.C.</strong>, tried 3 online schools before:<br>
    "Pavle does a great job breaking down the moves, and the mirrored view is an innovative approach. Highly recommend."
</div>

<div class="quote">
    <strong>A.N.</strong>, Vanguard tester:<br>
    "It did not feel like just a course, it felt like being part of a community."
</div>

<div style="text-align: center; margin: 24px 0 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<div class="scarcity">
    <strong>Founder Diamond closes Wednesday May 6 at 18:00 UTC.</strong> The badge is gated to the first 300 founders only. After Wednesday, no one ever gets that badge again.
</div>

<div class="cta-wrap">
    <a href="__MAGIC_LINK__" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. If the trial is not right for you, your free Rookie account still unlocks the Bruno Mars Cha-Cha-Cha forever. Activate either way.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Day five since launch. Hundreds of dancers have already claimed their accounts, and a chunk of them are inside on the 7-day trial.

Here is what some of them are saying (initials only, all real members):


E.S., instructor with 10 years of teaching:
"Blows all other platforms out of the water. Clear, no fillers. I will be a lifetime member for sure."


L.T., 10+ years dancing Cuban styles, new to On2:
"I accomplished Mambo 101 almost in 3 days. Thank you Pavle for building such a game for us."


M.C., tried 3 online schools before:
"Pavle does a great job breaking down the moves, and the mirrored view is an innovative approach. Highly recommend."


A.N., Vanguard tester:
"It did not feel like just a course, it felt like being part of a community."


FOUNDER DIAMOND CLOSES WEDNESDAY MAY 6 AT 18:00 UTC
---------------------------------------------------
The badge is gated to the first 300 founders only. After Wednesday, no one ever gets that badge again.


START MY 7-DAY TRIAL
__MAGIC_LINK__

Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.


Pavle

PS. If the trial is not right for you, your free Rookie account still unlocks the Bruno Mars Cha-Cha-Cha forever. Activate either way.
"""
