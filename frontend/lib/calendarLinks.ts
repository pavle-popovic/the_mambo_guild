/**
 * Calendar link helpers for the Roundtable "Add to calendar" buttons.
 *
 * We deliberately avoid a full Google Calendar API / OAuth integration. The
 * admin pastes a Google Meet URL into the Live Meetings tab; members get a
 * one-click button that opens a prefilled Google Calendar event-create
 * dialog, plus an .ics download for Apple / Outlook / Proton users.
 */

export interface CalendarEventInput {
  title: string;
  startUtcIso: string;
  durationMinutes?: number;
  description?: string;
  location?: string;
}

const DEFAULT_DURATION_MINUTES = 60;

function toCalendarStamp(iso: string): string {
  // YYYYMMDDTHHMMSSZ — the format both Google Calendar render URLs and ICS
  // files expect for UTC timestamps.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function computeEndIso(startIso: string, minutes: number): string {
  return new Date(new Date(startIso).getTime() + minutes * 60_000).toISOString();
}

export function buildGoogleCalendarUrl({
  title,
  startUtcIso,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  description = "",
  location = "",
}: CalendarEventInput): string {
  const endUtcIso = computeEndIso(startUtcIso, durationMinutes);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalendarStamp(startUtcIso)}/${toCalendarStamp(endUtcIso)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsBlobUrl({
  title,
  startUtcIso,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  description = "",
  location = "",
}: CalendarEventInput): string {
  const endUtcIso = computeEndIso(startUtcIso, durationMinutes);
  const uid = `roundtable-${toCalendarStamp(startUtcIso)}@mamboguild.com`;
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mambo Guild//Roundtable//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarStamp(new Date().toISOString())}`,
    `DTSTART:${toCalendarStamp(startUtcIso)}`,
    `DTEND:${toCalendarStamp(endUtcIso)}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(location)}`,
    location ? `URL:${location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const ics = lines.join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}
