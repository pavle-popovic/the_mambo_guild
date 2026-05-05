"""C1 — Sunday May 3. MotW as the centerpiece for in-trial users."""

SEGMENT = "C"
SEND_AT_UTC = "2026-05-03T17:00:00Z"

SUBJECT = "Move of the Week is up. Go win it."
PREHEADER = "Casual challenge in the community. You're already in, jump in if you want."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Welcome to the Guild. You're inside.</p>

<p>Just posted the first Move of the Week in the community:</p>

<div class="quote">
Little casual competition for you guys. Learn the move, post your version on The Stage. My favourite gets 100 Claves to spend in the Guild Store and a feature in my Instagram Story, if you want it. No pressure, just for fun. I pick the winner Saturday. :D
</div>

<p>You have full access. Jump in if you feel like it.</p>

<h2>A few other places worth visiting in your trial week</h2>

<p><strong>The Vault.</strong> 500+ classes. Watch the Bruno Mars Cha-Cha-Cha breakdown first, it shows the teaching method better than any words I could write.</p>

<p><strong>The Skill Tree.</strong> Your personalized path through the Vault. No more "what do I do tonight?" decisions.</p>

<p><strong>The Roundtable.</strong> Wednesday weekly Zoom session with me. Open Q&amp;A, technique deep-dive, occasional surprise guest.</p>

<p>Your trial converts on day 8 at $39/month. As a Founder, your $39 rate stays locked even when the public price goes up. Cancel anytime in 2 clicks, no questions asked, no commitment.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/community" class="cta">Open the community</a>
    <div class="cta-sub">Move of the Week post is at the top of the feed.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Got a question about the platform or your dancing? Hit reply. I read every email.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Welcome to the Guild. You're inside.

Just posted the first Move of the Week in the community:

"Little casual competition for you guys. Learn the move, post your version on The Stage. My favourite gets 100 Claves to spend in the Guild Store and a feature in my Instagram Story, if you want it. No pressure, just for fun. I pick the winner Saturday. :D"

You have full access. Jump in if you feel like it.


A FEW OTHER PLACES WORTH VISITING IN YOUR TRIAL WEEK
----------------------------------------------------
The Vault. 500+ classes. Watch the Bruno Mars Cha-Cha-Cha breakdown first, it shows the teaching method better than any words I could write.

The Skill Tree. Your personalized path through the Vault. No more "what do I do tonight?" decisions.

The Roundtable. Wednesday weekly Zoom session with me. Open Q&A, technique deep-dive, occasional surprise guest.

Your trial converts on day 8 at $39/month. As a Founder, your $39 rate stays locked even when the public price goes up. Cancel anytime in 2 clicks, no questions asked, no commitment.


OPEN THE COMMUNITY
__FRONTEND_URL__/community

Move of the Week post is at the top of the feed.


Pavle

PS. Got a question about the platform or your dancing? Hit reply. I read every email.
"""
