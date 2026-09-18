import { DISTANCE_CURVE, DOLLARS_PER_KM_BEYOND } from "../config";
import type { Lang } from "../i18n/translations";

// Piecewise-linear interpolation across DISTANCE_CURVE's breakpoints, then a
// flat DOLLARS_PER_KM_BEYOND rate past the last one — see config.ts for the
// tier table this implements.
export function distanceKmFromDonations(totalRaised: number): number {
  const raised = Number.isFinite(totalRaised) && totalRaised > 0 ? totalRaised : 0;
  const curve = DISTANCE_CURVE;

  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const curr = curve[i];
    if (raised <= curr.dollars) {
      const span = curr.dollars - prev.dollars;
      const frac = span > 0 ? (raised - prev.dollars) / span : 0;
      return prev.km + frac * (curr.km - prev.km);
    }
  }

  const last = curve[curve.length - 1];
  return last.km + (raised - last.dollars) / DOLLARS_PER_KM_BEYOND;
}

// 127km / 127 km — whole km, to match the bold single-number hero style.
export function formatDistanceKm(km: number, lang: Lang): string {
  const rounded = Math.round(km);
  return lang === "fr" ? `${rounded} km` : `${rounded}km`;
}

// $3,240 / $3 240 — no decimals, thousands-grouped per locale.
export function formatCurrency(amount: number, lang: Lang): string {
  const value = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const grouped = Math.round(value).toLocaleString(lang === "fr" ? "fr-FR" : "en-AU");
  return `$${grouped}`;
}
