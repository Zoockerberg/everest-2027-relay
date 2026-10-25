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

// Set to false to hide the "I want to Ski!" button and the registration
// schedule section entirely — used while registration is invite-only
// (spots shared via a separate private link) rather than open to anyone
// who finds the site. The booking backend keeps working either way; this
// only hides the public entry points into it. Flip back to true to reopen
// public registration.
export const REGISTRATION_OPEN = true;

// Countdown target: 14 November 2026, 06:00 local time.
export const EVENT_START = new Date(2026, 10, 14, 6, 0, 0).getTime();

export interface DayConfig {
  date: string; // "YYYY-MM-DD"
  startHour: number;
  count: number;
}

// Event runs 24 hours from 6am Sat → 6am Sun. Public slots: Sat 6am–8pm
// (14 slots), then core team covers 8pm–3am, then public 3am–6am (3 slots).
export const DAYS_CONFIG: DayConfig[] = [
  { date: "2026-11-14", startHour: 6, count: 14 },
  { date: "2026-11-15", startHour: 3, count: 3 },
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
// tapering toward a realistic 24-hour relay ceiling (~240km ≈ 10km/hr
// average with fresh-legs rotation). Past $5,000 distance still climbs —
// the team will push harder. Edit these two exports to retune the curve.
export const DISTANCE_CURVE: DistanceBreakpoint[] = [
  { dollars: 0, km: 100 }, // base — ~4km/hr, comfortable relay pace
  { dollars: 1_000, km: 160 }, // +60km, ~$16.70/km
  { dollars: 2_500, km: 200 }, // +40km, ~$37.50/km
  { dollars: 5_000, km: 240 }, // +40km, $62.50/km — solid 24hr target
];
export const DOLLARS_PER_KM_BEYOND = 62; // $5,000+: +1km per $62, uncapped

// How often the browser re-polls the backend for new donations/bookings
// while someone has the page open (milliseconds).
export const LIVE_POLL_INTERVAL_MS = 30_000;
