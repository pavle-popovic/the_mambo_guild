"""A2 — May 2, Saturday. Move of the Week reveal, soft framing."""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-02T14:00:00Z"

SUBJECT = "The first Move of the Week is opening in the community"
PREHEADER = "Casual challenge, optional. Winner crowned next Saturday."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick heads-up. I am opening the first <strong>Move of the Week</strong> challenge in the community this weekend.</p>

<p>How it works: I post a specific move in the community tab. Members who want to take part record their version and post it on The Stage. Next Saturday I pick a winner.</p>

<h2>The winner gets, if they want to take part</h2>

<ul>
    <li>Featured in my Instagram Story</li>
    <li><strong>100 Claves</strong>, the in-platform currency you can spend on cosmetics, account upgrades, or 1-to-1 video feedback from me</li>
    <li>The first ever Move of the Week title on their profile</li>
</ul>

<p>The community + The Stage are paid-tier features, so participation is open to members on a Pro trial or higher. Casual, low-pressure, just for the dancers who feel like jumping in.</p>

<div style="text-align: center; margin: 24px 0 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<p>Starting your free 7-day trial before <strong>May 6 at 18:00 UTC</strong> also locks in the <strong>Founder Diamond</strong>, the permanent badge gated to the first 300 founders only.</p>

<div class="cta-wrap">
    <a href="__MAGIC_LINK__" class="cta">Start my 7-day trial</a>
    <div class="cta-sub">Card required. Nothing charged for 7 days. Cancel in 2 clicks before day 8.</div>
</div>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Even without a trial, you can activate your free Rookie account and watch how the challenge plays out.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Quick heads-up. I am opening the first Move of the Week challenge in the community this weekend.

How it works: I post a specific move in the community tab. Members who want to take part record their version and post it on The Stage. Next Saturday I pick a winner.


THE WINNER GETS, IF THEY WANT TO TAKE PART
------------------------------------------
- Featured in my Instagram Story
- 100 Claves, the in-platform currency you can spend on cosmetics, account upgrades, or 1-to-1 video feedback from me
- The first ever Move of the Week title on their profile

The community and The Stage are paid-tier features, so participation is open to members on a Pro trial or higher. Casual, low-pressure, just for the dancers who feel like jumping in.

Starting your free 7-day trial before May 6 at 18:00 UTC also locks in the Founder Diamond, the permanent badge gated to the first 300 founders only.


START MY 7-DAY TRIAL
__MAGIC_LINK__

Card required. Nothing charged for 7 days. Cancel in 2 clicks before day 8.


Pavle

PS. Even without a trial, you can activate your free Rookie account and watch how the challenge plays out.
"""
