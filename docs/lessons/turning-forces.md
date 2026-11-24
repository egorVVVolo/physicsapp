# Lesson spec — "Turning forces"

19 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `moments` · level 3 "Momentum and moments", third lesson · WPH11 point **15** (moment of a force = Fx, x the perpendicular distance between the line of action and the pivot) · ~12 min
- **Idea:** a force turns a body about a pivot. Its turning effect, the **moment**, is the force times the **perpendicular distance from the pivot to the force's line of action**, not the distance to where it is applied. A force at an angle has a shorter perpendicular distance (or, the same thing, only its component at right angles turns). Moments have a sense, clockwise or anticlockwise: the same way they add, opposite ways they subtract.
- **Not in this lesson:** the principle of moments for a body in equilibrium and centre of gravity (point 16, the next lesson "Keeping balance"); the word "couple" (not in WPH11).
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12c):
  - **M-POINT**: the distance to the point where the force acts, not the perpendicular distance to its line of action;
  - **M-TRIG**: the wrong side of the triangle (cos for sin), so the angled pull gets the longer distance;
  - **M-THROUGH**: a force pointing along the lever "pulls hardest"; a force through the pivot has a moment;
  - **M-UNIT**: distance left in cm, force ÷ distance, the unit N (or J) instead of N m;
  - **M-BIG-FORCE**: the bigger force always has the bigger moment;
  - **M-SENSE**: moments added whatever their sense;
  - **M-CANCEL**: equal and opposite forces cannot turn a body.
- **The puzzle:** a wheel nut is stuck. Mia and Leo each try the same 0.30 m spanner with the same 40 N. Mia pulls at the very end, but at 30° to the handle. Leo pulls at right angles, 20 cm from the nut. Whose pull turns the nut harder?
- **The "oh, interesting" moment:** **Leo's**, though he is nearer the nut: 8.0 N m against 6.0 N m. Draw Mia's line of action and drop a perpendicular from the nut: it is only 0.15 m long, half the spanner. A longer lever does not help if you pull at an angle. And pushed along the handle, the same 40 N does nothing at all.

All numbers come from `src/physics/moments.ts` and are re-checked by a test. Anticlockwise is positive inside the model; the text says "clockwise" / "anticlockwise".

| Quantity | Value |
|---|---|
| Leo: 40 N at right angles, 20 cm from the nut | **8.0 N m** (800 N m: cm left in · 200 N m: F ÷ x · 8.0 N: wrong unit) |
| Explore: Mia's pull from 0° to 90° to the handle | x = 0.30 sin θ: **0 m** along the handle, 0.15 m at 30°, 0.30 m at right angles |
| The puzzle: Mia, 40 N at the end (0.30 m), at 30° to the handle | **6.0 N m: Leo's is bigger** (12.0 N m: distance to the point · 10.4 N m: cos instead of sin · the same) |
| A sign (50 N) hangs from the end of a 2.0 m pole fixed to a wall at 30° above the horizontal | the distance to use is the **horizontal** one, 1.73 m; moment **86.6 N m** (100 N m: along the pole · 50.0 N m: the vertical height) |
| A bar pivoted at its middle: 30 N hangs 0.50 m left, 50 N hangs 0.20 m right | 15.0 N m anticlockwise, 10.0 N m clockwise: **5.0 N m anticlockwise** (25.0: added · 5.0 clockwise: the bigger force wins) |

## Story (13 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | A stuck wheel nut; Mia and Leo, the same spanner, the same 40 N | two panels, MIA and LEO: the nut, the spanner, each pull as an arrow |
| 2 | hook | predict | "Whose pull turns the nut harder?" Mia's: further out / Leo's: at right angles / the same / not sure | the same |
| 3 | moment | text + card | A force can turn a body about a pivot: its **moment**. A door: push at the handle, not by the hinge. Card: for a force at right angles, moment = force × distance from the pivot, in N m | — |
| 4 | leo | choice | Leo's moment → **8.0 N m** | Leo's panel alone, "M = ?"; after Check the distance and "8.0 N m" with a turning arc |
| 5 | line | text + card | A force at an angle: extend its arrow into its **line of action**. What counts is the **perpendicular distance** from the pivot to that line. Card: moment = Fx | — |
| 6 | angle | explore | slider = the angle of Mia's pull to the handle, 0°–90°. The line of action and the perpendicular from the nut follow, x is written on it. "Point the pull along the handle. What is its moment?" → **zero: its line of action passes through the nut** | Mia's panel alone, big |
| 7 | two-ways | text + card | The same moment two ways: F × (r sin θ), or only the component at right angles turns: (F sin θ) × r | — |
| 8 | hook-again | choice (revisit) | Mia's moment against Leo's 8.0 → **6.0 N m: Leo's is bigger** | both panels; after Check both perpendiculars and both moments |
| 9 | pole-x | tapFig | The sign on the pole: three dashed distances (along the pole, the height, the horizontal). "Which distance do you multiply the weight by?" → **the horizontal one** | the pole figure with candidates |
| 10 | pole | choice | Moment of the sign's weight about the fixing → **86.6 N m** | the pole figure, "M = ?"; after Check the horizontal distance and the moment |
| 11 | sense | text | Moments turn one way or the other, **clockwise** or **anticlockwise**. The same way: add. Opposite ways: subtract. The body starts to turn the way of the bigger total | — |
| 12 | bar | choice | The bar with two loads → **5.0 N m anticlockwise** | the bar on its pivot, two loads; after Check two turning arcs and the resultant |
| 13 | rules | text | Moment = F × perpendicular distance to the line of action; a force through the pivot has none; mind the sense. Teaser: what if the two senses cancel exactly? Next lesson | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| pedal | a bicycle crank 0.17 m long points 60° below the horizontal; the foot pushes straight down with 300 N. Moment about the axle? | **25.5 N m** (51.0: the crank's length · 44.2: sin 60° · 1760: F ÷ x) |
| wheel | a steering wheel 0.36 m across; the left hand pushes up with 20 N, the right hand pushes down with 20 N. Total moment about the centre? | **7.2 N m** (0: "the forces cancel" · 3.6: one hand only · 14.4: the diameter as the distance) |
| bolt | a bolt needs a moment of 90 N m. A mechanic pushes 250 N at 60° to the spanner's handle. How far from the bolt must she push? | **0.42 m** (0.36: the angle ignored · 0.72: cos instead of sin · 2.4: inverted) |
| slide | which change leaves the moment of a force about a pivot exactly the same? | **sliding the force along its own line of action** (a new angle at the same point · moved nearer the pivot · moved to the other side of the pivot: the same size, the opposite sense) |

**You can now:** find the moment of a force about a pivot · find the perpendicular distance to a force's line of action · handle a force at an angle in two ways · add clockwise and anticlockwise moments.

**Recap:** the two panels with both perpendiculars: Mia 6.0 N m, Leo 8.0 N m. "Further out but at an angle, Mia's pull turns the nut less than Leo's."

**Notebook card:** `moment = Fx` — "x is the perpendicular distance from the pivot to the force's line of action. Unit: N m."

## What is built

1. Physics, `src/physics/moments.ts`: `moment`, `perpendicularDistance` (r sin θ), `momentAtAngle`, `resultantMoment` (signed, anticlockwise +), `distanceForMoment`, and `footOfPerpendicular` for the figures. Test.
2. Figures: `src/figures/SpannerFigure.tsx` (one or two panels MIA / LEO: hex nut, spanner, pull arrows; the line of action extended and dashed, the perpendicular from the nut with a right-angle mark and x written on it; the turning arc with the moment; on the explore the slider turns Mia's pull), `PoleFigure.tsx` (a wall, a pole at an angle, a hanging sign and its weight; three tappable dashed distances; the horizontal distance and the moment after Check), `BarFigure.tsx` (a bar on a pivot, loads hanging at their distances, the turning arcs and the resultant after Check).
3. Content `src/content/turning-forces.ts` + test, `ready: true` on the map; new misconceptions in `docs/LESSON_FRAMEWORK.md`, 12c.

## Open for the owner

- **Nothing moves in these figures.** A stuck nut and a fixed pole do not turn, and making the bar swing would need its moment of inertia (not in the course). The figures draw themselves and the explore follows the slider; no pause button is needed.

## v3 changes (24 Nov)

Task D7. Mia and Leo are now **Priya and Tom** (they were already in "Two motions at once"); `SpannerPull.who` is `'PRIYA' | 'TOM'`. The puzzle (Tom 8.0 N m against Priya's 6.0 N m) and its recap are unchanged. 12 screens + 4 Skill check; chapters *The puzzle* → *Moment of a force* → *Back to the nut*; cast: Priya, Tom, Maya, Joel.

| Was | Now |
|---|---|
| choice `hook-again` (whose moment is bigger) | **build** `M = F × x` for Priya (wrong chips: 0.30 m "where she pulls", 0.26 m from cos), 6.0 N m; the nut turns after Check (C9) and both moments appear |
| choice `pole` | **spotError** `pole-error` (Maya uses the pole's length 2.0 m instead of the horizontal 1.73 m: 100 N m instead of 86.6) |
| text `two-ways` | removed (F r sin θ is in the line-of-action card and the exam card) |
| texts `sense`, `rules` | one sentence each, with a figure |
| `leo` choice | renamed `tom`; the nut now turns after Check there too |

`pole-x` (tap the distance) and the explore slider stay. Skill check: **build** (the pedal, `M = F × x`, 25.5 N m), **spotError** (Joel says the opposite forces on a steering wheel cancel, so the moments cancel: 0 instead of 7.2 N m), **choice** (sliding a force along its line of action), **exam card** on a bolt: (a) Calculate the distance `x = M ÷ (F sin θ)` [2] (0.416 m), (b) Explain why she must push further out at 60° [2] (order). The old wheel and bolt choices became the spotError and the card.
