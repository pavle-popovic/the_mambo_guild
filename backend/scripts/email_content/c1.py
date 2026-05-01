"""C1 — May 2, Saturday. Trialer onboarding / first-value moves."""

SEGMENT = "C"
SEND_AT_UTC = "2026-05-02T14:00:00Z"

SUBJECT = "Your trial is on, here's where to start"
PREHEADER = "Three places to land first inside the Guild."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Welcome to the Guild. <strong>You are inside.</strong></p>

<p>A few suggestions for your first 24 hours:</p>

<ol>
    <li><strong>Watch the Bruno Mars Cha-Cha-Cha breakdown.</strong> It is the cleanest 8-minute showcase of the platform's teaching method (frame-by-frame, mirrored view, A/B loops). Even if you do not dance Cha-Cha-Cha, the technique style transfers to everything else.</li>
    <li><strong>Open the Skill Tree.</strong> Pick a starting node based on your level. The path from "first basic step" to "advanced choreography" is structured so you always know what is next.</li>
    <li><strong>Check the Move of the Week challenge in the community tab.</strong> I am opening the first one this weekend. If you want to take part, record your version of the move and post it on The Stage. I crown the first winner next Saturday. Casual, low-pressure, just for the dancers who feel like jumping in.</li>
</ol>

<p>You have full access to all of this for the next 7 days. Day 8, $39/month auto-bills. As a Founder, that is locked in for the lifetime of your subscription. Cancel anytime in 2 clicks if it is not for you.</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__/courses" class="cta">Open the Vault</a>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Got a question about the platform or your dancing? Hit reply. I read every email.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Welcome to the Guild. You are inside.

A few suggestions for your first 24 hours:

1. Watch the Bruno Mars Cha-Cha-Cha breakdown. It is the cleanest 8-minute showcase of the platform's teaching method (frame-by-frame, mirrored view, A/B loops). Even if you do not dance Cha-Cha-Cha, the technique style transfers to everything else.

2. Open the Skill Tree. Pick a starting node based on your level. The path from "first basic step" to "advanced choreography" is structured so you always know what is next.

3. Check the Move of the Week challenge in the community tab. I am opening the first one this weekend. If you want to take part, record your version of the move and post it on The Stage. I crown the first winner next Saturday. Casual, low-pressure, just for the dancers who feel like jumping in.

You have full access to all of this for the next 7 days. Day 8, $39/month auto-bills. As a Founder, that is locked in for the lifetime of your subscription. Cancel anytime in 2 clicks if it is not for you.


OPEN THE VAULT
__FRONTEND_URL__/courses


Pavle

PS. Got a question about the platform or your dancing? Hit reply. I read every email.
"""
