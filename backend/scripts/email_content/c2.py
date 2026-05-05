"""C2 — May 4, Monday. Trialer mid-trial check-in / feature discovery."""

SEGMENT = "C"
SEND_AT_UTC = "2026-05-04T17:00:00Z"

SUBJECT = "Have you tried the Skill Tree yet?"
PREHEADER = "3 trial days left, plus the Roundtable is Wednesday."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick check-in. You are 3-4 days into your trial.</p>

<p>If you have not yet, three things worth trying before the trial ends:</p>

<ul>
    <li><strong>The Skill Tree.</strong> Your personalized path through the Vault. Tells you exactly what to learn next based on what you have already completed. No more "what do I do tonight?" decisions.</li>
    <li><strong>A/B Loop on any video.</strong> Set point A, set point B, the player loops just that section. Best for tightening a specific count or transition you keep flubbing.</li>
    <li><strong>The Roundtable.</strong> Wednesday weekly Zoom session with me. Open Q&amp;A, technique deep-dive, occasional surprise guest. Members only.</li>
</ul>

<p>The Move of the Week challenge in the community wraps up Saturday with the first winner. If you want to jump in, record your version of the move and post it on The Stage before then.</p>

<p>Your trial converts on day 8 at $39/month. As a Founder, your $39 rate stays locked even when the public price goes up. Cancel anytime in 2 clicks, no questions asked, no commitment.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/community" class="cta">Open the community</a>
</div>

<p style="margin-top: 32px;">Pavle</p>
"""

BODY_TEXT = """Hi __USERNAME__,

Quick check-in. You are 3-4 days into your trial.

If you have not yet, three things worth trying before the trial ends:

- The Skill Tree. Your personalized path through the Vault. Tells you exactly what to learn next based on what you have already completed. No more "what do I do tonight?" decisions.

- A/B Loop on any video. Set point A, set point B, the player loops just that section. Best for tightening a specific count or transition you keep flubbing.

- The Roundtable. Wednesday weekly Zoom session with me. Open Q&A, technique deep-dive, occasional surprise guest. Members only.

The Move of the Week challenge in the community wraps up Saturday with the first winner. If you want to jump in, record your version of the move and post it on The Stage before then.

Your trial converts on day 8 at $39/month. As a Founder, your $39 rate stays locked even when the public price goes up. Cancel anytime in 2 clicks, no questions asked, no commitment.


OPEN THE COMMUNITY
__FRONTEND_URL__/community


Pavle
"""
