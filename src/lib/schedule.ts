import { DAYS_CONFIG } from "../config";
import type { Dict, Lang } from "../i18n/translations";

export function slotKey(date: string, hour: number): string {
  return `${date} ${String(hour).padStart(2, "0")}:00`;
}

// "2026-10-03 09:00" -> { date: "2026-10-03", startTime: "09:00" }
export function parseSlotKey(key: string): { date: string; startTime: string } {
  return { date: key.slice(0, 10), startTime: key.slice(11) };
}

// English uses a 12h am/pm clock ("6:00am"); French uses a 24h clock with
// "h" as the separator ("6h00"), the conventional local format.
export function formatHour(hour: number, lang: Lang): string {
  if (lang === "fr") {
    return `${hour}h00`;
  }
  const ap = hour < 12 ? "am" : "pm";
  const hr = hour % 12 === 0 ? 12 : hour % 12;
  return `${hr}:00${ap}`;
}

export interface Slot {
  key: string;
  time: string;
  names: string[];
  isFull: boolean;
}

export interface Day {
  label: string;
  window: string;
  slots: Slot[];
}

const FIRST_DAY_DATE = DAYS_CONFIG[0].date;

export function dayLabel(date: string, t: Dict): string {
  return date === FIRST_DAY_DATE ? t.daySaturday : t.daySunday;
}

export function dayAbbr(date: string, t: Dict): string {
  return date === FIRST_DAY_DATE ? t.dayAbbrSat : t.dayAbbrSun;
}

export function buildDays(lang: Lang, t: Dict, confirmed: Record<string, string[]>): Day[] {
  return DAYS_CONFIG.map((day) => {
    const slots: Slot[] = [];
    for (let i = 0; i < day.count; i++) {
      const hour = day.startHour + i;
      const key = slotKey(day.date, hour);
      const names = confirmed[key] ?? [];
      slots.push({
        key,
        time: `${formatHour(hour, lang)} – ${formatHour(hour + 1, lang)}`,
        names,
        isFull: names.length >= 2,
      });
    }
    return {
      label: dayLabel(day.date, t),
      window: `${formatHour(day.startHour, lang)} – ${formatHour(day.startHour + day.count, lang)}`,
      slots,
    };
  });
}

// "2026-10-03 09:00" -> "Sat 9:00am" / "Sam 9h00"
export function selectionLabel(key: string, lang: Lang, t: Dict): string {
  const date = key.slice(0, 10);
  const hour = parseInt(key.slice(11, 13), 10);
  return `${dayAbbr(date, t)} ${formatHour(hour, lang)}`;
}
