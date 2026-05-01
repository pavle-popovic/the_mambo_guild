"""B2 — May 3, Sunday. Testimonial-led objection handling."""

SEGMENT = "B"
SEND_AT_UTC = "2026-05-03T17:00:00Z"

SUBJECT = "Words from the dancers already inside"
PREHEADER = "Three quotes that might address whatever is keeping you on the fence."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>You activated your account but have not started the 7-day trial yet. I do not know what is keeping you on the fence, but a few quotes from members already inside might help (initials only, all real members):</p>

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

<p>The trial is genuinely no-risk. Card on file, $0 charged for 7 days, cancel in 2 clicks before day 8 (no form, no human, no resistance). If you stay past day 7, $39/month locks in for the lifetime of your subscription.</p>

<div class="scarcity">
    <strong>3 days until the Founder Diamond closes</strong> (Wednesday May 6 at 18:00 UTC, permanent badge, first 300 founders only).
</div>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial</a>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Reply to this email if you have a specific concern about the trial. I read every one and reply within 24 hours.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

You activated your account but have not started the 7-day trial yet. I do not know what is keeping you on the fence, but a few quotes from members already inside might help (initials only, all real members):


E.S., instructor with 10 years of teaching:
"Blows all other platforms out of the water. Clear, no fillers. I will be a lifetime member for sure."


L.T., 10+ years dancing Cuban styles, new to On2:
"I accomplished Mambo 101 almost in 3 days."


D.M., Vanguard tester:
"It actually feels like it is invested in your growth. A refreshing change from the usual watch-and-repeat platforms."


The trial is genuinely no-risk. Card on file, $0 charged for 7 days, cancel in 2 clicks before day 8 (no form, no human, no resistance). If you stay past day 7, $39/month locks in for the lifetime of your subscription.

3 DAYS UNTIL THE FOUNDER DIAMOND CLOSES
(Wednesday May 6 at 18:00 UTC, permanent badge, first 300 founders only.)


START MY 7-DAY TRIAL
__FRONTEND_URL__/pricing


Pavle

PS. Reply to this email if you have a specific concern about the trial. I read every one and reply within 24 hours.
"""
