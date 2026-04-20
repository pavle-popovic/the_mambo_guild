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
    if fbc:
        out["fbc"] = fbc

    return out
