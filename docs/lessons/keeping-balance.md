# Lesson spec — "Keeping balance"

19 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `balance` · level 3 "Momentum and moments", fourth and last lesson · WPH11 point **16** (the principle of moments; the weight of a body acts at its centre of gravity) · ~12 min
- **Idea:** a body in **equilibrium** does not start to move or to turn: the resultant force is zero and the resultant moment is zero. So about **any** point, the clockwise moments add up to the anticlockwise moments: the **principle of moments**. A body's weight can be taken to act at one point, its **centre of gravity**; for a uniform beam, its middle. Taking moments about the point where an unknown force acts removes that force.
- **Not in this lesson:** couples, finding a centre of gravity by hanging a lamina (not in WPH11), toppling.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12c):
  - **B-EQUAL-WEIGHT**: "it balances, so the weights either side are equal";
  - **B-INVERSE**: the ratio turned upside down: the heavier person sits further out;
  - **B-SAME-SIDE**: a load on the same side forgotten, or its moment subtracted;
  - **B-SELF-WEIGHT**: the beam's own weight ignored, or put at the support, or at the middle of the longer part;
  - **B-END**: distances measured from the end of the beam, not from the pivot;
  - **B-SHARED**: two supports share the load equally wherever it stands;
  - **B-ONE-POINT**: moments balance only about the real pivot.
- **The puzzle:** Kai balances a broom on one finger, then saws it in two exactly where it balanced. Which piece is heavier: the long handle or the short piece with the brush?
- **The "oh, interesting" moment:** **the brush piece, three times over**: 6.0 N against 2.0 N. It balanced because the **moments** were equal, not the weights. The brush's weight acts only 0.15 m from the cut, the handle's 0.45 m out: three times the distance needs a third of the weight.

All numbers come from `src/physics/moments.ts` and are re-checked by a test. Positions along a beam are measured from its left end; anticlockwise is positive inside the model, the text says "clockwise" / "anticlockwise".

| Quantity | Value |
|---|---|
| Explore: Ana (300 N) stands 1.6 m left of the pivot; Ben (400 N) slides 0.4–2.0 m right | the plank tips Ana's way, then balances at **1.2 m** (480 N m each way), then tips Ben's way (1.6 m: the same distance · 2.1 m: ratio upside down) |
| Ana's 100 N box goes down 0.60 m left of the pivot: where does Ben stand now? | **1.35 m** (1.20: the box forgotten · 1.60: the box at Ana's distance · 1.05: the box's moment subtracted) |
| A uniform 3.0 m beam, 600 N, on a support 1.0 m from its left end: where does its weight act? | **at its middle**, 0.50 m right of the support (at the support · the middle of the long part) |
| Zoe stands on the left end and the beam balances: her weight? | **300 N** (600 N: "the same as the beam" · 900 N: the distance from the end, 1.5 m · 1200 N: ratio upside down) |
| The puzzle: the broom weighs 8.0 N; the brush piece's weight acts 0.15 m from the cut, the handle piece's 0.45 m | **brush 6.0 N, handle 2.0 N** (4.0 N each: "it balanced" · the handle: it is longer · 6.0 N handle: ratio upside down) |
| A uniform 4.0 m plank (200 N) rests on a trestle at each end; a 600 N painter stands 1.0 m from the left end. Push of the right trestle | moments about the left trestle: **250 N** (400 N: shared equally · 150 N: the plank forgotten · 550 N: the trestles swapped) |
| …and of the left trestle | 800 − 250 = **550 N** (350 N: the plank forgotten · 250 N: the same · 800 N: all of it) |

## Story (13 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Kai balances a broom on one finger, then saws it in two right where it balanced | the broom on a fingertip, the centre-of-gravity mark at the finger |
| 2 | hook | predict | "Which piece is heavier?" the brush piece / the handle piece / the same / not sure | the same, with the saw line |
| 3 | equilibrium | text + card | A body in **equilibrium** does not start to move or to turn: no resultant force, no resultant moment. Card: the principle of moments | — |
| 4 | seesaw | explore | slider = Ben's distance right of the pivot. The plank tips until an end rests on the ground, and lies level once the moments match; both totals are written at the top. "Where does the plank balance?" → **1.2 m** | the balance plank: Ana, Ben, the pivot, turning arcs |
| 5 | box | choice | Ana's 100 N box goes down 0.60 m left of the pivot: where must Ben stand now? → **1.35 m** | the plank with the box, Ben's distance "x = ?"; after Check the value and both totals |
| 6 | cg | text + card | Every bit of a body is pulled down; together they act like one force at one point, the **centre of gravity**. A uniform beam's is at its middle. A body balances when supported under it | — |
| 7 | beam-cg | tapFig | A uniform beam on a support 1.0 m from its left end, Zoe on that end: three dashed centre-of-gravity marks (at the support, the middle, the middle of the long part). "Where does the beam's own weight act?" → **the middle** | the beam, three candidates |
| 8 | beam | choice | The beam weighs 600 N: what is Zoe's weight? → **300 N** | the beam with its weight at the middle, Zoe "W = ?"; after Check her weight and both totals |
| 9 | hook-again | choice (revisit) | The broom: 8.0 N, the pieces' weights 0.15 m and 0.45 m from the cut. Which piece is heavier? → **the brush piece: 6.0 N against 2.0 N** | the broom with both pieces' weights as "?"; after Check their sizes |
| 10 | two-rules | text | Equilibrium also means no resultant force: the supports push up with the whole weight. Moments balance about **any** point: take them about an unknown force and it drops out | — |
| 11 | painter | choice | The painter on the plank: push of the right trestle → **250 N** | the plank on two trestles, the painter, the pushes as arrows, the right one "?" |
| 12 | painter-left | choice | …and the left trestle → **550 N** | the same, right push 250 N, the left one "?" |
| 13 | rules | text | Summary; the level is done | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| rule | a uniform metre rule balances on a knife-edge at the 40.0 cm mark with 0.50 N hanging at the 10.0 cm mark. Weight of the rule? | **1.50 N** (0.17 N: ratio upside down · 0.10 N: distances from the zero end · 0.50 N: "equal weights") |
| barrow | a loaded wheelbarrow weighs 400 N, acting 0.40 m from the wheel's axle; the handles are 1.20 m from the axle. Upward force at the handles? | **133 N** (1200 N: upside down · 400 N: all of it · 267 N: the wheel's share) |
| pole | two people carry a uniform 2.0 m pole (80 N) by its ends; a 120 N bucket hangs 0.50 m from the front end. Push of the front person? | **130 N** (100 N: shared equally · 90 N: the pole forgotten · 70 N: the back person's) |
| any | a student takes moments about a point where no force acts. What does she find? | **they still balance: any point works** (only about a support · only about the centre of gravity · every moment is zero there) |

**You can now:** use the principle of moments for a body in equilibrium · place a body's weight at its centre of gravity · find the push of each support on a beam · pick a pivot that removes an unknown force.

**Recap:** the broom with the saw line and both pieces: 6.0 N and 2.0 N. "Balanced at its centre of gravity, the short brush piece weighs three times as much as the handle."

**Notebook card:** `ΣF = 0, ΣM = 0` — "In equilibrium, clockwise moments equal anticlockwise ones about any point. Weight acts at the centre of gravity."

## What is built

1. Physics, `src/physics/moments.ts`: `momentsAbout`, `senseTotals`, `balancingPosition`, `balancingLoad`, `supportPushes`, `centreOfGravity`, `piecesAtBalance`. Test.
2. Figures: `src/figures/BeamFigure.tsx` (a plank on one pivot or two trestles; people and boxes standing on it, each push drawn down from the plank where it acts; the plank's own weight at its middle with the centre-of-gravity mark; the supports' pushes up; the turning arcs with each sense's total; on the explore the slider moves Ben and the plank tips until one end rests on the ground, or lies level when the moments match), `BroomFigure.tsx` (the broom on a fingertip, the saw line, the two pieces' weights at their centres of gravity with their distances).
3. Content `src/content/keeping-balance.ts` + test, `ready: true` on the map; new misconceptions in `docs/LESSON_FRAMEWORK.md`, 12c.

## Changed while building

- The plank with a load at its end became a 600 N beam with Zoe (300 N) standing on its end: a box cannot stand centred on the very end of a plank.
- The balance plank sits on a low pivot, so it tips only about 5° before its end rests on the ground: the totals at the top stay true (cos 5° ≈ 1). All distances are drawn level, under the ground.
- A number and its unit could part at a line end in every lesson ("0.60" / "m"). Fixed for all lessons: every string passes through `keepUnitsIn` (`src/content/units.ts`) when the lessons are collected.

## Open for the owner

- **The plank only tips to its stop.** How fast it tips would need its moment of inertia (not in the course), so it eases to where its end rests on the ground. Everything else stands still.
