"""Same-day schedule update for the 2026-05-05 Live Masterclass.

Studio availability moved the start 30 minutes earlier, from 18:00 UTC
to 17:30 UTC. Goes to every paying or trialing member (Segments C + D).
B is excluded since they have no subscription and were not in the
Live Masterclass invite audience to begin with.

The recording goes up in the Roundtable tab right after, so anyone
who cannot make the new time is still covered.
"""

SEGMENT = "CD"
SEND_AT_UTC = "2026-05-05T13:00:00Z"

SUBJECT = "Live Masterclass moves to 17:30 UTC today (30 min earlier)"
PREHEADER = "Studio availability nudged it half an hour sooner. Recording goes up after."

BODY_HTML = """<p>Hi __USERNAME__,</p>

<p>Quick logistics update.</p>

<p><strong>Today's Live Masterclass on flow state moves 30 minutes earlier, to 17:30 UTC.</strong> Studio availability did not give me the original 18:00 slot. Same date, same place on the platform (Studio then The Roundtable), just half an hour sooner.</p>

<p>If you cannot make the new time, no problem at all. The session will be recorded and live in the Roundtable tab right after, so you can watch it whenever works.</p>

<p>See you in the room,</p>

<p style="margin-top: 12px;">Pavle</p>
"""

BODY_TEXT = """Hi __USERNAME__,

Quick logistics update.

Today's Live Masterclass on flow state moves 30 minutes earlier, to 17:30 UTC. Studio availability did not give me the original 18:00 slot. Same date, same place on the platform (Studio then The Roundtable), just half an hour sooner.

If you cannot make the new time, no problem at all. The session will be recorded and live in the Roundtable tab right after, so you can watch it whenever works.

See you in the room,

Pavle
"""
