# Lesson spec — "Momentum"

18 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `momentum` · level 3 "Momentum and moments", first lesson · WPH11 point **13** (use p = mv) · ~11 min
- **Idea:** momentum is mass times velocity, **p = mv**, in kg m s⁻¹. It is a **vector**: choose a positive direction and every momentum gets a sign. The **change** in momentum is final minus initial, Δp = mv − mu, with the signs in. So a body that bounces back changes its momentum **more** than one that stops dead: the wall has to take all its momentum away and then give it some the other way.
- **Not in this lesson:** conservation of momentum and collisions (point 14, next lesson); F = Δp / Δt and impulse are Unit 4 (WPH14), so they are left out.
- **Misconceptions** (new bank for the level, `docs/LESSON_FRAMEWORK.md`, 12c):
  - **P-SCALAR**: momentum treated as a scalar, signs dropped (a bounce from +1.20 to −0.80 gives "Δp = 0.40");
  - **P-STOP-MOST**: stopping dead is the biggest change a body can have;
  - **P-SPEED-ONLY**: the faster body has more momentum (a fast cricket ball against a slow bowling ball);
  - **P-TOTAL-SIZES**: a total momentum adds the sizes, whatever the directions;
  - **P-UNIT**: momentum given in N (a force) or worked out as m ÷ v.
- **The puzzle:** two 0.80 kg trolleys roll at 1.5 m s⁻¹ into a wall. Trolley A has a spring buffer and bounces back at 1.0 m s⁻¹; trolley B has a putty pad and stops dead. Which one has the bigger change in momentum?
- **The "oh, interesting" moment:** **the one that bounces, by a lot: 2.00 against 1.20 kg m s⁻¹.** Stopping dead feels like "the biggest change", but the bounce goes through zero and out the other side. A second one: a 5.0 kg bowling ball rolling at 1.2 m s⁻¹ has more momentum than a cricket ball bowled at 35 m s⁻¹. And a teaser for the next lesson: two trolleys heading at each other can have a total momentum of exactly zero.

All numbers come from `src/physics/momentum.ts` and are re-checked by a test. Towards the wall is positive.

| Quantity | Value |
|---|---|
| Each trolley, 0.80 kg at 1.5 m s⁻¹: momentum | **+1.20 kg m s⁻¹** |
| Mistakes: m ÷ v / v ÷ m / the unit N | 0.533 / 1.88 kg m s⁻¹ / 1.20 N |
| A after the bounce, 1.0 m s⁻¹ back | **−0.80 kg m s⁻¹** |
| B's change in momentum (stops) | **−1.20 kg m s⁻¹** |
| A's change in momentum (the puzzle) | **−2.00 kg m s⁻¹** (sizes subtracted: −0.40 · wrong way round: +2.00 · "the same as B": −1.20) |
| Explore: A's bounce speed 0 → 1.5 m s⁻¹ | Δp from −1.20 to −2.40 kg m s⁻¹: a full-speed bounce is twice a dead stop |
| Cricket ball 0.16 kg at 35 m s⁻¹ / bowling ball 5.0 kg at 1.2 m s⁻¹ | 5.60 / **6.00 kg m s⁻¹** |
| A (0.80 kg, +1.5 m s⁻¹) and C (1.20 kg, −1.0 m s⁻¹) head at each other: total | **0** (sizes added: 2.40 · A alone: 1.20) |

## Story (14 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Two trolleys roll into a wall: one has a spring buffer, one a putty pad | the wall, both trolleys, played by the model: A bounces back, B stops |
| 2 | hook | predict | "Which one has the bigger change in momentum?" A / B / the same / not sure | the same, playing |
| 3 | p | text + card | **p = mv**, kg m s⁻¹; a vector, the way the velocity points. Card: momentum | — |
| 4 | first-p | choice | A's momentum before it hits → **1.20 kg m s⁻¹** (0.533: m ÷ v · 1.20 N: a force's unit · 1.88: v ÷ m) | A rolling in, the momentum arrow "p = ?" until Check |
| 5 | signs | text | Choose a positive direction, as for velocity: towards the wall is +. Coming back, v is negative, and so is p | — |
| 6 | back-p | choice | A's momentum after the bounce → **−0.80** (+0.80 · 0 · −1.20) | A moving back, "p = ?" until Check |
| 7 | change | text + card | Δp = mv − mu, final minus initial, signs in. Card: change in momentum | — |
| 8 | stop-dp | choice | B's change in momentum → **−1.20** (+1.20: initial minus final · 0: that is the final momentum) | B stopped, the momentum line appears after Check: p from +1.20 to 0, Δp arrow |
| 9 | bounce | explore | slider = A's bounce speed, 0–1.5 m s⁻¹; the momentum line shows p before, p after and Δp live. "Which landing changes the momentum most?" → **bouncing back as fast as it came** | A bouncing again and again, momentum line |
| 10 | hook-again | choice (revisit) | A's change in momentum → **−2.00** (−0.40 · +2.00 · −1.20) | A, the momentum line after Check |
| 11 | heavy-fast | choice | cricket ball 0.16 kg at 35 m s⁻¹ or bowling ball 5.0 kg at 1.2 m s⁻¹: more momentum? → **the bowling ball** | the two balls with velocity arrows; after Check the momentum arrows, to one scale |
| 12 | total | text + card | The total momentum of several bodies: add each momentum with its sign. Card: total momentum | — |
| 13 | head-on | choice | A at +1.5 m s⁻¹ and C (1.20 kg) at −1.0 m s⁻¹ head at each other. Total momentum? → **0** (2.40 · 1.20) | the two trolleys on one track; after Check the momentum arrows and Σp = 0 |
| 14 | rules | text | p = mv, a vector with a sign; Δp = mv − mu; a bounce changes momentum more than a stop | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| car | a 1500 kg car has 27 000 kg m s⁻¹ of momentum. Its speed? | **18.0 m s⁻¹** (0.0556: m ÷ p · 4.05 × 10⁷: multiplied · 36.0: twice) |
| tennis | a 0.058 kg tennis ball hits a wall at 30 m s⁻¹ and rebounds at 22 m s⁻¹. Size of the change in momentum? | **3.02 kg m s⁻¹** (0.464: speeds subtracted · 1.74: the momentum before · 1.28: the momentum after) |
| drop | a 0.50 kg ball is dropped from rest and falls for 1.2 s. Momentum just before it lands? | **5.89 kg m s⁻¹ downward** (0.600: m × t · 4.91: the weight, mg · 2.94: with the average speed) |
| skaters | a 70 kg skater glides east at 3.0 m s⁻¹, a 50 kg skater west at 4.0 m s⁻¹. Total momentum? | **10 kg m s⁻¹ east** (410 east: sizes added · 10 west · zero) |

"drop" brings back v = u + at from Motion; "skaters" is the head-on idea in a new context.

**You can now:** calculate momentum with p = mv, in kg m s⁻¹ · give momentum a sign from a chosen positive direction · find a change in momentum for a stop or a bounce · add momenta with their signs to find a total.

**Recap:** both trolleys with their momentum lines: "A bounce changes momentum more than a dead stop: −2.00 against −1.20 kg m s⁻¹."

**Notebook card:** `p = mv` — "Momentum is mass times velocity, a vector: a bounce changes it more than a dead stop."

## What is built

1. Physics, `src/physics/momentum.ts`: `momentum`, `momentumChange`, `totalMomentum`, `speedFromMomentum`, and the clip of a trolley hitting a wall (`wallRun`: steady speed, then a buffer squashes with a constant deceleration until the trolley moves back at its bounce speed, or stops). Test.
2. Wall figure (`src/figures/WallFigure.tsx`): a track and a wall, trolleys A (spring buffer) and B (putty pad), each with a solid momentum arrow that shrinks through zero and flips during the bounce; under the track an optional **momentum line** per trolley (before ○, after ●, Δp arrow between them). Played in real time by `wallRun`.
3. Bodies figure (`src/figures/BodiesFigure.tsx`): bodies with velocity arrows (a cricket ball, a bowling ball, trolleys); once answered, momentum arrows to one scale and the total.
4. Content `src/content/momentum.ts` + test, `ready: true` on the map; the new misconceptions in `docs/LESSON_FRAMEWORK.md`, 12c.

## Open for the owner

- **Momentum is drawn as a solid ink arrow,** not blue: blue means force. Velocity stays an outline arrow.
- **Δp without F = Δp / Δt.** The force side waits for Unit 4; here Δp is practice with signs that the collisions lesson needs.
