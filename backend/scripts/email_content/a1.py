"""A1 — May 1, Friday. Soft activation hook (Cha-Cha-Cha unlock)."""

SEGMENT = "A"
SEND_AT_UTC = "2026-05-01T17:00:00Z"

SUBJECT = "A free Bruno Mars choreography is waiting in your account"
PREHEADER = "5 days until Founder Diamond closes. Activation is free, no card."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick update from launch week. The Mambo Guild has been live three days. <strong>100+ dancers have already claimed their accounts and joined the community.</strong></p>

<p>Your account is still on the launch list, unactivated. One click and it is yours, no card needed.</p>

<h2>What unlocks the moment you activate</h2>

<p><strong>Bruno Mars Cha-Cha-Cha.</strong> Full frame-by-frame breakdown, mirrored teaching view, captions in 16 languages. This one is free for every account holder. Trial or not, it is yours forever.</p>

<h2>What you also get if you start the free 7-day trial before May 6, 18:00 UTC</h2>

<div style="text-align: center; margin: 16px 0;">
    <img src="https://www.themamboguild.com/badges/founder_diamond.png" alt="Founder Diamond Badge" width="120" style="width: 120px; height: auto; display: inline-block;">
</div>

<ul>
    <li><strong>Founder Diamond.</strong> The permanent badge only the first 300 founders ever receive. After May 6 the badge is gone from the platform forever.</li>
    <li><strong>$39/month locked in for the life of your subscription.</strong> The price only goes up from here.</li>
    <li><strong>Full Vault.</strong> 500+ classes across Mambo, Pachanga, Salsa History, and Effective Training Science.</li>
</ul>

<p>Trial needs a card. Nothing charged for 7 days. Cancel in 2 clicks before day 8.</p>

<div class="cta-wrap">
    <a href="__MAGIC_LINK__" class="cta">Activate my account</a>
    <div class="cta-sub">Free Cha-Cha-Cha included with any account, no card.</div>
</div>

<p style="margin-top: 32px;">Pavle<br>
Founder, The Mambo Guild</p>

<p style="font-size: 13px; color: #666; margin-top: 24px;"><em>PS. Even if you skip the trial entirely, activating still unlocks the Cha-Cha-Cha. There is no reason to wait.</em></p>
"""

BODY_TEXT = """Hi __USERNAME__,

Quick update from launch week. The Mambo Guild has been live three days. 100+ dancers have already claimed their accounts and joined the community.

Your account is still on the launch list, unactivated. One click and it is yours, no card needed.


WHAT UNLOCKS THE MOMENT YOU ACTIVATE
-------------------------------------
Bruno Mars Cha-Cha-Cha. Full frame-by-frame breakdown, mirrored teaching view, captions in 16 languages. Free for every account holder, trial or not.


WHAT YOU ALSO GET IF YOU START THE FREE 7-DAY TRIAL BEFORE MAY 6, 18:00 UTC
---------------------------------------------------------------------------
- Founder Diamond. The permanent badge only the first 300 founders ever receive. After May 6 it is gone from the platform forever.
- $39/month locked in for the life of your subscription. The price only goes up from here.
- Full Vault. 500+ classes across Mambo, Pachanga, Salsa History, and Effective Training Science.

Trial needs a card. Nothing charged for 7 days. Cancel in 2 clicks before day 8.


ACTIVATE MY ACCOUNT
__MAGIC_LINK__


Pavle
Founder, The Mambo Guild

PS. Even if you skip the trial entirely, activating still unlocks the Cha-Cha-Cha. There is no reason to wait.
"""
