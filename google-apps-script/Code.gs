// Everest 2027 relay — booking + donation backend.
//
// Bind this script to the Google Sheet that has a "registrations" tab with
// header row: date | start_time | name | phone | status | submitted_at
// (see google-apps-script/README.md for full setup steps). The donation
// total is tracked in a "donation_total" tab (cached sum, for fast reads)
// backed by a "donations" ledger tab (one row per donation, for dedup and
// re-summing) and a "donations_log" tab (raw payload audit trail) — all
// three are created automatically the first time they're needed.
//
// Registration columns are addressed by position, not by header name, so
// the header row is for humans only — don't reorder them without updating
// COL_* below.

const SHEET_NAME = "registrations";
const DONATION_SHEET_NAME = "donation_total";
const DONATIONS_LEDGER_SHEET_NAME = "donations";
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

// One row per donation: donation_id | amount | received_at. Used both to
// de-duplicate retried/duplicated webhook deliveries (upsert by donation
// id, rather than blindly appending) and as the source of truth the cached
// total in "donation_total" is re-summed from.
function getDonationsLedgerSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONATIONS_LEDGER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DONATIONS_LEDGER_SHEET_NAME);
    sheet.appendRow(["donation_id", "amount", "received_at"]);
  }
  return sheet;
}

// Raw audit trail: every donation webhook call gets a row here, whether or
// not it parsed successfully. Funraisin's exact field names aren't
// something we control or have been able to confirm in advance (see the
// donation webhook section of google-apps-script/README.md), so if
// donations stop showing up, check here first — the "raw_body" column has
// the actual payload Funraisin sent.
function getDonationsLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONATIONS_LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DONATIONS_LOG_SHEET_NAME);
    sheet.appendRow(["received_at", "donation_id", "amount", "skipped_reason", "raw_body"]);
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

// Funraisin's donation platform has no concept of "campaign running total"
// we can subscribe to — the closest thing, "show progress", is just a
// display toggle, not a number. What it *does* send is one webhook per
// individual donation, firing "the entire Donation record" as JSON (see
// support.funraisin.co/developers/webhooks and .../data-structure). So
// instead of trusting the caller for a running total, we keep our own
// ledger of donations (by donation id) and sum it ourselves — which also
// restores the retry-safety the old "send the running total" contract used
// to give us for free: a retried/duplicated delivery for the same donation
// id just overwrites that donation's own ledger row instead of adding a
// second one.
//
// Funraisin's exact field names for the donation id and amount aren't
// documented in enough detail to hard-code with confidence, so this tries
// a short list of plausible names (below) and logs every raw payload to
// the "donations_log" sheet regardless of outcome. If donations aren't
// being picked up, check that sheet's "raw_body" column for the real field
// names Funraisin is sending and add them to the front of the lists below.
const DONATION_ID_FIELDS_ = ["donation_id", "id", "donationId", "transaction_id"];
const DONATION_AMOUNT_FIELDS_ = [
  "amount",
  "donation_amount",
  "gross_amount",
  "donationAmount",
  "amount_raised",
  "value",
  "total",
];
const DONATION_STATUS_FIELDS_ = ["status", "donation_status", "payment_status"];
// A donation record that names its own status should only be counted if
// that status looks like success — skip anything that looks declined,
// pending, refunded, etc. so a would-be donation doesn't inflate the total.
const DONATION_BAD_STATUS_SUBSTRINGS_ = ["fail", "declin", "pending", "refund", "cancel", "void"];

function firstField_(obj, names) {
  if (!obj) return undefined;
  for (const name of names) {
    const value = obj[name];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function isBadDonationStatus_(donation) {
  const status = firstField_(donation, DONATION_STATUS_FIELDS_);
  if (status === undefined) return false;
  const normalized = String(status).toLowerCase();
  return DONATION_BAD_STATUS_SUBSTRINGS_.some((bad) => normalized.indexOf(bad) !== -1);
}

function logDonationWebhook_(donationId, amount, skippedReason, rawBody) {
  getDonationsLogSheet_().appendRow([new Date(), donationId, amount, skippedReason || "", rawBody]);
}

// Upserts by donation id (overwrites the existing row if the id was seen
// before) rather than always appending, so a retried webhook delivery for
// the same donation can't be double-counted.
function upsertDonation_(donationId, amount) {
  const sheet = getDonationsLedgerSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === donationId) {
        sheet.getRange(i + 2, 2, 1, 2).setValues([[amount, new Date()]]);
        return;
      }
    }
  }
  sheet.appendRow([donationId, amount, new Date()]);
}

function recomputeTotalRaised_() {
  const sheet = getDonationsLedgerSheet_();
  const lastRow = sheet.getLastRow();
  const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 2).getValues() : [];
  const total = rows.reduce((sum, row) => sum + (Number(row[1]) || 0), 0);
  setTotalRaised_(total);
  return total;
}

// Webhook contract — Funraisin POSTs to `<web app url>?type=donation` once
// per donation, with the donation record as the JSON body (either bare, or
// wrapped in a `{ "donation": {...} }` / `{ "data": {...} }` envelope,
// which is unwrapped below — whichever it turns out to be).
function handleDonationWebhook_(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    return jsonOutput_({ ok: false, error: "Invalid JSON body" });
  }

  const donation =
    body && typeof body.donation === "object"
      ? body.donation
      : body && typeof body.data === "object"
        ? body.data
        : body;

  const rawId = firstField_(donation, DONATION_ID_FIELDS_);
  const donationId = rawId !== undefined ? String(rawId) : "";
  const amount = Number(firstField_(donation, DONATION_AMOUNT_FIELDS_));
  const skippedReason = isBadDonationStatus_(donation) ? "non-success status" : "";

  logDonationWebhook_(donationId, isFinite(amount) ? amount : null, skippedReason, e.postData.contents);

  if (!donationId) {
    return jsonOutput_({
      ok: false,
      error: "Could not find a donation id field — see the donations_log sheet's raw_body column",
    });
  }
  if (!isFinite(amount) || amount < 0) {
    return jsonOutput_({
      ok: false,
      error: "Could not find a valid donation amount field — see the donations_log sheet's raw_body column",
    });
  }
  if (skippedReason) {
    return jsonOutput_({ ok: true, skipped: true, reason: skippedReason, donationId: donationId });
  }

  upsertDonation_(donationId, amount);
  const total = recomputeTotalRaised_();
  return jsonOutput_({ ok: true, donationId: donationId, amount: amount, totalRaised: total });
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
