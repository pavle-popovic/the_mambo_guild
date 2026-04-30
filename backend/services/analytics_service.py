"""Analytics service — single entry point for every tracked event.

All instrumentation in the codebase funnels through ``track_event``. It:

1. Writes an append-only row to ``user_events`` unconditionally.
2. Forwards the subset of events in ``CONVERSION_EVENTS`` to Meta CAPI via
   FastAPI BackgroundTasks (non-blocking — a Meta outage must never slow a
   Stripe webhook response or a registration request).

Keeping this funnel narrow prevents drift between "what we log for ML" and
"what Meta sees."
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Mapping, Optional

from fastapi import BackgroundTasks, Request
from sqlalchemy.orm import Session

from models.analytics import UserEvent
from models.user import User, UserProfile
from utils.request import client_ip as extract_client_ip

logger = logging.getLogger(__name__)


# Events forwarded to Meta Conversions API. Everything else is ML-only.
# Keep this set tight — every entry costs EMQ attention in Events Manager.
CONVERSION_EVENTS: frozenset[str] = frozenset({
    "PageView",
    "Lead",
    "CompleteRegistration",
    "ViewContent",
    "InitiateCheckout",
    "StartTrial",
    "Subscribe",
    "Purchase",
})

# Events that should carry hashed PII (em/fn/ln) in the CAPI user_data block.
# Low-intent events (PageView, ViewContent) repeat dozens of times per session
# for a logged-in user, so attaching their email to every one tanks Meta's EMQ
# with "duplicate email" warnings without improving attribution. external_id
# + fbp/fbc + IP/UA is sufficient match signal for those surfaces; reserve
# raw PII for the conversions Meta actually optimises against.
PII_EVENTS: frozenset[str] = frozenset({
    "Lead",
    "CompleteRegistration",
    "InitiateCheckout",
    "StartTrial",
    "Subscribe",
    "Purchase",
})


def _read_fbp_cookie(request: Optional[Request]) -> Optional[str]:
    if request is None:
        return None
    return request.cookies.get("_fbp")


def _read_fbc_cookie(request: Optional[Request]) -> Optional[str]:
    if request is None:
        return None
    return request.cookies.get("_fbc")


def track_event(
    db: Session,
    event_name: str,
    *,
    user_id: Optional[uuid.UUID] = None,
    anonymous_id: Optional[str] = None,
    value: Optional[float] = None,
    currency: Optional[str] = None,
    properties: Optional[Mapping[str, Any]] = None,
    request: Optional[Request] = None,
    background_tasks: Optional[BackgroundTasks] = None,
    event_id: Optional[str] = None,
    page_url: Optional[str] = None,
    fbp_override: Optional[str] = None,
    fbc_override: Optional[str] = None,
) -> str:
    """Record an event and (for conversions) queue Meta CAPI dispatch.

    Returns the ``event_id`` so callers can echo it to the browser Pixel
    for server/client dedup.

    Never raises on CAPI or DB errors — analytics must not break the flow
    that produced the event. The caller is expected to have already
    committed the business-domain work (e.g. user row created) before this.
    """
    event_id = event_id or str(uuid.uuid4())
    props = dict(properties or {})

    # Pull request-scoped context. Prefer stored UserProfile fbp/fbc over
    # cookie when the user has a persisted first-touch (covers the case
    # where cookies were cleared between signup and conversion).
    ua = request.headers.get("user-agent") if request else None
    referrer = request.headers.get("referer") if request else None
    ip = extract_client_ip(request) if request else None
    fbp = fbp_override or _read_fbp_cookie(request)
    fbc = fbc_override or _read_fbc_cookie(request)

    if user_id is not None and (fbp is None or fbc is None):
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile is not None:
            fbp = fbp or profile.fbp
            fbc = fbc or profile.fbc

    resolved_page_url = page_url
    if resolved_page_url is None and request is not None:
        # Browser-initiated events send the real page URL via Origin/Referer.
        # Fall back to request.url for server-fired events.
        resolved_page_url = referrer or str(request.url)

    row = UserEvent(
        event_id=event_id,
        user_id=user_id,
        anonymous_id=anonymous_id,
        event_name=event_name,
        value=Decimal(str(value)) if value is not None else None,
        currency=currency.upper() if currency else None,
        properties=props,
        client_ip=ip,
        user_agent=ua,
        fbp=fbp,
        fbc=fbc,
        page_url=resolved_page_url,
        referrer=referrer,
    )

    try:
        db.add(row)
        db.commit()
    except Exception:
        logger.exception("analytics_service: failed to persist %s event", event_name)
        db.rollback()
        return event_id

    if event_name in CONVERSION_EVENTS and background_tasks is not None:
        # Resolve user data eagerly while the session is hot so the background
        # task doesn't have to juggle its own DB session. Only fetch PII for
        # events in PII_EVENTS — see PII_EVENTS docstring above.
        user_email = None
        first_name = None
        last_name = None
        if user_id is not None and event_name in PII_EVENTS:
            user = db.query(User).filter(User.id == user_id).first()
            if user is not None:
                user_email = user.email
                if user.profile is not None:
                    first_name = user.profile.first_name
                    last_name = user.profile.last_name

        from services.meta_capi_service import dispatch_event  # lazy import; breaks circular
        background_tasks.add_task(
            dispatch_event,
            event_id=event_id,
            event_name=event_name,
            event_time=row.created_at or datetime.now(timezone.utc),
            value=value,
            currency=currency,
            properties=props,
            user_id=str(user_id) if user_id else None,
            email=user_email,
            first_name=first_name,
            last_name=last_name,
            client_ip=ip,
            user_agent=ua,
            fbp=fbp,
            fbc=fbc,
            page_url=resolved_page_url,
        )

    return event_id


def capture_first_touch(
    db: Session,
    profile: UserProfile,
    request: Request,
    fbclid: Optional[str] = None,
    utm: Optional[Mapping[str, str]] = None,
    landing_url: Optional[str] = None,
) -> None:
    """Persist first-touch attribution onto the user's profile.

    Called once during registration / waitlist signup. If any of the fields
    are already set (user signed up in a different path that beat us to it),
    we leave them alone — first-touch wins.
    """
    changed = False

    fbp_cookie = _read_fbp_cookie(request)
    if fbp_cookie and not profile.fbp:
        profile.fbp = fbp_cookie
        changed = True

    fbc_cookie = _read_fbc_cookie(request)
    if fbc_cookie and not profile.fbc:
        profile.fbc = fbc_cookie
        changed = True
    elif fbclid and not profile.fbc:
        # Browser may have been blocked from setting _fbc — synthesise it
        # per Meta's canonical format so CAPI still has the click ID.
        ts = int(datetime.now(timezone.utc).timestamp())
        profile.fbc = f"fb.1.{ts}.{fbclid}"
        changed = True

    if utm and not profile.first_touch_utm:
        clean = {k: v for k, v in utm.items() if v}
        if clean:
            profile.first_touch_utm = clean
            changed = True

    if landing_url and not profile.first_touch_landing_url:
        profile.first_touch_landing_url = landing_url[:500]
        changed = True

    referer = request.headers.get("referer")
    if referer and not profile.first_touch_referrer:
        profile.first_touch_referrer = referer[:500]
        changed = True

    if not profile.first_touch_at:
        profile.first_touch_at = datetime.now(timezone.utc)
        changed = True

    if changed:
        try:
            db.add(profile)
            db.commit()
        except Exception:
            logger.exception("analytics_service: failed to persist first-touch attribution")
            db.rollback()
