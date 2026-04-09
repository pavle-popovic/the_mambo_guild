"""Timezone-aware date helpers.

Streak computation previously mixed `datetime.now(timezone.utc).date()` in
`gamification_service` with `date.today()` (server local time — whatever
Railway's container wall-clock is) in `streak_service`. Users in negative
UTC offsets could lose their streak at 4pm local because the server had
already rolled over to the next day.

`user_local_today` is the single source of truth for "what day is it for
this user". Falls back to UTC if the profile has no timezone set or if the
stored value is invalid.
"""
from datetime import date, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from typing import Optional


_UTC = ZoneInfo("UTC")


def _resolve_tz(tz_name: Optional[str]) -> ZoneInfo:
    if not tz_name:
        return _UTC
    try:
        return ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        return _UTC


def user_local_today(profile) -> date:
    """Return the current date in the user's local timezone.

    `profile` is a UserProfile (has optional .timezone attr). Safe to call
    with any object — falls back to UTC if the attr is missing or invalid.
    """
    tz = _resolve_tz(getattr(profile, "timezone", None))
    return datetime.now(tz).date()


def user_local_now(profile) -> datetime:
    """Timezone-aware 'now' in the user's local timezone."""
    tz = _resolve_tz(getattr(profile, "timezone", None))
    return datetime.now(tz)
