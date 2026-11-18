# Lesson spec — "Collisions"

18 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `collisions` · level 3 "Momentum and moments", second lesson · WPH11 point **14** (conservation of linear momentum in one dimension) · ~12 min
- **Idea:** when bodies collide (or push apart), they push on each other equally hard and for the same time (Newton's third law), so whatever momentum one loses the other gains. With no external force, **total momentum before = total momentum after**. Choose a positive direction, add the momenta with their signs, and solve for the one unknown.
- **Not in this lesson:** elastic and inelastic collisions and kinetic energy (Unit 4, WPH14); F = Δp / Δt (Unit 4). Two dimensions are not in WPH11.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12c):
  - **P-WINNER**: after a head-on crash the joined pair goes the way of the faster (or the heavier) body;
  - **P-SPEED-KEPT**: speed (not momentum) is shared out: the pair keeps the first body's speed, or the speeds are averaged;
  - **P-ONE-MASS**: the total momentum is divided by one body's mass, not by the mass that moves after;
  - **P-TOTAL-SIZES** (from lesson 11): sizes added, signs dropped;
  - **P-SAME-SPEED-APART**: bodies that push apart from rest move off at the same speed;
  - **P-ALWAYS**: momentum of a single body is "always conserved", even with an outside force on it.
- **The puzzle:** the teaser of lesson 11. Trolley A (0.80 kg) rolls right at 1.5 m s⁻¹, trolley C (1.20 kg) rolls left at 1.0 m s⁻¹. A has putty on its front: they hit and stick. Which way does the joined pair move?
- **The "oh, interesting" moment:** **neither: two moving trolleys stop dead.** A is faster, C is heavier, and their momenta are exactly equal and opposite, so the total is zero before and after. The second one: in the bounce, the heavier C moves off at 1.20 m s⁻¹ while A comes back.

All numbers come from `src/physics/momentum.ts` and are re-checked by a test. Right is positive.

| Quantity | Value |
|---|---|
| A (0.80 kg, +1.5) hits B (0.80 kg, at rest), they stick | **0.75 m s⁻¹** (1.50: ÷ A's mass only · 1.20 m s⁻¹: that is the momentum) |
| Explore: B's mass 0.2 → 2.4 kg | v after from 1.20 to 0.375 m s⁻¹; Σp stays **+1.20 kg m s⁻¹** |
| A (+1.5) and D (0.40 kg, −1.5) stick | **0.50 m s⁻¹ right** (0.50 left · 1.50 right: sizes added · 0: "same speeds cancel") |
| The puzzle: A (+1.5) and C (1.20 kg, −1.0) stick | **0: they stop dead** (0.25 right: speeds averaged · 1.20 right: signs dropped) |
| A and C at rest, a spring pushes them apart, A goes left at 0.90 m s⁻¹ | **C: 0.60 m s⁻¹ right** (0.90: same speed · 1.35: masses swapped · 0.60 left) |
| A (+1.5) hits C at rest with a spring buffer, A comes back at 0.30 m s⁻¹ | **C: 1.20 m s⁻¹ right** (0.80: A's sign dropped · 1.00: A's momentum after left out · 1.50: C takes A's speed) |

## Story (14 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | A and C roll at each other; A has putty on its front | the track, A and C rolling in, the clip stops before they touch |
| 2 | hook | predict | "They hit and stick. Which way does the joined pair move?" A's way (faster) / C's way (heavier) / neither: it stops / not sure | the same |
| 3 | conserved | text + card | Third law: equal and opposite pushes for the same time, so what A loses C gains. Card: conservation of momentum | — |
| 4 | stick | choice | A hits B (0.80 kg) at rest, they stick: speed after → **0.75** | approach only; after Check the whole hit plays with the momentum line |
| 5 | heavier | explore | slider = B's mass; the momentum line shows Σp before and after. "Make B heavier: what happens to the total momentum after?" → **it stays +1.20** | the hit, again and again, momentum line |
| 6 | method | text + card | Choose +, total before = total after, signs in, solve. Card: using it | — |
| 7 | head-on | choice | A (+1.5) and D (0.40 kg, −1.5) stick → **0.50 right** | approach; after Check the hit and the momentum line |
| 8 | hook-again | choice (revisit) | A and C stick → **0: they stop dead** | approach; after Check they hit and stop, Σp = 0 on both rows |
| 9 | apart | text | Bodies at rest can push apart: total zero before and after, so equal and opposite momenta | — |
| 10 | spring | choice | A and C pushed apart, A left at 0.90 → **C 0.60 right** | at rest with a squashed spring; after Check they fly apart |
| 11 | bounce | choice | A hits C at rest (spring buffer), A comes back at 0.30 → **C 1.20 right** | approach; after Check the bounce |
| 12 | outside | text + card | Only with no external force. A falling ball gains momentum: its weight comes from outside. Card: external force | — |
| 13 | ramp | choice | A trolley rolls up a ramp and slows down. Is its momentum conserved? → **no: part of its weight acts along the ramp** | — |
| 14 | rules | text | Total before = total after with signs; stuck bodies share one velocity; from rest, equal and opposite momenta | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| wagons | a 25 000 kg wagon at 3.0 m s⁻¹ couples to a 15 000 kg wagon at rest. Speed after? | **1.88 m s⁻¹** (5.00: the other wagon alone · 1.50: half · 1.13: masses swapped) |
| astronaut | an 80 kg astronaut at rest throws a 2.0 kg wrench at 6.0 m s⁻¹. Astronaut's velocity? | **0.150 m s⁻¹ opposite** (0.146: ÷ both masses · 0.150 the same way · 6.0 opposite) |
| gliders | air track: 2.0 kg glider at 3.0 m s⁻¹ right meets 1.0 kg at 2.0 m s⁻¹ left; the 1.0 kg one goes right at 2.0. The 2.0 kg one? | **1.0 m s⁻¹ right** (1.0 left · 3.0 right: signs dropped · 2.0 right: B's momentum after left out) |
| falling | a ball falls freely and speeds up. Which statement is right? | **its momentum is not conserved: its weight is an external force on it** |

**You can now:** state when momentum is conserved · find the velocity of bodies that stick after a collision · find an unknown velocity after a bounce or a push apart · use signs for bodies moving opposite ways.

**Recap:** A and C stuck and still, the momentum line with A's +1.20 and C's −1.20: "Two moving trolleys, total momentum zero: they stop dead."

**Notebook card:** `Σp before = Σp after` — "With no external force, the total momentum before a collision equals the total after."

## What is built

1. Physics, `src/physics/momentum.ts`: `stickVelocity`, `velocityAfter` (the other body's velocity from conservation), and the clip of a collision (`collisionTimes`, `collisionRun`: steady speeds, a short contact in which both velocities change at constant rates with the total momentum the same at every instant, then steady speeds again; or two bodies at rest pushed apart by a spring). Test.
2. Collide figure (`src/figures/CollideFigure.tsx`): one track, two trolleys (A with putty or a spring buffer), hollow velocity arrows, played in real time by `collisionRun`; before Check only the approach plays (the clip stops before they touch). Under the track an optional **momentum line** with two rows, BEFORE and AFTER: A's momentum arrow, then B's from its tip, and the total Σp marked; a dashed line joins the two Σ marks, so the total visibly never moves.
3. Content `src/content/collisions.ts` + test, `ready: true` on the map; new misconceptions in `docs/LESSON_FRAMEWORK.md`, 12c.

## Open for the owner

- **No kinetic energy yet.** The bounce in screen 11 happens to be perfectly elastic (0.900 J before and after), but elastic / inelastic is Unit 4, so the lesson does not mention it.
