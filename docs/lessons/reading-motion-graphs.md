# Lesson spec — "Reading motion graphs"

15 Nov 2026 · status: **in progress** (spec written first; built the same day at the owner's request "decide yourself and go") · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `motion-graphs` · level 1 "Motion" (blue) · WPH11 points **2** (s–t, v–t, a–t graphs) and **3** (gradients and areas, non-uniform cases) · ~12 min
- **Idea:** a motion graph is not a picture of the road. Gradient of s–t = velocity, gradient of v–t = acceleration, area under v–t = displacement (negative below the axis).
- **Misconceptions:** K-GRAPH-PICTURE (crossing v–t lines = "they meet"; a flat v–t line = "at rest"), K-SLOPE-HEIGHT (fastest where the s–t line is highest), K-AREA-SIGN (area below the axis counted as positive), K-POINT-INTERVAL (final v × t), K-SUVAT-ANY (suvat on a curved v–t).
- **The puzzle:** car A drives past car B at a steady 10.0 m s⁻¹; at that instant car B sets off after it at 2.5 m s⁻². Their v–t lines cross at 4.0 s. What is happening then?
- **The "oh, interesting" moment:** at the crossing car B is not level with car A: it is **20.0 m behind, the farthest behind it will ever be**. They are level at 8.0 s, when the areas are equal (80.0 m), and on the graph that is two equal triangles on either side of the crossing. On the s–t graph the same instant is where the tangent to B's curve is parallel to A's line.

All numbers from `src/physics/kinematics.ts` (a `Trip` = phases of constant acceleration: `tripVelocity`, `tripPosition`, `tripDisplacement`…), re-checked by a test.

| Quantity | Value |
|---|---|
| v–t lines cross (10.0 = 2.5t) | 4.0 s |
| At 4.0 s: car A / car B / gap | 40.0 m / 20.0 m / **20.0 m** |
| Level (10.0t = ½ × 2.5t²) | **8.0 s**, both at 80.0 m; car B then does 20.0 m s⁻¹ |
| Ball on a ramp: v from +6.0 to −4.0 m s⁻¹ in 5.0 s | +9.0 m and −4.0 m → displacement **+5.0 m**, distance 13.0 m |

## Story (16 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | car A passes car B at a steady 10.0 m s⁻¹; car B sets off at 2.5 m s⁻² | road: both cars at the 0 m line |
| 2 | hook | predict | "The lines cross at 4.0 s. What is happening?" catches / still behind / already ahead / not sure | v–t, both lines, crossing ringed |
| 3 | not-a-picture | text | a graph is not a picture; height on v–t = how fast, nothing else | — |
| 4 | same-v | choice | what do the cars share at the crossing → **the same velocity** | v–t |
| 5 | gradient | text + fig | gradient of v–t = acceleration (rise ÷ run triangle on B) | v–t with triangle |
| 6 | flat | choice | car A's line is flat → **acceleration is zero** (not "it is at rest") | v–t |
| 7 | area-a | text + fig | steady v: s = vt = height × width = the area under the line (40.0 m) | v–t, rectangle shaded |
| 8 | area-b | choice | area under any v–t = displacement; car B by 4.0 s → **20.0 m** (40.0: forgot ½ · 10.0: read the height) | v–t, triangle shaded |
| 9 | hook-again | choice (revisit) | where is car B at 4.0 s → **20.0 m behind** (level · 40.0 m behind · 20.0 m ahead) | v–t, both areas |
| 10 | road | text + fig | the road, played to 4.0 s: the gap grows while A is faster, 20.0 m at the end | road, plays |
| 11 | scrub | explore | slider = time; both areas grow with readouts. "When is car B level?" → 8.0 s | v–t with cursor |
| 12 | equal-areas | text + fig | level = equal areas: the triangle lost before 4.0 s is won back by 8.0 s | v–t, two triangles of 20.0 m |
| 13 | st | text + fig | s–t: height is position, so here crossing does mean side by side | s–t, both lines |
| 14 | tangent | choice | tangent to B's curve at 4.0 s is parallel to A's line → **same velocity then** | s–t with tangent |
| 15 | rules | text + card | a curve: draw the tangent; card with the four rules (incl. a–t area = change in v) | — |
| 16 | ramp | choice | v–t dips below the axis (ball on a ramp) → displacement **+5.0 m** (13.0: distance · +9.0 · −4.0) | v–t with + and − areas |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| tram | v–t of a tram between two stops (0→8.0 in 4.0 s, steady 6.0 s, to rest in 2.0 s): how far apart are the stops? | **72.0 m** (48.0: steady part only · 96.0: top speed × total time) |
| fastest | s–t graph in four lettered parts: tap the part where the object moves fastest | **the steepest part**, not the highest |
| lift | v–t of a goods lift: +2.0 m s⁻¹ for 4.0 s, then −2.0 m s⁻¹ for 6.0 s: where does it end? | **4.0 m below the start** (20.0 m above: areas added · 4.0 m above · 8.0 m above) |
| sprinter | curved v–t: how to find the distance in the first 4.0 s? | **estimate the area under the curve** (not suvat, not final v × t, not a tangent) |

**You can now:** read velocity and acceleration from gradients · find displacement from the area under a v–t graph, with its sign · say what crossing lines mean on a v–t graph and on an s–t graph.

**Recap:** the whole chase on the road, played to 8.0 s: "The lines cross at 4.0 s, but the cars are level at 8.0 s, when the areas are equal: 80.0 m each."

**Notebook card:** `s = area under v–t` — "Gradient of s–t is v, gradient of v–t is a. Crossing v–t lines mean equal speeds, not side by side."

## To build

1. Physics: `Trip` (phases of constant acceleration) with velocity, position, acceleration, displacement and distance between two times.
2. Figure "graph" (`src/figures/GraphFigure.tsx`): s–t, v–t or a–t of one or two trips drawn from the model; shaded areas with their values (negative ones hatched), the region between two lines, a gradient triangle, a tangent, a ring at a point, a time cursor for the explore screen with live areas, lettered parts as tap targets.
3. Figure "chase" (`src/figures/ChaseFigure.tsx`): the road of lesson 3 with two cars that each have their own acceleration; plays to a given time and shows the gap.
4. Content + test, `ready: true` on the map.
