# Everest 2027 — 100km SkiErg Relay

**Live:** https://zoockerberg.github.io/everest-2027-relay/
(repo: https://github.com/Zoockerberg/everest-2027-relay)

Public event landing page for a charity SkiErg relay (3–4 Oct 2026) raising
money for Perth Children's Hospital Foundation. Recreated from the design
handoff at `Claude Cowork/design_handoff_everest_relay/` (React + TypeScript +
Vite, plain CSS matching the handoff's design tokens).

## Local setup

```bash
npm install
npm run dev
```

## Structure

```
src/
  config.ts            — event props (isLive, liveNote, streamUrl, donateUrl),
                          countdown target, day/slot config, and
                          APPS_SCRIPT_URL (booking backend)
  lib/
    schedule.ts          — slot/day formatting helpers
    api.ts                — fetch confirmed slots / submit a registration
  i18n/                 — EN/FR translations + language context
  hooks/
    useCountdown.ts      — 5s countdown ticker
    useParallax.ts       — scroll-driven ridge parallax
    useSnowCanvas.ts      — falling-snow canvas (requestAnimationFrame)
    useSkierRig.ts        — the animated skier's IK rig (requestAnimationFrame)
  components/           — Hero, SkierScene, About, Schedule, JoinModal,
                          ThanksModal, Footer
```

## What's real vs. stubbed

- **Booking backend: code is ready, not deployed yet.** The site fetches
  confirmed slots and submits new registrations via a Google Apps Script Web
  App (`google-apps-script/Code.gs`) backed by a Google Sheet. Until you
  deploy it and set `APPS_SCRIPT_URL` in `src/config.ts`, the site falls back
  to an empty local list (all slots show open) and submissions fail with an
  on-screen error rather than silently pretending to work. **Setup steps:
  [`google-apps-script/README.md`](./google-apps-script/README.md)** — about
  10 minutes, needs your own Google account.
- **Donate/stream/social links** are placeholders from the design handoff
  (`src/config.ts`, `Footer.tsx`) — confirm the real YouTube stream URL and
  Instagram/Facebook profile links before launch.
- Fonts load from Google Fonts at runtime (`index.html`) — self-host before
  going live if you want to drop the external request.

## Deploying

Live on GitHub Pages, served from the `gh-pages` branch. To ship a change:

```bash
npm run build
npx gh-pages -d dist -m "Deploy update"
```

`vite.config.ts` sets `base: '/everest-2027-relay/'` to match the Pages
subpath — update it first if this ever moves to a custom domain or a
different host (Vercel, Netlify, Cloudflare Pages all work fine too, this is
a plain static site).
