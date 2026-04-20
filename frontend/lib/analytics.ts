/**
 * Client-side analytics track() — fires to Meta Pixel AND the backend
 * /api/analytics/track endpoint using a SHARED event_id so Meta dedupes the
 * pair to a single counted conversion.
 *
 * Server-generated event_ids (e.g. the CompleteRegistration fired inside
 * POST /api/auth/register) get echoed here via the `eventId` option so the
 * client-side fbq pixel call pairs with the authoritative server event.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function generateEventId(): string {
  // Prefer the standard crypto API where available.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface TrackOptions {
  eventId?: string;
  value?: number;
  currency?: string;
  properties?: Record<string, unknown>;
  anonymousId?: string;
}

export interface TrackedEvent {
  eventId: string;
}

/**
 * Track a conversion-ish event. Safe to call anywhere in the app — falls back
 * silently if Pixel hasn't loaded yet or the backend is unreachable.
 */
export function track(eventName: string, options: TrackOptions = {}): TrackedEvent {
  const eventId = options.eventId ?? generateEventId();
  const { value, currency, properties, anonymousId } = options;

  const customData: Record<string, unknown> = { ...(properties ?? {}) };
  if (value !== undefined) customData.value = value;
  if (currency) customData.currency = currency;

  // Fire browser Pixel (Meta dedupes on eventID against CAPI).
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", eventName, customData, { eventID: eventId });
    } catch {
      // fbq errors must never break the app.
    }
  }

  // POST the same event to the backend so CAPI gets the server-side copy.
  const payload = {
    event_id: eventId,
    event_name: eventName,
    value,
    currency,
    properties: properties ?? {},
    anonymous_id: anonymousId,
    page_url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  const url = `${API_BASE_URL}/api/analytics/track`;
  const body = JSON.stringify(payload);

  // Use sendBeacon on page-unload paths so the event reliably lands.
  const beaconSent =
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function" &&
    document.visibilityState === "hidden"
      ? navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
      : false;

  if (!beaconSent) {
    void fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Never surface a tracking error to the user.
    });
  }

  return { eventId };
}

/**
 * Echo a server-generated event_id through the browser Pixel. Used after
 * POST /register / /create-checkout-session / /waitlist, where the server
 * writes the authoritative row and returns the id.
 */
export function echoServerEvent(
  eventName: string,
  serverEventId: string | null | undefined,
  customData: Record<string, unknown> = {}
): void {
  if (!serverEventId) return;
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", eventName, customData, { eventID: serverEventId });
  } catch {
    // ignored
  }
}
