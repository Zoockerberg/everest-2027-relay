import { APPS_SCRIPT_URL, FALLBACK_CONFIRMED } from "../config";

export interface RegistrationPayload {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:00"
  name: string;
  phone: string;
}

// GET is a "simple" cross-origin request, so no CORS preflight is involved
// and Apps Script's response is readable as-is.
export async function fetchConfirmedSlots(): Promise<Record<string, string[]>> {
  if (!APPS_SCRIPT_URL) return FALLBACK_CONFIRMED;
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "GET" });
    if (!res.ok) return FALLBACK_CONFIRMED;
    const data = await res.json();
    return data.confirmed ?? {};
  } catch {
    return FALLBACK_CONFIRMED;
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
