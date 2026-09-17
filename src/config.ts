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

// Confirmed registrations, keyed by "YYYY-MM-DD HH:00". Reset to empty so
// booking starts fresh. Replace with a fetch from the real backend (see
// README.md) — capacity is 2 confirmed names per slot. Only confirmed rows
// should ever reach this map; pending submissions stay invisible until the
// organiser approves them.
export const CONFIRMED: Record<string, string[]> = {};
