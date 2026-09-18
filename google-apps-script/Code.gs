// Everest 2027 relay — booking + donation backend.
//
// Bind this script to the Google Sheet that has a "registrations" tab with
// header row: date | start_time | name | phone | status | submitted_at
// (see google-apps-script/README.md for full setup steps). The donation
// total is tracked in a separate "donation_total" tab that this script
// creates automatically the first time it's needed.
//
// Registration columns are addressed by position, not by header name, so
// the header row is for humans only — don't reorder them without updating
// COL_* below.

const SHEET_NAME = "registrations";
const DONATION_SHEET_NAME = "donation_total";

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

// Webhook contract — POST to `<web app url>?type=donation` with a JSON body:
//   { "totalRaised": 1234.56 }
// `totalRaised` is the CAMPAIGN'S CURRENT CUMULATIVE TOTAL in dollars, not
// the amount of a single donation — sending the running total (rather than
// an increment to add) means a retried/duplicate webhook delivery can't
// double-count a donation, since each call just overwrites the stored value.
function handleDonationWebhook_(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    return jsonOutput_({ ok: false, error: "Invalid JSON body" });
  }
  const total = Number(body.totalRaised);
  if (!isFinite(total) || total < 0) {
    return jsonOutput_({ ok: false, error: "totalRaised must be a non-negative number" });
  }
  setTotalRaised_(total);
  return jsonOutput_({ ok: true, totalRaised: total });
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
