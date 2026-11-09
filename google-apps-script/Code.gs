// Everest 2027 relay — booking + donation backend.
//
// Bind this script to the Google Sheet that has a "registrations" tab with
// header row: date | start_time | name | phone | status | submitted_at
// (see google-apps-script/README.md for full setup steps). The donation
// total is tracked in a "donation_total" tab (cached sum, for fast reads)
// backed by a "donations" tab (one row per donation, for dedup/re-summing
// and to handle refunds) and a "donations_log" tab (raw payload audit
// trail) — all three are created automatically the first time they're
// needed.
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

// One row per donation: donation_id | amount | status | last_updated.
// "amount" is 0 whenever the donation's status isn't "paid" (declined,
// pending, refunded, ...), so a later webhook call updating an existing
// donation's status — e.g. a refund — correctly zeroes it back out of the
// total on the next re-sum, rather than needing separate refund handling.
// Upserting by donation id also means a retried/duplicated webhook
// delivery for the same donation can't be double-counted.
function getDonationsLedgerSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONATIONS_LEDGER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DONATIONS_LEDGER_SHEET_NAME);
    sheet.appendRow(["donation_id", "amount", "status", "last_updated"]);
  }
  return sheet;
}

// Raw audit trail: every donation webhook call gets a row here, whether or
// not it was accepted — handy if Funraisin ever changes their payload
// shape and totals stop updating; the "raw_body" column has the actual
// payload they sent.
function getDonationsLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DONATIONS_LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DONATIONS_LOG_SHEET_NAME);
    sheet.appendRow(["received_at", "donation_id", "event_id", "team_id", "amount", "status", "raw_body"]);
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

// Sanity check on every donation webhook call, per PCHF's Funraisin admin
// (Alex, 2026-09-22): the webhook is configured on their side to fire ONLY
// for donations made to Francois' own fundraiser page, and he confirmed
// those calls "should all have event_id = 350".
//
// There used to be a second check requiring Team.team_id = 237, but
// Francois' page is no longer in a team: real donations now arrive with no
// Team block at all (Donation.team_id = "0"), so that check was silently
// rejecting every donation (first seen with donation 15823, 2026-11-09).
// team_id is still logged for reference, just not required.
const TARGET_EVENT_ID_ = "350";

// Webhook contract — Funraisin POSTs to `<web app url>?type=donation` once
// per donation, body shaped like:
//   { "Donation": {...}, "Event": {...}, "Team": {...} }   (Team optional)
// Since only Francois' own page triggers this webhook (see above), it's
// safe to sum each donation's own amount (Donation.d_amount). Only
// donations whose status is "paid" count; anything else
// (declined/pending/refunded) contributes 0 — see the comment above
// getDonationsLedgerSheet_ for how that also makes refunds self-correcting.
function handleDonationWebhook_(e) {
  const rawBody = e.postData.contents;
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    logDonationWebhook_("", "", "", null, "", rawBody);
    return jsonOutput_({ ok: false, error: "Invalid JSON body" });
  }
  const fields = extractDonationFields_(body);
  logDonationWebhook_(fields.donationId, fields.eventId, fields.teamId, isFinite(fields.rawAmount) ? fields.rawAmount : null, fields.status, rawBody);
  return jsonOutput_(applyDonation_(fields));
}

function extractDonationFields_(body) {
  const donation = (body && body.Donation) || {};
  const event = (body && body.Event) || {};
  const team = (body && body.Team) || {};
  const pick = (...values) => {
    for (const v of values) {
      if (v !== undefined && v !== null && String(v) !== "") return String(v);
    }
    return "";
  };
  return {
    donationId: pick(donation.donation_id),
    eventId: pick(event.event_id, donation.event_id),
    teamId: pick(team.team_id, donation.team_id),
    rawAmount: Number(donation.d_amount),
    status: String(donation.d_status || "").trim().toLowerCase(),
  };
}

// Validates one donation and, if it's ours, upserts it and re-sums the
// total. Returns the JSON-able result object.
function applyDonation_(f) {
  if (!f.donationId) {
    return {
      ok: false,
      error: "Could not find Donation.donation_id in the payload — see the donations_log sheet's raw_body column",
    };
  }
  if (f.eventId !== TARGET_EVENT_ID_) {
    return { ok: true, skipped: true, reason: "unexpected event_id", eventId: f.eventId };
  }
  if (!isFinite(f.rawAmount) || f.rawAmount < 0) {
    return {
      ok: false,
      error: "Could not find a valid Donation.d_amount in the payload — see the donations_log sheet's raw_body column",
    };
  }
  const amount = f.status === "paid" ? f.rawAmount : 0;
  upsertDonation_(f.donationId, amount, f.status);
  const total = recomputeTotalRaised_();
  return { ok: true, donationId: f.donationId, amount: amount, totalRaised: total };
}

// Run from the Apps Script editor to re-apply every donation already in the
// donations_log tab (e.g. ones that were wrongly skipped before a fix).
// Safe to run any number of times: donations are upserted by id, so
// nothing is double-counted.
function reprocessLoggedDonations() {
  const sheet = getDonationsLogSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    console.log("donations_log is empty — nothing to reprocess.");
    return;
  }
  const rawBodies = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
  rawBodies.forEach((row, i) => {
    let body;
    try {
      body = JSON.parse(String(row[0]));
    } catch {
      console.log("Row " + (i + 2) + ": raw_body isn't valid JSON, skipped");
      return;
    }
    console.log("Row " + (i + 2) + ": " + JSON.stringify(applyDonation_(extractDonationFields_(body))));
  });
  console.log("Total raised is now " + getTotalRaised_());
}

function logDonationWebhook_(donationId, eventId, teamId, amount, status, rawBody) {
  getDonationsLogSheet_().appendRow([new Date(), donationId || "", eventId || "", teamId || "", amount, status || "", rawBody]);
}

// Upserts by donation id (overwrites the existing row if the id was seen
// before) rather than always appending, so a retried webhook delivery — or
// a later status change for the same donation, like a refund — updates
// that one row instead of adding a duplicate.
function upsertDonation_(donationId, amount, status) {
  const sheet = getDonationsLedgerSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === donationId) {
        sheet.getRange(i + 2, 2, 1, 3).setValues([[amount, status, new Date()]]);
        return;
      }
    }
  }
  sheet.appendRow([donationId, amount, status, new Date()]);
}

function recomputeTotalRaised_() {
  const sheet = getDonationsLedgerSheet_();
  const lastRow = sheet.getLastRow();
  const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 2).getValues() : [];
  const total = rows.reduce((sum, row) => sum + (Number(row[1]) || 0), 0);
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
  notifyNewBooking_(date, startTime, name, phone);
  return jsonOutput_({ ok: true });
}

// Who gets the "new booking" email. Leave empty to send it to the Google
// account that owns/deployed the script (the web app runs as "Me", so
// that's you). Put any address here — or several, comma-separated — to
// send it somewhere else instead.
const NOTIFY_EMAIL_ = "";

function getNotifyEmail_() {
  return NOTIFY_EMAIL_ || Session.getEffectiveUser().getEmail();
}

// Emails the organiser about a new pending booking so they don't have to
// keep checking the Sheet. Wrapped in try/catch: the booking row is already
// saved at this point, so a mail failure (e.g. daily quota hit) must never
// turn a successful booking into an error for the person booking.
function notifyNewBooking_(date, startTime, name, phone) {
  try {
    sendBookingEmail_(date, startTime, name, phone);
  } catch (err) {
    console.error("Booking notification email failed: " + err);
  }
}

function sendBookingEmail_(date, startTime, name, phone) {
  {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pendingCount = countPendingBookings_();
    const subject = "New Everest relay booking: " + name + " (" + date + " " + startTime + ")";
    const body = [
      "Someone just booked a slot on the Everest 2027 relay site.",
      "",
      "Name:  " + name,
      "Phone: " + phone,
      "Slot:  " + date + " at " + startTime,
      "",
      "It's saved as \"pending\". To confirm it, set its status cell to \"confirmed\" in the registrations tab:",
      ss.getUrl() + "#gid=" + getSheet_().getSheetId(),
      "",
      "Pending bookings waiting for you: " + pendingCount,
    ].join("\n");
    MailApp.sendEmail(getNotifyEmail_(), subject, body);
  }
}

function countPendingBookings_() {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  return rows.filter((row) => String(row[COL_STATUS] || "").trim().toLowerCase() === "pending").length;
}

// Run this once from the Apps Script editor (pick it in the function
// dropdown → Run) after pasting in this version: it triggers Google's
// permission prompt for sending email, and sends you a sample notification
// so you can check it arrives. It does NOT add a row to the Sheet.
function testBookingNotification() {
  // Calls the email step directly (no try/catch) so a missing permission
  // shows up as a real error here instead of a misleading "sent" message.
  sendBookingEmail_("2027-01-01", "06:00", "Test Person", "000 000 000");
  console.log("Test notification sent to " + getNotifyEmail_());
}
