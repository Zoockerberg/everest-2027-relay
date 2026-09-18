import { BASE_DISTANCE_KM, DOLLARS_PER_KM } from "../config";
import type { Lang } from "../i18n/translations";

export function distanceKmFromDonations(totalRaised: number): number {
  const raised = Number.isFinite(totalRaised) && totalRaised > 0 ? totalRaised : 0;
  return BASE_DISTANCE_KM + raised / DOLLARS_PER_KM;
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
