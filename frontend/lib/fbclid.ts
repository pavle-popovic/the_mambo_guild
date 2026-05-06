/**
 * fbclid + _fbc cookie capture.
 *
 * The Meta Pixel normally sets `_fbc` itself from `?fbclid=…`. This module is
 * a belt-and-braces backup for the case where Pixel JS is blocked (ad-block,
 * tracking protection) but the URL param still survives. We write the cookie
 * in Meta's canonical format (`fb.1.{unixMilliseconds}.{fbclid}`) with a
 * 1-year expiry so CAPI still has the click ID when the user converts hours
 * or days later.
 *
 * Spec note: the timestamp segment MUST be milliseconds. Meta's CAPI
 * diagnostics flag any fbc whose timestamp can be interpreted as before
 * the click ID was created (which is what happens when seconds-based
 * timestamps are interpreted as ms). Mismatch tanks Event Match Quality
 * and ad-spend optimization.
 */

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function captureFbclid(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return;

  const existing = readCookie("_fbc");
  if (existing && existing.includes(fbclid)) return;

  // Meta's _fbc spec requires the timestamp in MILLISECONDS, not seconds.
  // Date.now() already returns ms — do NOT divide by 1000.
  const ts = Date.now();
  writeCookie("_fbc", `fb.1.${ts}.${fbclid}`, ONE_YEAR_SECONDS);
}

export function readFbp(): string | null {
  return readCookie("_fbp");
}

export function readFbc(): string | null {
  return readCookie("_fbc");
}

export function readUtm(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return Object.keys(out).length ? out : null;
}
