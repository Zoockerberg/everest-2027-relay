# Booking + donation backend setup (Google Sheet + Apps Script)

This is the piece that makes bookings real: a public "pending" registration
gets written to a Sheet, you flip one cell to confirm it, and it appears on
the live schedule. It also tracks a live donation total that drives the
growing distance in the hero heading. Nothing else is required — no server,
no hosting, free.

You need to do this part yourself (a few clicks in your own Google account) —
I can't complete Google's login/authorization flow from here. It's about
10 minutes.

**Already set this up before and just need to add donations?** Skip to
[Updating an existing deployment](#updating-an-existing-deployment).

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it something like "Everest 2027 — bookings".
3. Rename the first tab (bottom-left) to exactly **`registrations`**.
4. In row 1, add these headers exactly, one per column (A through F):
   ```
   date | start_time | name | phone | status | submitted_at
   ```

## 2. Add the script

1. In the Sheet, go to **Extensions → Apps Script**. This opens the Apps
   Script editor, already bound to this Sheet.
2. Delete the placeholder `function myFunction() {}` code.
3. Copy the entire contents of [`Code.gs`](./Code.gs) in this folder and
   paste it in.
4. Click the save icon (or Ctrl/Cmd+S).

## 3. Deploy it as a Web App

1. Top-right, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → **Web app**.
3. Fill in:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Google will ask you to authorize the script (since it reads/writes your
   Sheet) — click through **Authorize access → pick your account → Advanced
   → Go to (project name), unsafe → Allow**. This "unsafe" warning is normal
   for any personal script that hasn't been through Google's app review; it's
   your own script running on your own Sheet.
6. Copy the **Web app URL** it gives you (ends in `/exec`).

## 4. Point the site at it

Open [`../src/config.ts`](../src/config.ts) and set:

```ts
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Then rebuild and redeploy the site:

```bash
npm run build
npx gh-pages -d dist -m "Wire up booking backend"
```

## Updating an existing deployment

If you already went through steps 1–4 before, you need to update **again**
even if you did it already for donations — this version switches the
donation webhook over to Funraisin's actual payload shape (see below).

1. Open your Sheet → **Extensions → Apps Script**.
2. Select all the existing code and replace it with the current
   [`Code.gs`](./Code.gs).
3. Save, then **Deploy → Manage deployments → edit (pencil icon) → New
   version → Deploy**. The Web app URL stays the same — nothing to change in
   `config.ts`.
4. Three tabs appear in your Sheet automatically the first time they're
   needed (either a GET from the site, or the first donation webhook call):
   **`donation_total`** (the cached total the site reads), **`donations`**
   (one row per donation, used to de-duplicate and re-sum), and
   **`donations_log`** (a raw copy of every webhook call, for debugging —
   see below). You don't need to create any of them yourself.

**What changed:** the donation webhook no longer expects the charity's
platform to send a running campaign total — see the next section for why.

## Donation webhook — send this to the charity's IT contact

**Why this isn't "send us the total":** Funraisin (the donation platform
PCHF uses) has no field anywhere in its schema for a campaign's live
cumulative total — the closest thing, "show progress", is just a checkbox
for whether their own progress bar is displayed, not an actual number.
What Funraisin *does* support is a webhook that fires once per individual
donation, sending the full donation record as JSON (see
[Funraisin's webhook docs](https://support.funraisin.co/developers/webhooks)
and [data structure docs](https://support.funraisin.co/developers/data-structure)).
So instead of asking their side to compute a running total, our endpoint
now accepts one webhook per donation and does the summing itself.

**URL:** your Web app URL with `?type=donation` appended, e.g.
```
https://script.google.com/macros/s/AKfycb.../exec?type=donation
```

**Method:** `POST` — this is exactly what Funraisin's own donation webhook
sends out of the box. In the Funraisin admin, set up a webhook pointed at
the URL above with **Donation** as the data source; no custom payload
shaping is needed on their end.

**Retry safety:** each donation record has its own id, so the endpoint
keeps a ledger keyed by that id — a retried or duplicated webhook delivery
for the same donation just overwrites that donation's row instead of being
counted twice. This replaces the old "send the running total, not an
increment" trick, which no longer applies now that each call is a single
donation rather than a total.

**Field names — this may need one round of tuning:** Funraisin's public
docs describe the donation record's *contents* but not exact field names
precisely enough for us to hard-code with full confidence, so the script
tries several plausible names for the donation id and amount (see
`DONATION_ID_FIELDS_` / `DONATION_AMOUNT_FIELDS_` near the top of
[`Code.gs`](./Code.gs)). Every webhook call — whether or not it parsed
successfully — is logged to the **`donations_log`** tab with the raw JSON
body in the `raw_body` column. After Alex sends a first test donation
through:
- If it shows up correctly in `donation_total`, you're done.
- If not, open `donations_log`, look at the actual field names in
  `raw_body`, and add the real ones to the front of the relevant array in
  `Code.gs`, then redeploy (**Deploy → Manage deployments → edit → New
  version → Deploy**).

This is a plain server-to-server webhook call (not from a browser), so
their system doesn't need to worry about CORS or content-type — any JSON
POST works.

**On the site:** the hero heading's distance follows a tiered curve —
front-loaded early on, tapering as donations grow, then a flat permanent
rate past $10,000 so large late donations still visibly move the number.
The tiers live in [`../src/config.ts`](../src/config.ts) as
`DISTANCE_CURVE` (a list of `{ dollars, km }` points the site interpolates
between) and `DOLLARS_PER_KM_BEYOND` (the flat rate past the last point,
currently $120/km, uncapped). Edit those two exports to retune the curve —
it's a straightforward config change, then rebuild and redeploy the site.
A small "$X raised so far" line also appears under the intro paragraph.
Both update automatically within `LIVE_POLL_INTERVAL_MS` (30s) of a visitor
having the page open, no reload needed.

**Testing it yourself before Funraisin is wired up:**
```bash
curl -X POST "https://script.google.com/macros/s/AKfycb.../exec?type=donation" \
  -H "Content-Type: application/json" \
  -d '{"donation_id": "test-1", "amount": 1000}'
```
Then reload the site (or wait 30s) — the heading should jump to 190km
(the end of the first tier). Send a second call with a different
`donation_id` to confirm amounts add up, and re-send the same `donation_id`
again to confirm it doesn't double-count.

## Using it day to day

- **New bookings** land as a new row in the `registrations` tab with
  `status` = `pending`. There's no notification — check the Sheet when you
  want to see what's come in.
- **To confirm one**, just edit that row's `status` cell to `confirmed`.
  Their name appears on the public schedule (and the slot fills up) the next
  time someone loads the page — no redeploy needed, the site fetches live
  from the Sheet on every page load.
- **To reject one**, either delete the row or set `status` to anything other
  than `confirmed` (e.g. `declined`) — it just won't show publicly.
- Two confirmed rows for the same `date` + `start_time` = that slot shows as
  full.

## Redeploying the script after edits

If you ever change `Code.gs`, you need to redeploy for changes to take
effect: **Deploy → Manage deployments → edit (pencil icon) → New version →
Deploy**. The URL stays the same, so you won't need to touch `config.ts`
again.
