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
even if you did it already for donations — this version switches how the
donation total is computed (see below).

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
   **`donations_log`** (a raw copy of every webhook call, for debugging).
   You don't need to create any of them yourself.

**What changed:** the total is now summed from individual donation amounts
rather than read off a team-wide running total — see the next section for
why.

## Donation webhook — how it's wired up

**Background:** Funraisin (the donation platform PCHF uses) sends one
webhook call per individual donation, with a body shaped like:

```json
{
  "Donation": { "donation_id": "15544", "d_amount": "1.00", "d_status": "paid", "..." : "..." },
  "Event": { "event_id": "350", "event_code": "everest2027-skierg", "..." : "..." },
  "Team": { "team_id": "237", "t_name": "...", "total_raised": "25.00", "..." : "..." }
}
```

Earlier versions of this code used `Team.total_raised` (Funraisin's own
running total for the team) instead of summing individual donations, to
avoid double-counting retries and to avoid having to detect
declined/pending/refunded payments ourselves. That worked, but it had a
side effect: `Team.total_raised` is the whole team's total, and PCHF's
Funraisin admin (Alex) had multiple people's fundraiser pages under the
same team — so the number included donations to other team members too,
not just Francois.

**As of 2026-09-22, Alex fixed this at the source:** the webhook now only
fires for donations made to Francois' own fundraiser page — donations to
the team page or to other members' pages no longer trigger it at all. He
confirmed those calls "should all have `event_id = 350`". That makes it
safe to go back to summing each donation's own `Donation.d_amount`
ourselves, since every call the endpoint receives is now guaranteed to be
one of Francois' own donations:

- Each donation is upserted into the **`donations`** tab keyed by
  `donation_id`, so a retried/duplicated delivery just overwrites that
  row instead of double-counting.
- Only donations with `Donation.d_status == "paid"` count; anything else
  (declined, pending, refunded) is stored with amount `0`. If Funraisin
  later sends an updated call for the same `donation_id` — e.g. because a
  donation got refunded — that upsert naturally zeroes it back out of the
  total on the next recompute, no separate refund handling needed.
- `Event.event_id` (must be `350`) and `Team.team_id` (must be `237`) are
  both checked as extra sanity checks on top of Alex's fix — a call that
  doesn't match either is logged but skipped, rather than trusted blindly.

**URL:** the Web app URL with `?type=donation` appended, e.g.
```
https://script.google.com/macros/s/AKfycb.../exec?type=donation
```
This is already configured on Funraisin's side — nothing left to set up
there.

This is a plain server-to-server webhook call (not from a browser), so
CORS/content-type aren't a concern.

**If totals ever stop updating:** every webhook call — accepted or not —
is logged to the **`donations_log`** tab with the full raw JSON body in
the `raw_body` column. If Funraisin ever changes their payload shape (or
`event_id`/`team_id`) in the future, that's the place to look; the fix is
a small change in `handleDonationWebhook_` in [`Code.gs`](./Code.gs).

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

**Testing it yourself:**
```bash
curl -X POST "https://script.google.com/macros/s/AKfycb.../exec?type=donation" \
  -H "Content-Type: application/json" \
  -d '{"Donation": {"donation_id": "test-1", "d_amount": "1000", "d_status": "paid"}, "Event": {"event_id": "350"}, "Team": {"team_id": "237"}}'
```
Then reload the site (or wait 30s) — the heading should jump to 190km
(the end of the first tier). Re-send with the same `donation_id` and
amount to confirm it doesn't double-count, and try a different `event_id`
(e.g. `"999"`) to confirm it comes back `{"ok": true, "skipped": true, ...}`
and doesn't move the total.

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
