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

// Same-origin, CDN-cached copy of the Apps Script data (see
// api/event-data.js) — answers in milliseconds instead of Apps Script's
// 1–3s. Only exists on Vercel, so local dev (`npm run dev`) falls back to
// asking Apps Script directly.
const CACHED_EVENT_DATA_URL = "/api/event-data";

// Last good data, remembered in the browser so a returning visitor's
// counter can start immediately instead of waiting for the network.
const STORAGE_KEY = "everest-event-data";

function parseEventData(data: unknown): EventData | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { confirmed?: unknown; totalRaised?: unknown };
  if (typeof d.totalRaised !== "number" || !d.confirmed || typeof d.confirmed !== "object") return null;
  return { confirmed: d.confirmed as Record<string, string[]>, totalRaised: d.totalRaised };
}

export function loadCachedEventData(): EventData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseEventData(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function saveCachedEventData(data: EventData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private mode / storage blocked — just skip remembering.
  }
}

async function getJson(url: string): Promise<EventData | null> {
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    return parseEventData(await res.json());
  } catch {
    return null;
  }
}

// Returns null when every source fails (Apps Script is occasionally slow or
// errors for a moment). The caller keeps whatever it last showed instead of
// resetting the donation total to $0 and emptying the schedule.
//
// The direct Apps Script request is cache-busted with a timestamp — its GET
// responses can otherwise get cached, which shows up as "I confirmed a
// booking but the site still doesn't show the name." (No cache-buster on the
// /api URL: being cached at the CDN is the whole point there.)
export async function fetchEventData(): Promise<EventData | null> {
  if (!APPS_SCRIPT_URL) return FALLBACK_EVENT_DATA;
  const data =
    (await getJson(CACHED_EVENT_DATA_URL)) ?? (await getJson(`${APPS_SCRIPT_URL}?_=${Date.now()}`));
  if (data) saveCachedEventData(data);
  return data;
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
