"""B48h — May 4, Monday. Founder Badge 48-hour reminder for Segment B.

Mirrors a4.py (the waitlister version) but addressed to people who
already activated their account from the waitlist signup but never
started a subscription. Same Founder Badge stakes, different "how to
start" instructions because they already have credentials, just need
to log in and start the trial.

Slot in the B series:
  b1   May 1   "You're in, just one screen left"
  b2   May 3   "Move of the Week is live"
  b48h May 4   <-- this email, 48-hour Founder Badge nudge
  b3   May 5   "24 hours and one screen..."
  b4   May 6   "6 hours" final
"""

SEGMENT = "B"
SEND_AT_UTC = "2026-05-04T17:00:00Z"

SUBJECT = "48 Hours left to claim your Founder Badge!"
PREHEADER = "Closes Wed 6 May, 18:00 UTC. First 300 only, no second chances."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Pavle here. Quick personal note.</p>

<div style="text-align: center; margin: 24px 0 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<p>In <strong>48 hours</strong> the Founder Diamond closes. After Wednesday May 6 at 18:00 UTC, no one ever gets that badge again. It will sit in the codebase as a relic of the platform's first week.</p>

<p>You already created your account from the waitlist, which means the badge is one click away. You just have not started your trial yet. The badge is gated on starting a subscription before the deadline, capped at the first 300 Founders.</p>

<p>I built the Mambo Guild because I was tired of seeing beginners getting discouraged by poor teaching methods and toxic, ego-driven communities. Two times European Champion, certified in Learning Experience Design and Gamification, and the dancers who joined the early waitlist told me the same story over and over: they wanted clarity, structure, and a place that felt like a real community.</p>

<p>That is what the Vault, the Skill Tree, and the Stage are built to be. A few words from members who have been inside (initials only, real people):</p>

<div class="quote">
    <strong>R.P.</strong>, beginner:<br>
    "The clearest instruction I have come across so far. Pavle's teaching method is optimized for online learning."
</div>

<div class="quote">
    <strong>D.M.</strong>, Vanguard tester:<br>
    "It actually feels like it is invested in your growth. A refreshing change from the usual watch-and-repeat platforms."
</div>

<p>The free 7-day trial is your no-risk way to test whether it actually delivers. Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.</p>

<p>If you start before Wednesday at 18:00 UTC, you are a Founder. If not, that ship sails.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/pricing" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Account is already yours, just log in and pick a tier.</div>
</div>

<p>If you have questions or hesitation, hit reply. I read every single one.</p>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. This is not a "now or never" sales line. The Guild will be here for years. The Founder Diamond is genuinely the only piece that will not come back.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Pavle here. Quick personal note.

In 48 hours the Founder Diamond closes. After Wednesday May 6 at 18:00 UTC, no one ever gets that badge again. It will sit in the codebase as a relic of the platform's first week.

You already created your account from the waitlist, which means the badge is one click away. You just have not started your trial yet. The badge is gated on starting a subscription before the deadline, capped at the first 300 Founders.

I built the Mambo Guild because I was tired of seeing beginners getting discouraged by poor teaching methods and toxic, ego-driven communities. Two times European Champion, certified in Learning Experience Design and Gamification, and the dancers who joined the early waitlist told me the same story over and over: they wanted clarity, structure, and a place that felt like a real community.

That is what the Vault, the Skill Tree, and the Stage are built to be. A few words from members who have been inside (initials only, real people):


R.P., beginner:
"The clearest instruction I have come across so far. Pavle's teaching method is optimized for online learning."


D.M., Vanguard tester:
"It actually feels like it is invested in your growth. A refreshing change from the usual watch-and-repeat platforms."


The free 7-day trial is your no-risk way to test whether it actually delivers. Card required, $0 charged for 7 days, cancel in 2 clicks before day 8.

If you start before Wednesday at 18:00 UTC, you are a Founder. If not, that ship sails.


START MY 7-DAY TRIAL
__FRONTEND_URL__/pricing

Account is already yours, just log in and pick a tier.


If you have questions or hesitation, hit reply. I read every single one.


Pavle

PS. This is not a "now or never" sales line. The Guild will be here for years. The Founder Diamond is genuinely the only piece that will not come back.
"""
