# Booking backend setup (Google Sheet + Apps Script)

This is the piece that makes bookings real: a public "pending" registration
gets written to a Sheet, you flip one cell to confirm it, and it appears on
the live schedule. Nothing else is required — no server, no hosting, free.

You need to do this part yourself (a few clicks in your own Google account) —
I can't complete Google's login/authorization flow from here. It's about
10 minutes.

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
