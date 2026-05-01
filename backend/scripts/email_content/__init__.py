"""May 2026 Founder Week campaign — pre-staged email content.

Each email module exposes:
  SEGMENT      — "A" | "B" | "C"
  SEND_AT_UTC  — recommended send time (ISO 8601, for documentation)
  SUBJECT      — email subject line
  PREHEADER    — preview text shown after subject in inbox
  BODY_HTML    — inner HTML (gets wrapped by _template.HTML_HEAD/FOOT at send)
  BODY_TEXT    — plain-text mirror

Placeholder tokens replaced at send time by broadcast.py:
  __USERNAME__      — recipient's username
  __MAGIC_LINK__    — per-user signed activation URL (Segment A only)
  __FRONTEND_URL__  — base URL of themamboguild.com (Segment B/C use direct paths)
  __PREHEADER__     — preheader (in HTML head, hidden div)
  __FORGOT_URL__    — /forgot-password URL (in footer)

Segment SQL filters live in broadcast.py.
"""
