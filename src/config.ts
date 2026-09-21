// Event configuration. These four values mirror the props exposed on the
// design prototype's root component — swap them for real values/CMS fields
// as the event approaches.
export const EVENT_CONFIG = {
  isLive: false,
  liveNote: "Hour 12 · 41.6km down",
  streamUrl: "https://www.youtube.com/",
  donateUrl:
    "https://fundraisefor.pchf.org.au/fundraisers/francoisloose/everest-2027-project---100km-relay",
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

export interface DistanceBreakpoint {
  dollars: number;
  km: number;
}

// How the headline distance grows with donations: front-loaded and
// tapering, then a flat permanent rate past $10,000 so large late donations
// still visibly move the number. Distance is interpolated linearly between
// consecutive points; past the last point it grows at DOLLARS_PER_KM_BEYOND
// forever (no cap). Edit these two exports to retune the curve — everything
// else (formatting, the live counter) recalculates automatically.
export const DISTANCE_CURVE: DistanceBreakpoint[] = [
  { dollars: 0, km: 100 }, // base target
  { dollars: 1_000, km: 190 }, // +90km, ~$11.10/km
  { dollars: 2_500, km: 245 }, // +55km, ~$27.30/km
  { dollars: 4_500, km: 290 }, // +45km, ~$44.40/km
  { dollars: 7_000, km: 325 }, // +35km, ~$71.40/km
  { dollars: 10_000, km: 350 }, // +25km, $120/km
];
export const DOLLARS_PER_KM_BEYOND = 120; // $10,000+: +1km per $120, uncapped

// How often the browser re-polls the backend for new donations/bookings
// while someone has the page open (milliseconds).
export const LIVE_POLL_INTERVAL_MS = 30_000;
