import { CONFIRMED, DAYS_CONFIG } from "../config";

export function slotKey(date: string, hour: number): string {
  return `${date} ${String(hour).padStart(2, "0")}:00`;
}

export function formatHour(hour: number): string {
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

export function buildDays(): Day[] {
  return DAYS_CONFIG.map((day) => {
    const slots: Slot[] = [];
    for (let i = 0; i < day.count; i++) {
      const hour = day.startHour + i;
      const key = slotKey(day.date, hour);
      const names = CONFIRMED[key] ?? [];
      slots.push({
        key,
        time: `${formatHour(hour)} – ${formatHour(hour + 1)}`,
        names,
        isFull: names.length >= 2,
      });
    }
    return {
      label: day.label,
      window: `${formatHour(day.startHour)} – ${formatHour(day.startHour + day.count)}`,
      slots,
    };
  });
}

// "2026-10-03 09:00" -> "Sat 9:00am"
export function selectionLabel(key: string): string {
  const date = key.slice(0, 10);
  const hour = parseInt(key.slice(11, 13), 10);
  const dayName = date === DAYS_CONFIG[0].date ? "Sat" : "Sun";
  return `${dayName} ${formatHour(hour)}`;
}
