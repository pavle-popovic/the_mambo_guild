"""Live Masterclass invite, Segment A.

For waitlisters who never claimed their account. Uses the magic link
to bypass the registration UX, then sends them through the trial
gate to the platform.

Pair: roundtable_bonus_bcd.py (same theme, log-in version for members
who already have accounts).
"""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-04T13:00:00Z"

SUBJECT = "Live Masterclass Tomorrow: how to enter flow state when you dance"
PREHEADER = "Tue May 5, 18:00 UTC. Open to every member, on the platform."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Pavle here. Quick one.</p>

<p><strong>Tomorrow, Tuesday May 5, 18:00 UTC</strong>, I am running a <strong>Live Masterclass on entering flow state when you dance.</strong> Normally this slot is my weekly Guild Master Roundtable (Performer tier only). For tomorrow's session I am opening it up to every paid and trial member.</p>

<h2>What we will cover</h2>

<p>That state where you stop getting overwhelmed, and actually start dancing. We go through what to focus on, what to ignore, and how to find flow when your head gets noisy on the floor.</p>

<p>Then we apply it to <strong>this week's Footwork Challenge in the Community tab</strong>. You leave with one specific thing to drill, post, and get feedback on.</p>

<h2>How to join</h2>

<ol>
    <li><strong>Claim your account:</strong> <a href="__MAGIC_LINK__">click this link</a> and set a password. Two minutes.</li>
    <li><strong>Start your 7-day free trial</strong> on the pricing page when prompted. Card required, $0 charged for 7 days, cancel in 2 clicks.</li>
    <li>Click <strong>Studio</strong> in the top nav.</li>
    <li>Click <strong>The Roundtable</strong>.</li>
    <li>Hit <strong>Join Meeting</strong> and add it to your calendar.</li>
</ol>

<p style="text-align: center; margin: 8px 0 24px 0;">
    <img src="https://www.themamboguild.com/assets/roundtable-location.png" alt="Where to find The Roundtable in the Studio dropdown" width="520" style="width:100%;max-width:520px;height:auto;display:block;margin:0 auto;border:1px solid #e0e0e0;border-radius:6px;" />
    <span style="display:block;font-size:12px;color:#777;margin-top:6px;font-family:Arial,sans-serif;">Studio menu, top right of the nav. The Roundtable is the live calls and archives item.</span>
</p>


<p>See you tomorrow.</p>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>P.S. The next regular Guild Masters only Roundtable is back on <strong>Wednesday May 13 at 18:00 UTC</strong>.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Pavle here. Quick one.

Tomorrow, Tuesday May 5, 18:00 UTC, I am running a Live Masterclass on entering flow state when you dance. Normally this slot is my weekly Guild Master Roundtable (Performer tier only). For tomorrow's session I am opening it up to every paid and trial member.


WHAT WE WILL COVER
------------------
That state where you stop getting overwhelmed, and actually start dancing. We go through what to focus on, what to ignore, and how to find flow when your head gets noisy on the floor.

Then we apply it to this week's Footwork Challenge in the Community tab. You leave with one specific thing to drill, post, and get feedback on.


HOW TO JOIN
-----------
1. Claim your account: __MAGIC_LINK__  (set a password, two minutes)
2. Start your 7-day free trial on the pricing page when prompted. Card required, $0 charged for 7 days, cancel in 2 clicks.
3. Click Studio in the top nav.
4. Click The Roundtable.
5. Hit Join Meeting and add it to your calendar.

Where to find it: Studio menu in the top nav (top right). The Roundtable is the "live calls and archives" item.

The link lives only on the platform, behind the trial gate. No public link.

See you tomorrow.

Pavle

P.S. The next regular Guild Masters only Roundtable is back on Wednesday May 13 at 18:00 UTC.
"""
