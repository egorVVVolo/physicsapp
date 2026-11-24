# Lesson spec — "Picking the equation"

15 Nov 2026 · status: **built 15 Nov** (`src/content/picking-the-equation.ts`, checked in the web at 375×667, light and dark); not yet played on a phone, **not yet reviewed by the owner** (built in one go at the owner's request, so the spec and the lesson arrive together) · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `suvat` · level 1 "Motion" (blue) · WPH11 point **1** (the four equations of uniformly accelerated motion) · ~12 min
- **Idea:** each of the four suvat equations leaves out one of s, u, v, a, t. List what you know and what you want; the quantity nobody mentions picks the equation.
- **Misconceptions:** K-SUVAT-PICK (an equation with a quantity that is neither known nor wanted), K-HIDDEN-KNOWN ("stops" is not read as v = 0), K-BRAKE-LINEAR (twice the speed, twice the braking distance), K-V-DISTANCE (speed falls evenly with distance), K-SUVAT-ANY (one set of values across a change of acceleration), K-SIGN-CONV (a taken as positive while braking).
- **Trap problem (exam level, for Egor to approve):** a tree 40.0 m ahead, reaction time 0.50 s, 24.0 m s⁻¹, a = −8.0 m s⁻². Forgetting the thinking distance says "stops 4.0 m short"; in fact the car arrives at 11.3 m s⁻¹.
- **The "oh, interesting" moments:** twice the speed needs **four** times the road (9.0 m and 36.0 m), and on a v–t graph car B's triangle is exactly four of car A's. Then: where car A has stopped, car B is still doing **20.8 m s⁻¹** of its 24.0.

All numbers: car A 12.0 m s⁻¹, car B 24.0 m s⁻¹, a = −8.0 m s⁻² for both. Computed by `src/physics/kinematics.ts` (`brakingDistance`, `stoppingDistance`, `brakingPosition`…), re-checked by a test.

| Quantity | Value |
|---|---|
| Braking distance, car A / car B | 9.0 m / **36.0 m** |
| Braking time, car A / car B | 1.50 s / 3.00 s |
| Car B where car A stopped (9.0 m) | **20.8 m s⁻¹** (it has lost 3.2 m s⁻¹) |
| Car B, distance in each second | 20.0 m, 12.0 m, 4.0 m |
| Thinking distance (0.50 s) / stopping distance | 12.0 m / 48.0 m |
| Tree at 40.0 m: road left for braking / arrival speed | 28.0 m / **11.3 m s⁻¹** |

## Story (16 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Two identical cars brake as hard as they can; B is twice as fast as A | road, both cars at the 0 m line |
| 2 | hook | predict | "How much farther does B travel before it stops?" twice / three / four times / not sure | same |
| 3 | five | text + card | constant a → five quantities s, u, v, a, t; four equations, none uses all five | — |
| 4 | missing | choice | "Which quantity is missing from v² = u² + 2as?" → **t**; after Check every equation shows what it leaves out | equations |
| 5 | method | text | all four are on the formula sheet; list knowns and the unknown; the fifth picks the equation | — |
| 6 | knowns | choice | "Car A brakes until it stops. What else do you know?" → **v = 0** (hidden value) | road, car A |
| 7 | pick | tapFig | know u, v, a; want s → tap **v² = u² + 2as** | your list + equations |
| 8 | brake-a | choice | 0 = 12.0² + 2 × (−8.0) × s → **9.0 m**; then car A brakes on the figure | road, car A, plays |
| 9 | hook-again | choice (revisit) | car B from 24.0 m s⁻¹ → **36.0 m** (18.0: doubled · 27.0: tripled · 72.0: lost the 2); both cars brake | road, plays |
| 10 | time | tapFig | time for car B from the given values → **v = u + at**, 3.00 s | your list + equations |
| 11 | area | text + fig | distance is the area under v–t: B's triangle holds four of A's | v–t graph |
| 12 | still-fast | choice | B's speed where A stopped → **20.8 m s⁻¹** (12.0: half · 18.0: even with distance · 22.4: lost the 2) | road, marker "v = ?" |
| 13 | scrub | explore | slider = time; marks every second show 20.0, 12.0, 4.0 m. "In which second does B travel farthest?" | road, car B |
| 14 | reaction | text + card | reaction time: a = 0, s = ut; suvat works only while a is constant, so one stage at a time | — |
| 15 | stopping | choice | 0.50 s to react → **48.0 m** (36.0: braking only · 42.0: halved the thinking distance) | road, plays in two stages |
| 16 | tree | choice | tree 40.0 m ahead → **hits at 11.3 m s⁻¹** (stops 4.0 m short · 18.8 · 32.0: wrong sign of a) | road with the tree |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| train | Train slows from 30.0 to 10.0 m s⁻¹ in 25.0 s: which equation gives the distance in one step? (tap) | **s = ½(u + v)t** (500 m) |
| wet | Half the deceleration from the same speed: what happens to the braking distance? | **doubles to 72.0 m** (only u is squared) |
| cyclist | 6.0 m s⁻¹, +0.50 m s⁻² for 8.0 s: how far? | **64.0 m** (16.0: forgot ut · 48.0: forgot ½at² · 80.0: lost the ½) |
| limit | Half the speed, same brakes and reaction time: the stopping distance? | **between a quarter and a half** |

**You can now:** pick the suvat equation from what you know and what you want · spot hidden values, such as v = 0 when something stops · explain why twice the speed needs four times the braking distance.

**Recap (last screen):** both cars brake and stop with their distances: "Twice the speed, four times the road: car A stops in 9.0 m, car B needs 36.0 m."

**Notebook card:** `s = ½(u + v)t` — "Each suvat equation leaves one quantity out. Pick the one missing what you neither know nor want."

## What was built

1. **Physics** (`src/physics/kinematics.ts`): `brakingDistance`, `thinkingDistance`, `stoppingDistance`, `stoppingTime`, `brakingPosition`, `brakingVelocity`, `brakingTimeAt`, `distanceFromAverage`, `leftOut` (the quantity an equation lacks).
2. **Figure "road"** (`src/figures/RoadFigure.tsx`): side view, one lane per car, a ruler in metres (forward is +), velocity = outline arrow above the roof, acceleration = double chevron only while braking, wheels that roll without slipping, dimension lines once a car stands still, a marker for "v = ?", marks every second for the explore screen, a fallen tree. Plays by the model in real time.
3. **Figure "equations"** (`src/figures/EquationsFigure.tsx`): your list of s, u, v, a, t (known / wanted / not given) beside the four equations; each equation can show the quantity it leaves out; the equations are tap targets.
4. **Figure "brakeVt"** (`src/figures/BrakeGraph.tsx`): both v–t lines, the big triangle cut into four copies of the small one, each labelled 9.0 m.
5. Content + test (`src/content/picking-the-equation.ts`, `.test.ts`), `ready: true` on the map.

## Open for the owner

- Level and physics: is the tree problem the right trap, are the numbers (12 / 24 m s⁻¹, −8.0 m s⁻²) realistic enough?
- The claim "all four equations are on the formula sheet" should be checked against the WPH11 data sheet you get in the exam.
- Stopping distance is not a WPH11 point by name: it is used here as a context for two-stage suvat problems.

## v3 changes (24 Nov)

Task D2. The puzzle (twice the speed, four times the road: 9.0 m and 36.0 m) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *Picking an equation* → *Back to the cars*; cast: Tariq.

| Was | Now |
|---|---|
| choice "what else do you know?", tapFig "which equation fits?", choice "how far does A go?" | one **build with `choose`** (`brake-a`): pick `v² = u² + 2as` (the hint on each wrong equation names the missing or extra quantity), then build `s = (v² − u²) ÷ (2a)` with the hidden known v = 0, a with its sign; result 9.0 m |
| — | **estimate** `guess`: drag to where car B stops (tolerance 3 m, before the puzzle is answered), the truth plays the braking |
| choice "how far does car B go?" | choice **by idea**: why four times, not twice (u is squared); the number now comes from the estimate |
| choice "how fast is B where A stopped" (20.8 m s⁻¹) | removed |
| choice "does B hit the tree?" | **spotError** `tree`: Tariq compares 36.0 m with 40.0 m and forgets the 12.0 m of thinking distance |

Skill check: **build with `choose`** (the train, `s = ½(u + v)t`, 500 m), **spotError** (a rider covering 12.0 m: the negative root, −6.0 s, is kept), **choice** on halving the speed limit (kept), **exam card** (a) the thinking distance `s = ut` [1], (b) the braking distance `s = (v² − u²) ÷ (2a)` [2] with 20.0 m s⁻¹, 0.50 s and 5.0 m s⁻².

Found while building: the equation board let a power (`²`) or a bracket fall onto the next line without its chip; text written right against a box now stays with it (`lineItems` in `BuildView.tsx`).
