import { APPS_SCRIPT_URL, FALLBACK_CONFIRMED } from "../config";

export interface RegistrationPayload {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:00"
  name: string;
  phone: string;
}

export interface EventData {
  confirmed: Record<string, string[]>;
  totalRaised: number;
}

const FALLBACK_EVENT_DATA: EventData = { confirmed: FALLBACK_CONFIRMED, totalRaised: 0 };

// GET is a "simple" cross-origin request, so no CORS preflight is involved
// and Apps Script's response is readable as-is.
//
// Cache-busted with a timestamp query param, and `cache: "no-store"" on top
// — Apps Script Web App GET responses can otherwise get cached (by the
// browser, or at Google's edge), which shows up as "I confirmed a booking
// but the site still doesn't show the name."
//
// Returns null when the request fails (Apps Script is occasionally slow or
// errors for a moment). The caller keeps whatever it last showed instead of
// resetting the donation total to $0 and emptying the schedule — which is
// what used to happen when a single 30s poll failed.
export async function fetchEventData(): Promise<EventData | null> {
  if (!APPS_SCRIPT_URL) return FALLBACK_EVENT_DATA;
  try {
    const url = `${APPS_SCRIPT_URL}?_=${Date.now()}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data.totalRaised !== "number" || typeof data.confirmed !== "object") return null;
    return { confirmed: data.confirmed ?? {}, totalRaised: data.totalRaised };
  } catch {
    return null;
  }
}

// Sent as text/plain (not application/json) so this also stays a "simple"
// request — Apps Script Web Apps don't handle the OPTIONS preflight that a
// application/json POST would trigger. doPost parses the body as JSON itself.
export async function submitRegistration(payload: RegistrationPayload): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}
