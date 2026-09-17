# Everest 2027 — 100km SkiErg Relay

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
                          countdown target, and the confirmed-slots data
  lib/schedule.ts       — slot/day formatting helpers
  hooks/
    useCountdown.ts      — 5s countdown ticker
    useParallax.ts       — scroll-driven ridge parallax
    useSnowCanvas.ts      — falling-snow canvas (requestAnimationFrame)
    useSkierRig.ts        — the animated skier's IK rig (requestAnimationFrame)
  components/           — Hero, SkierScene, About, Schedule, JoinModal,
                          ThanksModal, Footer
```

## What's real vs. stubbed

- **Slot data is hardcoded** in `src/config.ts` (`CONFIRMED`), and the join
  form only sets local state (`App.tsx`'s `handleSubmit`) — same as the
  design prototype. Nothing is submitted anywhere yet.
- **No backend is wired up.** The original spec
  (`design_handoff_everest_relay/spec/WEBSITE_SPEC.md`) proposes a Google
  Sheet + Apps Script backend: a `doGet` returning confirmed registrations as
  JSON, and a `doPost` for new pending sign-ups, with the organiser flipping
  `status` from `pending` to `confirmed` directly in the Sheet. Building that
  needs a Google account/Sheet to deploy against, so it hasn't been built —
  say the word when you're ready and it's a small, self-contained change:
  swap `CONFIRMED` for a `fetch` in `config.ts`/`Schedule.tsx`, and point
  `handleSubmit` in `App.tsx` at the Apps Script `doPost` URL.
- **Donate/stream/social links** are placeholders from the design handoff
  (`src/config.ts`, `Footer.tsx`) — confirm the real YouTube stream URL and
  Instagram/Facebook profile links before launch.
- Fonts load from Google Fonts at runtime (`index.html`) — self-host before
  going live if you want to drop the external request.

## Deploying

Not yet deployed anywhere. `npm run build` produces a static `dist/` — this
is a plain static site (no server-side logic), so any static host (Vercel,
Netlify, GitHub Pages, Cloudflare Pages) works once you're ready to ship.
