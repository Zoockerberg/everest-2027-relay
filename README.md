# Everest 2027 — 100km SkiErg Relay

**Live:** https://everest2027-skierg-challenge.netlify.app
(repo: https://github.com/Zoockerberg/everest-2027-relay)

Public event landing page for a charity SkiErg relay (14–15 Nov 2026) raising
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

**Hosted on Netlify** (free, no domain purchase needed, and the default URL
doesn't expose a personal GitHub account name the way GitHub Pages' does).
One-time setup, needs your own Netlify account — this is a web login/connect
flow I can't complete for you:

1. Go to [app.netlify.com](https://app.netlify.com) and sign up/log in
   (GitHub login is the easiest option).
2. **Add new site → Import an existing project → Deploy with GitHub** →
   authorize Netlify to access your GitHub account → pick the
   `everest-2027-relay` repo.
3. Netlify reads [`netlify.toml`](./netlify.toml) in this repo and
   auto-fills the build command (`npm run build`) and publish directory
   (`dist`) — just click **Deploy**.
4. Once it's live, go to **Site configuration → Domain management → Options
   → Edit site name** to pick a custom subdomain, e.g.
   `everest2027-skierg.netlify.app`, instead of the random one Netlify
   generates.
5. From then on, every push to the repo's default branch auto-deploys —
   no more manual `gh-pages` step needed.

`vite.config.ts` was updated to serve from the host root (`base: '/'`)
rather than a GitHub Pages project subpath — if you ever go back to GitHub
Pages instead, that'll need to change back to `/everest-2027-relay/`.

<details>
<summary>Previous setup: GitHub Pages (kept for reference, no longer the
primary deploy target)</summary>

Was served from the `gh-pages` branch via:

```bash
npm run build
npx gh-pages -d dist -m "Deploy update"
```

This still works technically, but the asset paths now assume root serving
(see above), so it would need `base` reverted to deploy there again.

</details>
