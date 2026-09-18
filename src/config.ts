// Event configuration. These four values mirror the props exposed on the
// design prototype's root component — swap them for real values/CMS fields
// as the event approaches.
export const EVENT_CONFIG = {
  isLive: false,
  liveNote: "Hour 12 · 41.6km down",
  streamUrl: "https://www.youtube.com/",
  donateUrl:
    "https://fundraisefor.pchf.org.au/fundraisers/francoisloose/everest-challenge",
};

// Countdown target: 3 October 2026, 06:00 local time.
export const EVENT_START = new Date(2026, 9, 3, 6, 0, 0).getTime();

export interface DayConfig {
  date: string; // "YYYY-MM-DD"
  startHour: number;
  count: number;
}

// Sunday is capped to 3:00am–10:00am (7 one-hour slots) — the public window
// narrows before the core team's own stretch later in the morning. Day
// labels are generated per-language in lib/schedule.ts, not stored here.
export const DAYS_CONFIG: DayConfig[] = [
  { date: "2026-10-03", startHour: 6, count: 14 },
  { date: "2026-10-04", startHour: 3, count: 7 },
];

// Fallback confirmed-registrations map, keyed by "YYYY-MM-DD HH:00" — used
// only when APPS_SCRIPT_URL below is empty (i.e. the backend isn't deployed
// yet). Once deployed, the real data comes from the Google Sheet instead.
export const FALLBACK_CONFIRMED: Record<string, string[]> = {};

// URL of the deployed Google Apps Script Web App (see google-apps-script/
// README.md for setup steps).
export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwZ3NYx9eq6y-l6bVsruEEL8cUs9oNcAO_gIba3PnHZqKvgprb1WYtKrcp5146VVHeT/exec";

// How the headline distance grows with donations: starts at BASE_DISTANCE_KM
// and adds 1km per DOLLARS_PER_KM raised. Tune these two numbers to taste —
// e.g. DOLLARS_PER_KM: 20 makes it climb 2.5x faster for the same donations.
// Everything else (formatting, the live counter) recalculates automatically.
export const BASE_DISTANCE_KM = 100;
export const DOLLARS_PER_KM = 50;

// How often the browser re-polls the backend for new donations/bookings
// while someone has the page open (milliseconds).
export const LIVE_POLL_INTERVAL_MS = 30_000;
