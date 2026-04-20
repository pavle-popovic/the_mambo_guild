"""Meta Conversions API (CAPI) dispatcher.

Invoked from ``analytics_service.track_event`` via a FastAPI BackgroundTask
for every event in ``CONVERSION_EVENTS``. Wraps the whole flow in a blanket
try/except — a Meta outage must never propagate back into a Stripe webhook
or auth response.

Docs: https://developers.facebook.com/docs/marketing-api/conversions-api/
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

import httpx

from config import settings
from models import get_session_local
from models.analytics import UserEvent
from utils.meta_user_data import build_user_data

logger = logging.getLogger(__name__)


_GRAPH_URL_TEMPLATE = "https://graph.facebook.com/{version}/{pixel_id}/events"


def _graph_endpoint() -> Optional[str]:
    if not settings.META_PIXEL_ID:
        return None
    return _GRAPH_URL_TEMPLATE.format(
        version=settings.META_API_VERSION,
        pixel_id=settings.META_PIXEL_ID,
    )


def _build_custom_data(
    event_name: str,
    value: Optional[float],
    currency: Optional[str],
    properties: Mapping[str, Any],
) -> dict:
    cd: dict = {}
    if value is not None:
        cd["value"] = float(value)
    if currency:
        cd["currency"] = currency.upper()

    tier = properties.get("tier") or properties.get("content_name")
    if tier:
        cd["content_ids"] = [tier]
        cd["content_type"] = "subscription"

    # predicted_ltv is the Meta-blessed hint for trial starts. Honour an
    # explicit override from properties; otherwise pick the tier's monthly
    # price as a safe lower bound.
    if event_name == "StartTrial":
        predicted = properties.get("predicted_ltv")
        if predicted is None and tier == "advanced":
            predicted = 39.0
        elif predicted is None and tier == "performer":
            predicted = 59.0
        if predicted is not None:
            cd["predicted_ltv"] = float(predicted)

    # Pass through any other Meta-recognised fields without hardcoding.
    for k in ("content_name", "content_category", "num_items", "order_id"):
        if k in properties and k not in cd:
            cd[k] = properties[k]

    return cd


def _build_payload(
    *,
    event_id: str,
    event_name: str,
    event_time: datetime,
    user_data: dict,
    custom_data: dict,
    page_url: Optional[str],
) -> dict:
    event_entry: dict = {
        "event_name": event_name,
        "event_time": int(event_time.timestamp()),
        "event_id": event_id,
        "action_source": "website",
        "user_data": user_data,
    }
    if custom_data:
        event_entry["custom_data"] = custom_data
    if page_url:
        event_entry["event_source_url"] = page_url

    payload: dict = {"data": [event_entry]}
    if settings.META_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.META_TEST_EVENT_CODE
    return payload


def _post_with_retries(url: str, payload: dict, access_token: str) -> httpx.Response:
    """POST with exponential backoff on 5xx only. 4xx means the payload is
    broken — retrying won't help, log and move on."""
    backoff = 1.0
    last_exc: Optional[BaseException] = None
    resp: Optional[httpx.Response] = None
    for attempt in range(3):
        try:
            resp = httpx.post(
                url,
                params={"access_token": access_token},
                json=payload,
                timeout=5.0,
            )
            if resp.status_code < 500:
                return resp
            logger.warning(
                "meta_capi: graph %s on attempt %d — body=%s",
                resp.status_code, attempt + 1, resp.text[:500],
            )
        except httpx.HTTPError as exc:
            last_exc = exc
            logger.warning("meta_capi: network error attempt %d: %s", attempt + 1, exc)
        time.sleep(backoff)
        backoff *= 2
    if resp is not None:
        return resp
    if last_exc is not None:
        raise last_exc
    raise RuntimeError("meta_capi: exhausted retries without response")


def _update_status(event_id: str, status: str) -> None:
    """Background tasks don't share the caller's DB session, so open a
    fresh short-lived one just to stamp the status."""
    SessionLocal = get_session_local()
    session = SessionLocal()
    try:
        row = session.query(UserEvent).filter(UserEvent.event_id == event_id).first()
        if row is None:
            return
        row.capi_status = status
        row.capi_sent_at = datetime.now(timezone.utc)
        session.commit()
    except Exception:
        logger.exception("meta_capi: failed to stamp capi_status for %s", event_id)
        session.rollback()
    finally:
        session.close()


def dispatch_event(
    *,
    event_id: str,
    event_name: str,
    event_time: datetime,
    value: Optional[float],
    currency: Optional[str],
    properties: Mapping[str, Any],
    user_id: Optional[str],
    email: Optional[str],
    first_name: Optional[str],
    last_name: Optional[str],
    client_ip: Optional[str],
    user_agent: Optional[str],
    fbp: Optional[str],
    fbc: Optional[str],
    page_url: Optional[str],
) -> None:
    """Send one event to Meta. Safe to run inside BackgroundTasks — never
    raises; logs on failure and records the outcome on the UserEvent row."""
    try:
        endpoint = _graph_endpoint()
        if endpoint is None or not settings.META_CAPI_ACCESS_TOKEN:
            logger.debug("meta_capi: not configured — skipping dispatch for %s", event_name)
            _update_status(event_id, "skipped")
            return

        user_data = build_user_data(
            email=email,
            first_name=first_name,
            last_name=last_name,
            external_id=user_id,
            client_ip=client_ip,
            user_agent=user_agent,
            fbp=fbp,
            fbc=fbc,
        )
        custom_data = _build_custom_data(event_name, value, currency, properties)
        payload = _build_payload(
            event_id=event_id,
            event_name=event_name,
            event_time=event_time,
            user_data=user_data,
            custom_data=custom_data,
            page_url=page_url,
        )

        resp = _post_with_retries(endpoint, payload, settings.META_CAPI_ACCESS_TOKEN)

        if 200 <= resp.status_code < 300:
            _update_status(event_id, "ok")
        else:
            logger.warning(
                "meta_capi: graph rejected %s (%s) — %s",
                event_name, resp.status_code, resp.text[:500],
            )
            _update_status(event_id, "error")
    except Exception:
        logger.exception("meta_capi: dispatch failed for %s (%s)", event_name, event_id)
        try:
            _update_status(event_id, "error")
        except Exception:
            pass
