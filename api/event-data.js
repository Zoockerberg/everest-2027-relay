// Fast, cached copy of the Apps Script data (donation total + confirmed
// bookings) for the website's live counter.
//
// Google Apps Script web apps often take 1–3s to answer, which made the
// hero counter sit at $0 before starting. This function asks Apps Script
// and lets Vercel's CDN keep the answer: visitors get the cached copy in a
// few milliseconds, and the CDN refreshes it in the background at most
// every 10 seconds (stale-while-revalidate), so new donations and confirmed
// bookings still show up within ~10–40s.
//
// Keep in sync with APPS_SCRIPT_URL in src/config.ts.
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwZ3NYx9eq6y-l6bVsruEEL8cUs9oNcAO_gIba3PnHZqKvgprb1WYtKrcp5146VVHeT/exec";

export async function GET() {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Apps Script answered ${res.status}`);
    const data = await res.json();
    if (!data || typeof data.totalRaised !== "number" || typeof data.confirmed !== "object") {
      throw new Error("Unexpected Apps Script response");
    }
    return Response.json(
      { confirmed: data.confirmed, totalRaised: data.totalRaised },
      {
        headers: {
          // Browsers always re-ask; Vercel's CDN serves its copy and refreshes it.
          "Cache-Control": "public, max-age=0, must-revalidate",
          "CDN-Cache-Control": "public, s-maxage=10, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    // Never cached, so the CDN keeps serving the last good copy (if any)
    // and the site keeps its last figures.
    return Response.json(
      { error: String(err) },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
