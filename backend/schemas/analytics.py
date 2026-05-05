"""Pydantic schemas for the analytics track endpoint."""
from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class TrackEventRequest(BaseModel):
    event_id: str = Field(..., min_length=1, max_length=64)
    event_name: str = Field(..., min_length=1, max_length=64)
    value: Optional[float] = None
    currency: Optional[str] = Field(default=None, max_length=3)
    properties: dict[str, Any] = Field(default_factory=dict)
    page_url: Optional[str] = Field(default=None, max_length=500)
    anonymous_id: Optional[str] = Field(default=None, max_length=64)
    # Meta browser/click cookies forwarded explicitly because they're scoped
    # to the frontend domain and don't reach the cross-origin backend via
    # the cookie jar. Generous bounds prevent abuse-via-huge-strings; both
    # are opaque IDs Meta validates server-side.
    fbp: Optional[str] = Field(default=None, max_length=128)
    fbc: Optional[str] = Field(default=None, max_length=256)


class TrackEventResponse(BaseModel):
    event_id: str
    status: str = "ok"
