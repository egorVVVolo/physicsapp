# Lesson spec — "Which way is positive?"

17 Nov 2026 · status: **built 17 Nov** (`src/content/which-way-is-positive.ts`, checked in the web at 375×667, light and dark theme); not yet played on a phone, **not yet reviewed by the owner** (built straight away: "you can make the new lesson") · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `vectors-signs` · level 1 "Motion" (blue) · WPH11 points **4** (scalars and vectors, with examples) and **6** (resultant of two coplanar vectors: right angles by calculation, any angle by drawing) · ~11 min
- **Idea:** a vector has a direction, and on a straight line the direction is a sign. Velocity is built from displacement, speed from distance. You choose which way is positive, once, and every sign follows from it. Off the line, vectors add tip to tail.
- **Misconceptions:** K-DIST-DISP (800 m path called 800 m displacement), K-SPEED-VEL (−4.0 m s⁻¹ called slower than −1.0 m s⁻¹; average velocity = distance ÷ time), K-SCALAR-VEC (3.0 km + 4.0 km = 7.0 km at right angles), sign dropped in a change of velocity (a bounce: 2.0 instead of −10.0 m s⁻¹), weight called a scalar.
- **The puzzle:** runners A and B leave the same lamp post. In 200 s runner A runs 300 m east, then 500 m west; runner B walks 200 m west. Whose average velocity is greater?
- **The "oh, interesting" moment:** **the same**, −1.0 m s⁻¹ each (east positive). Runner A ran four times as far, at four times the average speed, and on the track they finish side by side: A catches B exactly at 200 s.

All numbers from `src/physics/` (the runs are `Trip`s of steady velocity in `kinematics.ts`; sizes and angles of vectors in `vectors.ts`), re-checked by a test.

| Quantity | Value |
|---|---|
| Runner A: 300 m E at 4.0 m s⁻¹ (75 s), 500 m W at 4.0 m s⁻¹ (125 s) | distance **800 m**, displacement **−200 m** |
| Runner A: average speed / average velocity | **4.0 m s⁻¹** / **−1.0 m s⁻¹** (west positive: +1.0) |
| Runner B: 200 m W at 1.0 m s⁻¹ | displacement −200 m, average velocity **−1.0 m s⁻¹** |
| Runner A back at the lamp post | **150 s**, distance 600 m |
| Hiker: 3.0 km N, then 4.0 km E | **5.0 km**, **53° east of north** (7.0 km walked) |

## Story (16 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | A runs 300 m east then 500 m west, B walks 200 m west, both in 200 s | track: both runners at the lamp post |
| 2 | hook | predict | "Whose average velocity is greater?" A / B / the same / not sure | track |
| 3 | scalar | text | scalar = size only (distance, speed, mass, time); vector = size and direction (displacement, velocity, acceleration, force) | — |
| 4 | distance | text + fig | distance = length of the path: 300 + 500 = 800 m | track: A's two legs |
| 5 | displacement | choice | displacement = arrow from start to finish → **200 m west** (800 m: the path · 200 m east · 500 m west) | track: legs, s = ? |
| 6 | signs | text | on a line a direction is a sign: east +, so +300 + (−500) = −200 m; the minus is a direction | — |
| 7 | avg-velocity | choice | average velocity = displacement ÷ time → **−1.0 m s⁻¹** (+4.0: average speed · +1.0: lost the sign · −4.0: distance with a sign) | track: legs and s |
| 8 | hook-again | choice (revisit) | B walks 200 m west in 200 s → **the same, −1.0 m s⁻¹ each** | track: both, both s arrows |
| 9 | race | text + fig | played 20× faster: A runs four times as far, they finish side by side | track, plays |
| 10 | faster | choice | A runs back at −4.0, B walks at −1.0: who is faster? → **A** (−1.0 > −4.0 as numbers, but speed is the size) | track, both mid-run with velocity arrows |
| 11 | flip | choice | choose west as positive: A's average velocity → **+1.0 m s⁻¹**; why: pick once and keep it | track, west is + |
| 12 | scrub | explore | slider = time; A's distance and displacement live. "When is A back at the lamp post?" → **150 s** | track, live |
| 13 | plane | text | off a line a sign is not enough; add vectors **tip to tail**; the **resultant** joins the first tail to the last tip | — |
| 14 | hiker | choice | 3.0 km N, then 4.0 km E: how far from the start → **5.0 km** (7.0: added the sizes · 1.0: subtracted) | vectors, resultant ? |
| 15 | bearing | choice | direction of the resultant → **53° east of north** (37°: tan⁻¹(3/4), the angle from east · 45°: only for equal legs · 53° west of north: wrong side) | vectors, θ = ? |
| 16 | rules | text + card | any other angle: a scale drawing; card with the three ways to add | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| scalar | Which of these quantities is a scalar? weight / momentum / mass / acceleration | **mass** (weight is a force) |
| half-lap | half a lap of a circular 400 m track in 40 s: size of the average velocity | **3.2 m s⁻¹** (diameter 127 m ÷ 40 s; 5.0: average speed · 1.6: radius · 0: a full lap) |
| river | swimmer 1.2 m s⁻¹ straight across, current 0.9 m s⁻¹: resultant speed | **1.5 m s⁻¹** (2.1 added · 0.3 subtracted · 0.8 squares subtracted) |
| bounce | ball hits a wall at 6.0 m s⁻¹, bounces back at 4.0 m s⁻¹, towards the wall +: change in velocity | **−10.0 m s⁻¹** (−2.0 · +2.0 · +10.0) |

**You can now:** sort quantities into scalars and vectors · tell distance from displacement and speed from velocity · keep one sign convention through a problem · add two vectors at right angles.

**Recap:** the race played to 200 s: "Runner A ran 800 m, runner B walked 200 m, yet both ended 200 m west after 200 s: the same average velocity, −1.0 m s⁻¹."

**Notebook card:** `velocity = s ÷ t` — "Velocity uses displacement, speed uses distance. A minus sign is a direction: choose + once and keep it."

## What was built

1. Physics: `src/physics/vectors.ts` — size of a resultant at right angles, the angle from a given axis; the half-lap displacement. The runs reuse `Trip` (phases of steady velocity).
2. Figure "track" (`src/figures/TrackFigure.tsx`): a straight east–west track seen from the side, a lamp post at 0, one or two runners moved by the model; runner A's two legs as arrows, displacement arrows (unknown "s = ?" / shown), outline velocity arrows that flip at the turn, a played race sped up ×20 (written on the sheet), a live time on the explore screen (the sheet header reads out A's distance and s), either direction as + (the ruler's numbers flip).
3. Figure "vectors" (`src/figures/VectorsFigure.tsx`): squared paper with N, two arrows tip to tail, the resultant (dashed "?" or solid with its size), the angle arc (θ = ? or its value).
4. Content + test, `ready: true` on the map.

## Open for the owner

- Level: is the start (distance vs displacement) too easy for a strong student? It is quick and leads straight into the puzzle and the sign traps.
- The runners are small standing figures that slide along the track (no running animation).
- Point 6 "any angle by drawing" is only told (rules screen), not practised: a drag-to-draw scale drawing would need a new kind of screen.

## v3 changes (23 Nov)

Pilot lesson of format v3 (task D1). The puzzle, its answer and the recap are unchanged. 15 screens + 4 Skill check; chapters: *The puzzle* → *Signs and arrows* → *Back to the runners*; cast: Noor.

| Was | Now |
|---|---|
| text "scalar / vector" | **sort** `quantities`: Scalar / Vector — distance, displacement, speed, velocity, time, acceleration |
| choice "what is A's displacement?" + text "Sped up 20 times…" | **estimate** `finish`: drag to where A finishes (−400…+400 m, answer −200 m from `tripPosition`, tolerance 20 m); checking plays the race |
| choice "A's average velocity?" | **build** `v = {s} ÷ {t}`; chips −200 m, 200 s, 800 m (the distance), +200 m (the sign), 300 m (one leg); result −1.0 m s⁻¹ |
| — | **spotError** `working`: Noor divides the distance, 800 ÷ 200 = +4.0 (the average speed) |
| choice "who is moving faster?" | removed (speed vs velocity is now the sort and the spotError) |
| text "plane" + choice "how far is the hiker?" | text `plane` with a figure + **worked** example `hiker` (tip to tail, Pythagoras, last line picked) |
| puzzle revisit in the middle | the revisit now opens chapter 3 (`Back to the two runners.`), followed by the explore slider |

Skill check: **build** the swimmer's resultant (was a choice with four numbers), **spotError** for the wall bounce (the working uses sizes, −2.0 instead of −10.0), **choice** on the sign of the acceleration of a cyclist braking while riding west (options differ by idea), **exam card** on the half lap: (a) State the difference between distance and displacement [1], (b) Calculate the size of the average velocity [2] (build, 127 m ÷ 40 s = 3.2 m s⁻¹).

Deviations from the task text: the hiker (3 + 4 km) became the worked example in the story, so the Skill check build uses the swimmer instead; the "choice" rule needed one more non-choice interactive screen, hence the worked example.
