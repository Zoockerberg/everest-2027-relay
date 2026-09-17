// Everest 2027 relay — booking backend.
//
// Bind this script to the Google Sheet that has a "registrations" tab with
// header row: date | start_time | name | phone | status | submitted_at
// (see google-apps-script/README.md for full setup steps).
//
// Columns are addressed by position, not by header name, so the header row
// is for humans only — don't reorder the columns without updating COL_* below.

const SHEET_NAME = "registrations";

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

// Sheets sometimes auto-converts a plain "2026-10-03" string into a real
// Date cell. Handle both so the key format stays consistent either way.
function formatDateCell_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).trim();
}

function formatTimeCell_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "HH:mm");
  }
  return String(value).trim();
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Returns { confirmed: { "2026-10-03 06:00": ["Jane Doe", "John Smith"], ... } }
// — only rows with status "confirmed" are included. Pending rows never reach
// the public site.
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
  return jsonOutput_({ confirmed: confirmed });
}

// Body (sent as text/plain to dodge the CORS preflight — see src/lib/api.ts):
// { "date": "2026-10-03", "startTime": "06:00", "name": "...", "phone": "..." }
// Appends a new row with status "pending". The organiser confirms it by
// editing that cell to "confirmed" directly in the Sheet.
function doPost(e) {
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
