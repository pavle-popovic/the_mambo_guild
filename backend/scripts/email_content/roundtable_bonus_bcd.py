"""Bonus Roundtable invite — Segments B + C + D combined.

For everyone who already has a real account: lapsed activated (B), in
trial (C), or paying (D). Skip the claim-account / set-password step;
they already have credentials.

Pair: roundtable_bonus_a.py (same theme, magic-link gateway for
waitlisters who never claimed their account).

Same theme + footer as the A version so the room shares one
narrative — only the "how to join" step list differs.
"""

SEGMENT = "BCD"
SEND_AT_UTC = "2026-05-04T13:00:00Z"

SUBJECT = "Bonus Roundtable tomorrow: how to enter the flow state when you dance"
PREHEADER = "Tue May 5, 18:00 UTC. Open to every subscriber, not just Guild Masters. Studio then Roundtable on the platform."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick one. <strong>Tomorrow, Tuesday May 5, 18:00 UTC</strong>, I am running a <strong>Bonus Roundtable</strong>, and this time it is open to every subscriber, not just Guild Masters.</p>

<h2>Theme: how to enter the flow state when you dance</h2>

<p>That clean state where you stop coaching yourself in your head, stop forcing the count, and actually start dancing. We will break down what to focus on, what to let go of, and how to drop into flow on demand.</p>

<p>Then we apply it directly to <strong>this week's Footwork Challenge in the Community tab</strong>, so you walk away with something to drill, post, and get feedback on.</p>

<p>This Roundtable is normally a <strong>Guild Master</strong> perk (the top tier, called Performer in your account). I am opening it once, for tomorrow's session, so every paid and trial member can sit in.</p>

<h2>How to join</h2>

<ol>
    <li><strong>Log in</strong> at <a href="__FRONTEND_URL__/login">themamboguild.com/login</a>.</li>
    <li>If you are not on a trial or subscription yet, you will be prompted at the door — start your 7-day free trial. Card required, $0 charged for 7 days, cancel in 2 clicks.</li>
    <li>Click <strong>Studio</strong> in the top nav.</li>
    <li>Click <strong>Roundtable</strong>.</li>
    <li>Hit <strong>Join</strong> and <strong>add it to your calendar</strong> so the reminder fires before 18:00 UTC.</li>
</ol>

<p>That is the only way in. No public link, no shortcut.</p>

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


HOW TO JOIN
-----------
1. Log in at __FRONTEND_URL__/login
2. If you are not on a trial or subscription yet, you will be prompted at the door — start your 7-day free trial. Card required, $0 charged for 7 days, cancel in 2 clicks.
3. Click Studio in the top nav.
4. Click Roundtable.
5. Hit Join and add it to your calendar so the reminder fires before 18:00 UTC.

That is the only way in. No public link, no shortcut.

I will see you in the room. Bring the moments where your head got in the way of your feet.

Pavle

P.S. The next regular Guild Master Roundtable is locked in for Wednesday May 13, 18:00 UTC. Guild Masters, that one is yours as always.
"""
