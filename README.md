# 🤝 HANDSHAKE

> **From asking for help to making sure it happens.**

HANDSHAKE combines **HelpLoop** (finding someone willing to help) + **ProofPing** (proving the help
actually happened) into one product: a community-help layer with a **two-sided confirmation**
commitment tracker.

Post a request → the community responds → one helper commits with an ETA → the helper marks it done
→ **the requester must also confirm** → the request closes and both sides earn trust history.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Stack

- **React 19 + Vite**
- **Tailwind CSS v4**
- **Three.js / @react-three/fiber + drei** — hero scene (interlocking "handshake" rings inside a
  live community node-network)
- **Framer Motion** — modal & list choreography
- **localStorage** — no backend, no paid API, works fully offline for the demo

## The 5 steps (the core loop)

| # | Stage      | What happens                                                     |
|---|------------|------------------------------------------------------------------|
| 1 | Request    | Someone asks for help                                            |
| 2 | Connect    | Community members respond / back the request                     |
| 3 | Commit     | A helper is assigned with an expected completion time            |
| 4 | Verify     | Helper marks done **and** requester confirms receipt             |
| 5 | Resolved   | Closed, and both sides get a trust-history entry                 |

## Why two-sided confirmation?

A volunteer cannot unilaterally declare the problem solved. The person who asked must confirm it
too — accountability without pretending a digital tick guarantees a real-world act.

## What's built (spec → code)

| Feature | Where it lives |
|---|---|
| Create request | `CreateRequest` — category, urgency, place, deadline + a **live 3D preview card** that tilts as you type |
| Community feed | `Feed` — status tabs, category chips, sort by urgency / newest / closing soon, "My circle" filter |
| Volunteer button | **I can help** (opens an ETA picker → commitment) plus a lighter **Back it** support action |
| Commitment tracker | `StageTrack` — five pods on a tilted 3D rail; the active pod pops forward, helper ETA underneath |
| Completion confirmation | Two-sided: helper marks delivered → requester **confirms receipt** (or **disputes**, which reopens it) |
| Trust history | `Sidebar → Trust ledger` — helped / received / reliability % / average response time, written only after 2-of-2 |

### Also in the box

- **Persona switcher** — 7 seeded community members in the nav; switch between requester, helper
  and bystander views so both sides of a confirmation can be demoed live.
- **Immutable activity trail** — every request carries its own timestamped history (posted, backed,
  committed, delivered, disputed, confirmed) that nothing can rewrite.
- **Dispute path** — a requester who didn't actually receive help can flag it: the request reopens
  instead of closing, and the dispute permanently counts against the helper's reliability score.
- **Seed scenario covering every state** — 12 requests across open / connecting / in progress /
  awaiting verify / resolved, including one full *dispute → redelivery → confirmation* trail.
- **Zero infrastructure** — no backend, no API keys, no login; it runs fully offline and persists
  per-browser, with one-click **Reset demo data** in the nav.
- **Responsive + accessible** — mobile layout, keyboard-closable modals (Esc), focus rings, and
  `prefers-reduced-motion` support.

## How the 3D is built

- **Hero** (`Hero3D`): two interlocking metal rings — the handshake — inside a 34-node community
  sphere with lit edges, a wireframe shell and a procedural glow (canvas texture, no HDR download).
  The camera follows the pointer, and the render loop **pauses when scrolled off-screen** so demo
  laptops stay cool. Falls back to a gradient if WebGL is unavailable.
- **Cards**: pointer-tracked `rotateX/rotateY` with `translateZ` layers (header → meta → tracker →
  action bar) and a light sweep that follows the cursor.
- **Tracker**: a `perspective` rail rotated `13deg`, with pods lifting on `translateZ`.
- **Modals**: spring entrance with a `rotateX` tilt over a blurred backdrop.
- **Resolve**: canvas confetti on two-sided confirmation.
- Honours `prefers-reduced-motion`, and everything degrades to plain layout without JavaScript 3D.

## Demo script (for judges)

1. **Feed** — open requests with urgency, due times and 3D tilt cards.
2. Click **"I can help"** on *Laptop charger* → pick an ETA → the card moves to **In progress**.
3. Switch persona to **Priya** (the requester) → **Verify** stage lights up.
4. Helper marks done → requester **confirms receipt** → confetti, request resolves, trust history
   updates for both sides.
5. Show the **Trust Ledger**: helped / received / reliability % / average response time.

## Demo day

- `DEMO.md` — a timed stage script (hook → the 5 steps → live build → judge Q&A).
- `scripts/shot.mjs` — optional headless-Chromium check that renders the UI, exercises the
  commit / create / two-sided-confirm flows and saves screenshots (`npx playwright install chromium`
  first). Playwright is a dev-only dependency; it is not shipped in the bundle.

## Data

Everything lives in `localStorage` under `handshake.v1`.
Use **Reset demo data** in the nav to restore the seeded scenario.
