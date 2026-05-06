"""Meta Advanced Matching — PII normalisation + SHA-256 hashing.

Meta's spec: hash PII fields with SHA-256 after lowercasing and trimming.
Empty values must be OMITTED, not sent as empty strings (Meta rejects
empties and it tanks EMQ).
"""
from __future__ import annotations

import hashlib
import re
from typing import Optional


def _hash(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalised = value.strip().lower()
    if not normalised:
        return None
    return hashlib.sha256(normalised.encode("utf-8")).hexdigest()


def hash_email(email: Optional[str]) -> Optional[str]:
    return _hash(email)


def hash_phone(phone: Optional[str]) -> Optional[str]:
    """Phone numbers: strip everything non-digit, THEN hash.

    Meta expects the phone in its raw international format without leading
    '+' or spacing. We don't have phone collection yet, but keeping the helper
    so the instrumentation is ready when we do.
    """
    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
    if not digits:
        return None
    return hashlib.sha256(digits.encode("utf-8")).hexdigest()


def hash_name(name: Optional[str]) -> Optional[str]:
    return _hash(name)


def hash_external_id(user_id: Optional[str]) -> Optional[str]:
    """External ID is the stable user key — per Meta's spec it's hashed the
    same way as other PII (lowercased + trimmed + sha256)."""
    return _hash(user_id)


# Boundary between a Unix-seconds timestamp and a Unix-milliseconds timestamp.
# 10^11 = year 5138 if interpreted as ms, year 1973 if interpreted as seconds.
# Anything below this MUST be a seconds value that needs scaling up to ms.
_FBC_TS_MS_THRESHOLD = 10**11


def normalize_fbc(fbc: Optional[str]) -> Optional[str]:
    """Coerce the timestamp segment of an _fbc string to MILLISECONDS.

    Meta's _fbc canonical format is ``fb.{subdomainIndex}.{creationTimeMs}.{fbclid}``
    where ``creationTimeMs`` is Unix time in MILLISECONDS. Older revisions of
    this codebase (and Meta's own pixel JS in some configurations) wrote
    seconds-based timestamps, which Meta's CAPI diagnostics flag as
    ``creationTime invalid (before click ID created)`` because the value is
    interpreted as ms and lands in the early 1970s.

    This helper is applied only at CAPI dispatch — it never mutates stored
    state. Legacy rows in ``user_profiles.fbc`` and currently-live ``_fbc``
    cookies in user browsers stay untouched; only what we send to Meta is
    normalized. Forward writes already use ms.

    Behavior:
      - None / empty input        -> returned unchanged
      - Malformed (not 4 segments) -> returned unchanged (Meta will reject cleanly)
      - Non-integer timestamp      -> returned unchanged
      - Seconds-magnitude timestamp -> scaled by 1000 to ms
      - Already-ms timestamp        -> returned unchanged
    """
    if not fbc:
        return fbc
    parts = fbc.split(".")
    if len(parts) != 4 or parts[0] != "fb":
        return fbc
    try:
        ts = int(parts[2])
    except (ValueError, TypeError):
        return fbc
    if ts <= 0:
        return fbc
    if ts < _FBC_TS_MS_THRESHOLD:
        ts *= 1000
        return f"{parts[0]}.{parts[1]}.{ts}.{parts[3]}"
    return fbc


def build_user_data(
    *,
    email: Optional[str],
    first_name: Optional[str],
    last_name: Optional[str],
    external_id: Optional[str],
    client_ip: Optional[str],
    user_agent: Optional[str],
    fbp: Optional[str],
    fbc: Optional[str],
    phone: Optional[str] = None,
) -> dict:
    """Assemble the Meta ``user_data`` block with only non-null entries.

    Each hashed PII field must be wrapped in a single-element list per Meta's
    API shape (they support multiple values per field; we only ever have one).
    """
    out: dict = {}

    if em := hash_email(email):
        out["em"] = [em]
    if ph := hash_phone(phone):
        out["ph"] = [ph]
    if fn := hash_name(first_name):
        out["fn"] = [fn]
    if ln := hash_name(last_name):
        out["ln"] = [ln]
    if ext := hash_external_id(external_id):
        out["external_id"] = [ext]

    # IP + UA are sent un-hashed by design — this matches Meta's spec.
    if client_ip:
        out["client_ip_address"] = client_ip
    if user_agent:
        out["client_user_agent"] = user_agent
    if fbp:
        out["fbp"] = fbp
    # fbc is normalized to milliseconds at dispatch — see normalize_fbc().
    # Legacy seconds-based values from older code paths get fixed up
    # transparently here without touching stored state.
    if fbc:
        normalized = normalize_fbc(fbc)
        if normalized:
            out["fbc"] = normalized

    return out
