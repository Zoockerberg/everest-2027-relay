import { useEffect, useState } from "react";
import { EVENT_START } from "../config";

export interface Countdown {
  days: string;
  hours: string;
  mins: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function compute(): Countdown {
  const ms = Math.max(0, EVENT_START - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return { days: pad(days), hours: pad(hours), mins: pad(mins) };
}

export function useCountdown(): Countdown {
  const [value, setValue] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setValue(compute()), 5000);
    return () => clearInterval(id);
  }, []);

  return value;
}
