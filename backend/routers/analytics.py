"""Browser-initiated analytics events — PageView, ViewContent, InitiateCheckout.

Browser sends ``event_id`` that it ALSO used for ``fbq('track', …, { eventID })``.
We record the server-side row with that same id so Meta can dedupe the pair
(Pixel + CAPI).
"""
from __future__ import annotations

import csv
import io
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from dependencies import get_admin_user, get_current_user_optional
from models import get_db
from models.analytics import UserEvent
from models.user import User
from schemas.analytics import TrackEventRequest, TrackEventResponse
from services.analytics_service import track_event
from services.redis_service import check_rate_limit
from utils.request import client_ip as extract_client_ip

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/track", response_model=TrackEventResponse)
def track(
    payload: TrackEventRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> TrackEventResponse:
    # Rate limit per IP — keeps anonymous pixel traffic from being abused as
    # a free write endpoint. Authenticated users get the same ceiling; this
    # is analytics, not interaction. 600/min (10/sec) is generous for a single
    # session yet still chokes obvious bot abuse — sized so ad-driven bursts
    # behind shared NAT (mobile carriers, office IPs) don't drop CAPI events
    # and tank Pixel-vs-CAPI coverage in Meta Events Manager.
    ip = extract_client_ip(request)
    if not check_rate_limit(ip, "analytics_track", max_requests=600, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many analytics events from this IP.",
        )

    user_id = current_user.id if current_user else None

    track_event(
        db=db,
        event_name=payload.event_name,
        user_id=user_id,
        anonymous_id=payload.anonymous_id,
        value=payload.value,
        currency=payload.currency,
        properties=payload.properties,
        request=request,
        background_tasks=background_tasks,
        event_id=payload.event_id,
        page_url=payload.page_url,
        fbp_override=payload.fbp,
        fbc_override=payload.fbc,
    )

    return TrackEventResponse(event_id=payload.event_id)


@router.get("/export/events.csv")
def export_events_csv(
    since_days: int = Query(30, ge=1, le=365),
    event_name: Optional[str] = Query(None),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Export `user_events` as CSV for offline ML analysis.

    Admin-only. Streams so large exports don't buffer the whole table into memory.
    Columns are flat; `properties` JSONB is serialised as a JSON string — let
    the consumer (pandas / DuckDB) parse it on read.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=since_days)

    query = (
        db.query(UserEvent)
        .filter(UserEvent.created_at >= cutoff)
        .order_by(UserEvent.created_at.asc())
    )
    if event_name:
        query = query.filter(UserEvent.event_name == event_name)

    def row_iter():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "event_id",
            "created_at",
            "user_id",
            "anonymous_id",
            "event_name",
            "value",
            "currency",
            "properties",
            "page_url",
            "referrer",
            "capi_status",
        ])
        yield buf.getvalue()
        buf.seek(0); buf.truncate(0)

        import json as _json
        for row in query.yield_per(1000):
            writer.writerow([
                str(row.event_id),
                row.created_at.isoformat() if row.created_at else "",
                str(row.user_id) if row.user_id else "",
                row.anonymous_id or "",
                row.event_name,
                str(row.value) if row.value is not None else "",
                row.currency or "",
                _json.dumps(row.properties or {}, separators=(",", ":")),
                row.page_url or "",
                row.referrer or "",
                row.capi_status or "",
            ])
            yield buf.getvalue()
            buf.seek(0); buf.truncate(0)

    filename = f"user_events_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        row_iter(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
