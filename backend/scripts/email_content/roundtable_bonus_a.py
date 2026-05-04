"""Bonus Roundtable invite — Segment A (waitlisters who never claimed
their account).

One-off cross-cohort invite for the Tue May 5 18:00 UTC bonus
Roundtable. This version is for waitlisters who still need to set a
password — uses the magic link to bypass the registration UX, then
sends them through the trial gate.

Pair: roundtable_bonus_bcd.py (same theme, different gateway copy for
members who already have accounts).
"""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-04T13:00:00Z"

SUBJECT = "Bonus Roundtable tomorrow: how to enter the flow state when you dance"
PREHEADER = "Tue May 5, 18:00 UTC. Open to every subscriber, not just Guild Masters. Studio then Roundtable on the platform."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick one. <strong>Tomorrow, Tuesday May 5, 18:00 UTC</strong>, I am running a <strong>Bonus Roundtable</strong>, and this time it is open to every subscriber, not just Guild Masters.</p>

<h2>Theme: how to enter the flow state when you dance</h2>

<p>That clean state where you stop coaching yourself in your head, stop forcing the count, and actually start dancing. We will break down what to focus on, what to let go of, and how to drop into flow on demand.</p>

<p>Then we apply it directly to <strong>this week's Footwork Challenge in the Community tab</strong>, so you walk away with something to drill, post, and get feedback on.</p>

<p>This Roundtable is normally a <strong>Guild Master</strong> perk (the top tier, called Performer in your account). I am opening it once, for tomorrow's session, so every paid and trial member can sit in.</p>

<h2>How to join, step by step</h2>

<ol>
    <li><strong>Claim your account:</strong> <a href="__MAGIC_LINK__">click this link</a> and set a password. Two minutes.</li>
    <li><strong>Start your 7-day free trial</strong> on the pricing page when prompted. Card required, $0 charged for 7 days, cancel in 2 clicks.</li>
    <li>Click <strong>Studio</strong> in the top nav.</li>
    <li>Click <strong>Roundtable</strong>.</li>
    <li>Hit <strong>Join</strong> and <strong>add it to your calendar</strong> so the reminder fires before 18:00 UTC.</li>
</ol>

<p>That is the only way in. No public link, no shortcut. If you want the seat, the seat is on the platform.</p>

<p>I will see you in the room. Bring the moments where your head got in the way of your feet.</p>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>P.S. The next regular Guild Master Roundtable is locked in for <strong>Wednesday May 13, 18:00 UTC</strong>. Guild Masters, that one is yours as always.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Quick one. Tomorrow, Tuesday May 5, 18:00 UTC, I am running a Bonus Roundtable, and this time it is open to every subscriber, not just Guild Masters.


THEME: HOW TO ENTER THE FLOW STATE WHEN YOU DANCE
-------------------------------------------------
That clean state where you stop coaching yourself in your head, stop forcing the count, and actually start dancing. We will break down what to focus on, what to let go of, and how to drop into flow on demand.

Then we apply it directly to this week's Footwork Challenge in the Community tab, so you walk away with something to drill, post, and get feedback on.

This Roundtable is normally a Guild Master perk (the top tier, called Performer in your account). I am opening it once, for tomorrow's session, so every paid and trial member can sit in.


HOW TO JOIN, STEP BY STEP
-------------------------
1. Claim your account: __MAGIC_LINK__  (set a password, two minutes)
2. Start your 7-day free trial on the pricing page when prompted. Card required, $0 charged for 7 days, cancel in 2 clicks.
3. Click Studio in the top nav.
4. Click Roundtable.
5. Hit Join and add it to your calendar so the reminder fires before 18:00 UTC.

That is the only way in. No public link, no shortcut. If you want the seat, the seat is on the platform.

I will see you in the room. Bring the moments where your head got in the way of your feet.

Pavle

P.S. The next regular Guild Master Roundtable is locked in for Wednesday May 13, 18:00 UTC. Guild Masters, that one is yours as always.
"""
