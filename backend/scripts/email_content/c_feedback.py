"""C feedback check-in: how is the trial going? Reply with anything.

Deliberately soft. No upsell, no CTA, no link to anywhere. Just a
conversation opener so trialers feel heard. Sending a sales-flavored
email mid-trial is the fastest way to spike cancellations; this is
the opposite — pure listening posture.
"""

SEGMENT = "C"
SEND_AT_UTC = "2026-05-06T13:00:00Z"

SUBJECT = "How did you find the Guild so far?"
PREHEADER = "Quick check-in. Hit reply with anything, good or bad. I read every email."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Pavle here. Quick check-in.</p>

<p>You have spent some time in the Guild and I am genuinely curious how you have found it so far.</p>

<p>If you are loving something, tell me which lesson clicked. If you are stuck, tell me where. If something is broken, tell me what. If something is missing, tell me what you wish was there.</p>

<p>Just hit reply. No template, no form, no rating scale. I read every single email myself and the answers shape what I build next.</p>

<p>Thank you for being here, I sincerely appreciate the support.</p>

<p style="margin-top: 24px;">Pavle</p>
"""

BODY_TEXT = """Hi __USERNAME__,

Pavle here. Quick check-in.

You have spent some time in the Guild and I am genuinely curious how you have found it so far.

If you are loving something, tell me which lesson clicked. If you are stuck, tell me where. If something is broken, tell me what. If something is missing, tell me what you wish was there.

Just hit reply. No template, no form, no rating scale. I read every single email myself and the answers shape what I build next.

Thank you for being here, I sincerely appreciate the support.

Pavle
"""
