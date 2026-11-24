# Lesson spec — "Work done"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `work` · level 4 "Energy", first lesson · WPH11 point **17** (ΔW = FΔs, including a force that is not along the line of motion) · ~11 min
- **Idea:** a force does **work** when what it acts on moves in the direction of the force: work done = force × distance moved in the direction of the force, ΔW = FΔs, in joules (1 J = 1 N m). Only the part of a force along the motion counts: at an angle θ, ΔW = FΔs cos θ, so a force at right angles to the motion does **no work**. Work done is **energy transferred**.
- **Not in this lesson:** kinetic and gravitational potential energy by name (next lesson; the ramp only hints at it), power, the area under a force–distance graph (materials).
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12d):
  - **W-EFFORT**: holding or carrying a load is work, because it is tiring;
  - **W-RESULTANT**: at a steady speed (no resultant force) no work is done;
  - **W-WHOLE**: the whole force is used, not its part along the motion;
  - **W-TRIG**: sin for cos;
  - **W-WEIGHT**: the weight times any distance (sideways, or along a slope);
  - **W-RAMP**: a longer ramp, with its smaller push, needs less work;
  - **W-UNIT**: force ÷ distance, or the mass used for the weight;
  - **W-STORED**: work done against friction is stored in the body.
- **The puzzle:** Nadia and Omar take identical 15 kg suitcases 30 m along a level platform at a steady speed. Nadia carries hers by the handle; Omar pulls his on its wheels, 40 N along a handle at 60° to the floor. Who does more work on their suitcase?
- **The "oh, interesting" moment:** **Omar, 600 J, and Nadia none at all.** Her 147 N lift is at right angles to the motion. Her arms ache because muscles use energy just to hold a load, but none of it goes into the suitcase.

All numbers come from `src/physics/work.ts` (and `weight` in `dynamics.ts`), g = 9.81 m s⁻², and are re-checked by a test.

| Quantity | Value |
|---|---|
| The mover: a 40 kg box pushed 6.0 m at a steady speed, her horizontal push balancing 150 N of friction | **900 J** (0 J: "steady speed, no work" · 2350 J: weight × distance · 25 J: force ÷ distance) |
| Explore: Omar's 40 N pull over 30 m, the handle from 0° to 90° | ΔW = 40 × 30 × cos θ: 1200 J flat, 600 J at 60°, 0 J straight up |
| The puzzle | **Nadia 0 J, Omar 600 J** (4410 J and 1200 J: whole forces · 4410 J and 600 J: carrying counts · 0 J and 1200 J: the whole pull) |
| Which force does work? | **a crane cable lifting a load** (a push on a wall that does not move · a waiter's push up on a tray as he walks · the floor's push on a sliding box) |
| Explore: a 40 kg washing machine raised 1.2 m into a van along a ramp from 1.6 m to 4.0 m long, friction ignored | push mg h ÷ L from 294 N to 118 N; work **471 J** every time, the same as lifting it (392 N × 1.2 m) |
| The 3.0 m ramp: the push, found from the work | 471 ÷ 3.0 = **157 N** (392 N: the whole weight · 360 N: mg cos θ · 1410 N: work × distance) |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Nadia and Omar take identical 15 kg suitcases 30 m along a platform | two panels: Nadia's hand holds her suitcase up, Omar's pulls his by the handle; the floor slides past |
| 2 | hook | predict | "Who does more work on their suitcase?" Nadia / Omar / the same / not sure | the same, with the hands' forces |
| 3 | work | text + card | **work**: force × distance moved in the direction of the force; **joules** | — |
| 4 | mover | choice | the mover's push → **900 J** | one panel: the box, her push, the friction, Δs = 6.0 m, "ΔW = ?" |
| 5 | angle | text + card | only the part **along the motion** does work; ΔW = FΔs cos θ; at 90° **no work** | — |
| 6 | handle | explore | slider = the angle of Omar's handle. "What happens to the work as the handle gets steeper?" → **it falls, to zero at 90°** | Omar's suitcase alone, the pull split into forward and up parts, ΔW at the top |
| 7 | hook-again | choice (revisit) | how much work does each do? → **Nadia 0 J, Omar 600 J** | two panels with the forces split; ΔW "?" until answered |
| 8 | energy | text | work done is **energy transferred**: Omar's 600 J heats the wheels; Nadia's muscles | — |
| 9 | which | choice | which force does work? → **the crane cable** | — |
| 10 | ramp | explore | slider = ramp length. "What happens to the work?" → **the same, 471 J** | the van, the ramp, the machine, the push along the ramp, the dashed straight lift, both sums |
| 11 | ramp-push | choice | the 3.0 m ramp: what push? → **157 N** | the ramp at 3.0 m, push "?" until answered |
| 12 | rules | text | summary; next: the energy the lift stored | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| mower | Ella pushes a lawnmower 25 m with 60 N along its handle, at 40° below the horizontal. Work done by her push? | **1150 J** (1500 J: the whole force · 964 J: sin · 46.0 J: the distance forgotten) |
| stairs | a 55 kg student climbs stairs rising 3.6 m over 4.8 m across. Work done against gravity? | **1940 J** (2590 J: across · 3240 J: along the stairs · 198 J: the mass) |
| joule | the joule in SI base units | **kg m² s⁻²** (kg m s⁻²: the newton · kg m s⁻¹: momentum · kg m² s⁻¹) |
| slide | a box slides 2.5 m and stops, friction 24 N. Work done against friction, and where does the energy go? | **60 J, heating the box and the floor** (60 J, stored in the box · 9.6 J · 0 J: it ends at rest) |

**You can now:** calculate work done as force × distance moved in the direction of the force · use ΔW = FΔs cos θ for a force at an angle · spot forces that do no work · treat work done as energy transferred.

**Recap:** the platform with both suitcases: Nadia 0 J, Omar 600 J. "Nadia's 147 N lift is at right angles to the motion and does no work. Omar's 40 N pull does 600 J."

**Notebook card:** `ΔW = FΔs cos θ` — "Work = force × distance moved along the force. It is energy transferred; a force at 90° to the motion does none."

## What is built

1. Physics, `src/physics/work.ts`: `workDone`, `forceFromWork`, `liftWork`, `rampPush`. Test. `sig` (3 significant figures) in `src/physics/format.ts`.
2. Figures: `src/figures/PlatformFigure.tsx` (one panel or two side by side; a load moved along a level floor by a hand: carried by its handle, pulled on its wheels, or pushed from behind; the hand's force from where it acts, all to one scale per figure; split into its parts along and across the motion with the angle; friction along the floor; the motion as an outline arrow with Δs; ΔW at the top of each panel; played, the floor slides past at a steady speed), `RampFigure.tsx` (a van, a ramp of any length up to its floor, the washing machine on it with the push along the ramp, the same machine lifted straight up beside the van, dashed; the work both ways).
3. Content `src/content/work-done.ts` + test, `ready: true` on the map; the Energy misconception bank in `docs/LESSON_FRAMEWORK.md`, 12d.

## v3 changes (24 Nov)

Task D8. The puzzle (Nadia 0 J, Omar 600 J) and its recap are unchanged. 12 screens + 4 Skill check; chapters *The puzzle* → *What work is* → *Back to the platform*; cast: Nadia, Omar, Pia, Jonas. The lawn-mower pusher is now Pia (Ella is in the Energy lessons).

| Was | Now |
|---|---|
| choice `hook-again` (who does how much) | **build** `W = F × s × cos θ` for Omar (wrong chips: 147 N, 30°), 600 J; Nadia's 0 J comes with the figure after Check |
| choice `which` | **sort** `which`: does work / no work (the wall, the tray, a crane cable, the floor's push, friction) |
| choice `ramp-push` | **spotError** `ramp-error` (Jonas divides the work by the van's height: 392 N instead of 157 N) |
| texts `energy`, `rules` | one sentence each, with a figure |

`mover` (choice), `handle` and `ramp` (explore) stay. Skill check: **build** (the lawnmower, 1150 J), **sort** (gravity on a falling ball, a weightlifter holding still, brakes, the ice's push, a rope on a sledge), **choice** (the joule in base units), **exam card** on the stairs: (a) Calculate the work against gravity [2] (1940 J, wrong chips: 4.8 m across, 6.0 m along the flight), (b) Explain why the 4.8 m across does not change the work [2] (order). The slide-friction question is gone. The gallery samples (`/gallery/steps`) still use `OMAR`, `TRIP`, `VAN` from this file.
