"""C3 — May 6, Wednesday 12:00 UTC. Trialer share-with-friends ask."""

SEGMENT = "C"
SEND_AT_UTC = "2026-05-06T12:00:00Z"

SUBJECT = "Today's the last day of Founder Diamond, share with your dance partners"
PREHEADER = "Your seat is locked in. 6 hours for friends to join you."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick note for trial members.</p>

<div style="text-align: center; margin: 16px 0 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<p>You are already locked in for the Founder Diamond. Your trial start before today's deadline secures it. <strong>Today is the final day for anyone else.</strong></p>

<p>If you have dance partners or training buddies who have not joined the Guild yet, today is the cutoff. After 18:00 UTC the badge disappears from the platform for new members forever.</p>

<p>Forward this link:</p>

<div class="cta-wrap">
    <a href="__FRONTEND_URL__" class="cta">themamboguild.com</a>
</div>

<p>Hundreds of dancers have already claimed their accounts during launch week. The Vault is filling up with first lessons, the Skill Tree is mapping out paths, and the first Move of the Week wraps up Saturday with the first winner crowned.</p>

<p>Whatever happens at 18:00 UTC, you are a Founder. Welcome to the Guild.</p>

<p style="margin-top: 32px;">Pavle</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. The next Move of the Week opens Sunday. Get your camera ready.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Quick note for trial members.

You are already locked in for the Founder Diamond. Your trial start before today's deadline secures it. Today is the final day for anyone else.

If you have dance partners or training buddies who have not joined the Guild yet, today is the cutoff. After 18:00 UTC the badge disappears from the platform for new members forever.

Forward this link:
__FRONTEND_URL__


Hundreds of dancers have already claimed their accounts during launch week. The Vault is filling up with first lessons, the Skill Tree is mapping out paths, and the first Move of the Week wraps up Saturday with the first winner crowned.

Whatever happens at 18:00 UTC, you are a Founder. Welcome to the Guild.


Pavle

PS. The next Move of the Week opens Sunday. Get your camera ready.
"""
