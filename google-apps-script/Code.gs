// Everest 2027 relay — booking + donation backend.
//
// Bind this script to the Google Sheet that has a "registrations" tab with
// header row: date | start_time | name | phone | status | submitted_at
// (see google-apps-script/README.md for full setup steps). The donation
// total is tracked in a "donation_total" tab (cached sum, for fast reads)
// backed by a "team_totals" tab (one row per accepted Funraisin
// team/fundraiser — see TARGET_TEAM_IDS_ below — for dedup and re-summing)
// and a "donations_log" tab (raw payload audit trail, including donations
// to OTHER teams that got filtered out) — all three are created
// automatically the first time they're needed.
//
// Registration columns are addressed by position, not by header name, so
// the header row is for humans only — don't reorder them without updating
// COL_* below.

const SHEET_NAME = "registrations";
const DONATION_SHEET_NAME = "donation_total";
const TEAM_TOTALS_SHEET_NAME = "team_totals";
const DONATIONS_LOG_SHEET_NAME = "donations_log";

const COL_DATE = 0;
const COL_START_TIME = 1;
const COL_NAME = 2;
const COL_PHONE = 3;
const COL_STATUS = 4;
const COL_SUBMITTED_AT = 5;

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('No sheet named "' + SHEET_NAME + '" — see google-apps-script/README.md.');
  }
  return sheet;
}

function getDonationSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONATION_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DONATION_SHEET_NAME);
    sheet.getRange("A1").setValue("total_raised");
    sheet.getRange("B1").setValue(0);
  }
  return sheet;
}

function getTotalRaised_() {
  const value = getDonationSheet_().getRange("B1").getValue();
  const num = Number(value);
  return isFinite(num) && num > 0 ? num : 0;
}

function setTotalRaised_(value) {
  getDonationSheet_().getRange("B1").setValue(value);
}

// One row per accepted Funraisin team/fundraiser page: team_id | team_name
// | total_raised | last_updated. Funraisin's donation webhook doesn't
// carry a campaign-wide running total, but it does carry a per-team one
// (see the comment above handleDonationWebhook_ below) — this is our
// record of the latest total_raised reported for each accepted team,
// which both de-duplicates retried webhook deliveries (same team id just
// overwrites the same row) and is what the cached total in
// "donation_total" is re-summed from.
function getTeamTotalsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TEAM_TOTALS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TEAM_TOTALS_SHEET_NAME);
    sheet.appendRow(["team_id", "team_name", "total_raised", "last_updated"]);
  }
  return sheet;
}

// Raw audit trail: every donation webhook call gets a row here, whether or
// not it parsed successfully, and whether or not its team was one we
// accept — handy if Funraisin ever changes their payload shape and totals
// stop updating; the "raw_body" column has the actual payload they sent.
function getDonationsLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONATIONS_LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DONATIONS_LOG_SHEET_NAME);
    sheet.appendRow(["received_at", "donation_id", "team_id", "team_total_raised", "raw_body"]);
  }
  return sheet;
}

// Sheets sometimes auto-converts a plain "2026-10-03" (or "06:00") string
// into a real Date cell. Handle both so the key format stays consistent
// either way. Duck-typed rather than `instanceof Date` — values coming back
// from Range#getValues() can be Date-like objects from a different
// execution realm that fail a plain instanceof check.
function isDateValue_(value) {
  return !!value && typeof value.getFullYear === "function" && typeof value.getTime === "function";
}

function formatDateCell_(value) {
  if (isDateValue_(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).trim();
}

function formatTimeCell_(value) {
  if (isDateValue_(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "HH:mm");
  }
  return String(value).trim();
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Returns { confirmed: {...}, totalRaised: 1234 } — only rows with status
// "confirmed" are included in `confirmed`. Pending rows never reach the
// public site.
function doGet() {
  const rows = getSheet_().getDataRange().getValues().slice(1); // skip header
  const confirmed = {};
  rows.forEach((row) => {
    const status = String(row[COL_STATUS] || "").trim().toLowerCase();
    if (status !== "confirmed") return;
    const date = formatDateCell_(row[COL_DATE]);
    const startTime = formatTimeCell_(row[COL_START_TIME]);
    if (!date || !startTime) return;
    const key = date + " " + startTime;
    if (!confirmed[key]) confirmed[key] = [];
    confirmed[key].push(String(row[COL_NAME] || "").trim());
  });
  return jsonOutput_({ confirmed: confirmed, totalRaised: getTotalRaised_() });
}

// Dispatches on a `?type=` query param: `?type=donation` for the charity's
// donation-platform webhook, anything else (including no param, so the
// site's own booking form keeps working unchanged) for a slot registration.
function doPost(e) {
  const type = (e.parameter && e.parameter.type) || "booking";
  if (type === "donation") return handleDonationWebhook_(e);
  return handleBookingSubmission_(e);
}

// Only donations to these Funraisin team/fundraiser pages count toward the
// site's total. Funraisin fires this same webhook for every team under the
// event (see google-apps-script/README.md), not just this one, since
// multiple fundraiser pages now sit under it — so without this filter,
// donations to unrelated fundraisers on the same event would inflate the
// number on the site.
//   237 = "Everest 2027 Project - Beyond Limits" (confirmed via the
//   Team.team_id in the 2026-09-21 test payload).
const TARGET_TEAM_IDS_ = ["237"];

// Webhook contract — Funraisin POSTs to `<web app url>?type=donation` once
// per donation. Confirmed from a real test payload sent by PCHF's Funraisin
// admin (Alex, 2026-09-21): the body is
//   { "Donation": {...}, "Event": {...}, "Team": {...} }
// There's no campaign-wide running total anywhere in that payload, but
// Team.total_raised IS a running total — Funraisin's own cumulative sum of
// everything donated to that team/fundraiser page so far. That's exactly
// the "send the running total, not an increment" contract the original
// spec asked for, just scoped per team rather than per campaign. So rather
// than re-summing individual donation amounts ourselves — which would mean
// reliably detecting declined/pending/refunded payments too — we keep a
// ledger of the latest total_raised Funraisin reported per accepted team
// (see TARGET_TEAM_IDS_ above) and sum across them. A retried/duplicated
// delivery for the same team just overwrites that team's row with the
// same number (no double-counting), and a refund is reflected
// automatically the next time Funraisin calls in with that team's
// updated (lower) total.
function handleDonationWebhook_(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    return jsonOutput_({ ok: false, error: "Invalid JSON body" });
  }

  const team = body && body.Team;
  const donation = body && body.Donation;
  const teamId = team && team.team_id !== undefined ? String(team.team_id) : "";
  const teamTotal = team ? Number(team.total_raised) : NaN;

  logDonationWebhook_(
    donation && donation.donation_id,
    teamId,
    isFinite(teamTotal) ? teamTotal : null,
    e.postData.contents
  );

  if (!teamId) {
    return jsonOutput_({
      ok: false,
      error: "Could not find Team.team_id in the payload — see the donations_log sheet's raw_body column",
    });
  }
  if (TARGET_TEAM_IDS_.indexOf(teamId) === -1) {
    return jsonOutput_({ ok: true, skipped: true, reason: "donation was to a different team/fundraiser page", teamId: teamId });
  }
  if (!isFinite(teamTotal) || teamTotal < 0) {
    return jsonOutput_({
      ok: false,
      error: "Could not find a valid Team.total_raised in the payload — see the donations_log sheet's raw_body column",
    });
  }

  upsertTeamTotal_(teamId, (team && team.t_name) || "", teamTotal);
  const total = recomputeTotalRaised_();
  return jsonOutput_({ ok: true, teamId: teamId, teamTotalRaised: teamTotal, totalRaised: total });
}

function logDonationWebhook_(donationId, teamId, teamTotal, rawBody) {
  getDonationsLogSheet_().appendRow([new Date(), donationId || "", teamId || "", teamTotal, rawBody]);
}

// Upserts by team id (overwrites the existing row if the id was seen
// before) rather than always appending, so a retried webhook delivery for
// the same team can't be double-counted.
function upsertTeamTotal_(teamId, teamName, totalRaised) {
  const sheet = getTeamTotalsSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === teamId) {
        sheet.getRange(i + 2, 2, 1, 3).setValues([[teamName, totalRaised, new Date()]]);
        return;
      }
    }
  }
  sheet.appendRow([teamId, teamName, totalRaised, new Date()]);
}

function recomputeTotalRaised_() {
  const sheet = getTeamTotalsSheet_();
  const lastRow = sheet.getLastRow();
  const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 3).getValues() : [];
  const total = rows.reduce((sum, row) => sum + (Number(row[2]) || 0), 0);
  setTotalRaised_(total);
  return total;
}

// Body (sent as text/plain to dodge the CORS preflight — see src/lib/api.ts):
// { "date": "2026-10-03", "startTime": "06:00", "name": "...", "phone": "..." }
// Appends a new row with status "pending". The organiser confirms it by
// editing that cell to "confirmed" directly in the Sheet.
function handleBookingSubmission_(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    return jsonOutput_({ ok: false, error: "Invalid JSON body" });
  }

  const date = String(body.date || "").trim();
  const startTime = String(body.startTime || "").trim();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();

  if (!date || !startTime || !name || !phone) {
    return jsonOutput_({ ok: false, error: "Missing required field" });
  }

  getSheet_().appendRow([date, startTime, name, phone, "pending", new Date()]);
  return jsonOutput_({ ok: true });
}
