# HANDSHAKE — demo script for the stage

> One line: **HelpLoop finds the person, ProofPing proves it happened — HANDSHAKE keeps both.**

Run `npm run dev` and open http://localhost:5173 (press **F11** for full screen).

---

## 0:00 — Hook (20 seconds)

> "Everyone here has posted a *'can anyone help me with…'* message in a group.
> Somebody replies 'yes sure'. And then… nothing. No one knows if it happened.
> The missing link isn't matchmaking — it's **accountability**."

Point at the hero: two interlocking rings inside a live network of community members.
Move the mouse — the camera follows (it's real WebGL, not a video).

---

## 0:20 — The loop (60 seconds)

Scroll to **The accountability loop** and hover cards 1→5:

| Step | Say |
|---|---|
| 1 Request | "Specific ask, urgency, place, deadline — 30 seconds." |
| 2 Connect | "Backers signal availability without pretending they committed." |
| 3 Commit | "**One** helper owns it, with an ETA. This is where group chats fail." |
| 4 Verify | "Helper marks delivered **and** the requester confirms. Two signatures." |
| 5 Resolved | "Only now does it close — and both people gain trust history." |

---

## 1:20 — Live build (do it, don't talk about it)

1. **Post a request** → type something real ("Borrow a 3D printer…") → watch the **live 3D preview**
   tilt as you type → *Post to the feed*.
2. Open the **laptop charger** request → show the **5-step commitment tracker** popping in 3D.
3. Click **I can help** → choose an ETA → **Confirm commitment** → the card flips to
   *In progress* and the Commit pod lights up.
4. **Switch persona** (nav, right side) → *Viewing as Priya* → open the blood-donor request →
   helper already marked delivered → press **Confirm you got help** → confetti + toast
   *"Two-sided confirmation complete."*

> "Watch what I **cannot** do: the helper alone could not close it. The requester had to
> confirm. That's accountability without pretending a digital tick guarantees a real-world act."

5. Press **Not yet** on a different request to show the dispute path — the loop reopens instead
   of lying, and the dispute lands in the activity trail.

---

## 3:00 — Why it wins

- **Trust ledger** (right rail): helped / received / **reliability %** / average response time —
  written only after 2-of-2 confirmation.
- **Community pulse**: live counts by status + demand by category.
- **Nothing extra**: React 19 + Tailwind v4 + Three.js + localStorage. No backend, no paid API,
  works offline — which is exactly what a community-help feature needs to run *inside* social
  platforms later.

---

## Judge questions → short answers

**"Is a confirmation proof?"**
No. It's mutual attestation: the requester's word, the helper's word, and a public trail. The
product never claims more than that — but it *does* stop silent no-shows.

**"Why would people bother?"**
Trust history is the reward, and it's cheap: two taps instead of a promise that evaporates.

**"Fake data?"**
Seven personas, twelve seeded requests across every status (open, in progress, awaiting verify,
resolved, one with a full dispute → redelivery → confirmation trail). Switch personas in the nav —
everything is real state in localStorage.

**"Backend?"**
Swap `src/store.jsx` for Firebase/Supabase — actions are already isolated
(`createRequest`, `commit`, `helperDone`, `confirmReceived`, `dispute`).

**"Where does it live?"**
Conceptually a layer inside WhatsApp/Instagram community groups: post → track → verify, never
leaving the group.

---

## Reset

Nav → persona menu → **Reset demo data** (also in the footer) restores the seeded scenario
before you demo again.
