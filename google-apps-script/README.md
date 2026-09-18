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

If you already went through steps 1–4 before and are just adding donations:

1. Open your Sheet → **Extensions → Apps Script**.
2. Select all the existing code and replace it with the current
   [`Code.gs`](./Code.gs) (it now also handles the donation webhook below).
3. Save, then **Deploy → Manage deployments → edit (pencil icon) → New
   version → Deploy**. The Web app URL stays the same — nothing to change in
   `config.ts`.
4. A new **`donation_total`** tab appears in your Sheet automatically the
   first time the script runs (either GET from the site, or the first
   donation webhook call) — you don't need to create it yourself.

## Donation webhook — send this to the charity's IT contact

Give them this URL and payload spec so their donation platform can push
updates to the site:

**URL:** your Web app URL with `?type=donation` appended, e.g.
```
https://script.google.com/macros/s/AKfycb.../exec?type=donation
```

**Method:** `POST`, JSON body:
```json
{ "totalRaised": 1234.56 }
```

**Important — `totalRaised` must be the campaign's current cumulative total**
(in dollars), not the amount of the individual donation that just came in.
Sending the running total rather than an increment means it doesn't matter
if their system retries a webhook delivery or sends it twice — each call
just overwrites the stored number with the latest total, so nothing gets
double-counted. If their platform only exposes a live "total raised so far"
figure somewhere (e.g. next to their own donation progress bar), that's
exactly the number to send here.

This is a plain server-to-server webhook call (not from a browser), so their
system doesn't need to worry about CORS or content-type — any JSON POST
works.

**On the site:** the hero heading's distance is `100km + totalRaised / 50`
(so every $50 raised adds 1km), and a small "$X raised so far" line appears
under the intro paragraph. Both update automatically within
`LIVE_POLL_INTERVAL_MS` (30s) of a visitor having the page open, no reload
needed. Tune the $/km rate in [`../src/config.ts`](../src/config.ts)
(`BASE_DISTANCE_KM`, `DOLLARS_PER_KM`) if 50 doesn't feel right once you see
real numbers — it's a one-line change, then rebuild and redeploy the site.

**Testing it yourself before the IT guy wires it up:**
```bash
curl -X POST "https://script.google.com/macros/s/AKfycb.../exec?type=donation" \
  -H "Content-Type: application/json" \
  -d '{"totalRaised": 500}'
```
Then reload the site (or wait 30s) — the heading should jump to 110km.

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
