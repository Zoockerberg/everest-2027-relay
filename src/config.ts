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
  label: string;
  startHour: number;
  count: number;
}

export const DAYS_CONFIG: DayConfig[] = [
  { date: "2026-10-03", label: "Saturday 3 Oct", startHour: 6, count: 14 },
  { date: "2026-10-04", label: "Sunday 4 Oct", startHour: 3, count: 8 },
];

// Confirmed registrations, keyed by "YYYY-MM-DD HH:00". Replace with a fetch
// from the real backend (see BACKEND.md) — capacity is 2 confirmed names per
// slot. Only confirmed rows should ever reach this map; pending submissions
// stay invisible until the organiser approves them.
export const CONFIRMED: Record<string, string[]> = {
  "2026-10-03 07:00": ["F. Loose", "M. Tan"],
  "2026-10-03 08:00": ["J. Petrovic"],
  "2026-10-03 11:00": ["A. Whelan", "D. Kerr"],
  "2026-10-03 12:00": ["S. Mahoney"],
  "2026-10-03 17:00": ["R. Iyer", "C. Boyd"],
  "2026-10-04 05:00": ["K. Nguyen"],
  "2026-10-04 09:00": ["L. Brandt", "H. Okafor"],
};
