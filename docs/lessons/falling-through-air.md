# Lesson spec — "Falling through air"

17 Nov 2026 · status: **spec and lesson built together** (the owner: "do the next one"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `terminal-velocity` · level 2 "Forces", the last lesson of the level · WPH11 point **9** ("use of the term terminal velocity is expected") with ΣF = ma from lesson 9 · ~12 min
- **Idea:** air pushes back on a falling body with **drag**, against its motion, and drag grows with speed. So the resultant W − D shrinks, the acceleration falls from g towards 0, and the body settles at the speed where D = W: its **terminal velocity**. A heavier body of the same shape needs more drag, so a higher speed. A parachute makes D bigger than W: the resultant points **up** while she still falls, until D = W again at a lower speed.
- **Misconceptions** (new entries for 12b):
  - **F-SAME-FALL**: everything falls at the same rate, air or not (the four cake cases "fall at 1.20 m s⁻¹ too");
  - **F-DRAG-LINEAR**: drag grows in step with speed (four times the weight → four times the speed);
  - **F-START-SLOW**: the acceleration is smaller than g at the start, or zero "because it starts at rest";
  - **F-TERMINAL-NO-FORCE**: at terminal velocity no forces act, or drag is bigger than the weight;
  - **F-CHUTE-UP** (with F-FBD-MOTION): the parachute "pulls her up", or the resultant is down because she moves down;
  - **F-CHUTE-MORE-DRAG**: at the slow steady speed under the parachute, drag is bigger (or smaller) than the weight.
- **The puzzle:** a paper cake case dropped in still air soon falls at a steady 1.20 m s⁻¹. Stack four cases inside each other: four times the weight, the same shape. How fast do they fall?
- **The "oh, interesting" moment:** **twice as fast, 2.40 m s⁻¹, not four times and not the same.** Four times the weight needs four times the drag, and for a body like this drag grows with the square of the speed. A second one: under the open parachute at 6.0 m s⁻¹ the drag is exactly as big as it was at 50 m s⁻¹ without it: the weight, 687 N.

All numbers come from `src/physics/drag.ts` (new: D = kv², terminal velocity, the exact fall from rest, a skydive with the parachute opening over 4 s, integrated step by step) and are re-checked by a test. g = 9.81 m s⁻².

| Quantity | Value |
|---|---|
| One cake case: terminal velocity | **1.20 m s⁻¹** (given) |
| Four cases stacked: terminal velocity (the puzzle) | **2.40 m s⁻¹** (linear mistake 4.80 · "the same" 1.20 · "heavier is slowed more" 0.60) |
| Skydiver, 70 kg: weight | **687 N** |
| Acceleration the moment she jumps | **9.81 m s⁻²** |
| Free fall: speed at 1, 3, 5, 10 s | 9.69, 26.4, 37.7, 48.1 m s⁻¹ (terminal 50 m s⁻¹) |
| Parachute opens at 15 s over 4 s: biggest drag | **5.0 W** → acceleration **39.2 m s⁻² upward** (49.1: drag alone · 58.9: weight added · 9.81) |
| Under the parachute: terminal velocity / drag | **6.0 m s⁻¹** / **687 N** = W |

## Story (15 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | a paper cake case dropped in still air soon falls at a steady 1.20 m s⁻¹ | one case falling, the air streaming past, W and D |
| 2 | hook | predict | four cases stacked: the same / twice as fast / four times as fast / slower / not sure | one case and the stack, side by side |
| 3 | drag | text + card | air pushes back on a moving body: **drag**, against the motion, bigger at higher speed. Card: drag | — |
| 4 | jump | text + fig | "The moment she jumps, v = 0: no drag yet, only her weight." | skydiver at t = 0 with the v–t graph |
| 5 | start-a | choice | acceleration the moment she jumps → **9.81** (0: "she starts at rest" · less than 9.81: "the air slows her from the start") | skydiver at t = 0 |
| 6 | speeding | explore | slider = time since she jumped, 0–15 s; D grows, the header reads v and a. "As she speeds up, what happens to her acceleration?" → **it gets smaller** | skydiver + graph, live |
| 7 | steady | choice | after 15 s her speed stays 50 m s⁻¹: drag compared with weight → **equal** (bigger · smaller · "no forces act now") | skydiver at 15 s, D = ? until Check |
| 8 | terminal | text + card | D = W, ΣF = 0, a = 0: a steady speed, the first law again. Card: terminal velocity | — |
| 9 | square | text | for a body like this, twice the speed gives four times the drag; a heavier body of the same shape needs more drag, so it falls faster | — |
| 10 | hook-again | choice (revisit) | four cases: **2.40 m s⁻¹** (4.80 · 1.20 · 0.60) | both lanes, the stack's speed "?" until Check |
| 11 | chute | text + fig | "At 15 s she opens her parachute, and its drag grows fast." | the whole skydive on the graph |
| 12 | chute-dir | choice | her speed falls from 50 to 6.0 m s⁻¹ while she still falls: which way is the resultant? → **up** (down: she moves down · zero: · "up, because she moves up") | the graph |
| 13 | chute-steady | choice | steady 6.0 m s⁻¹: the drag now → **equal to her weight, as at 50 m s⁻¹** (bigger: the parachute is open · smaller: she is slower · zero) | skydiver under the parachute |
| 14 | peak | choice | just after it opens, the drag is 5.0 times her weight: acceleration → **39.2 m s⁻² upward** (49.1 · 58.9 · 9.81) | skydiver at the peak, D and W to scale |
| 15 | rules | text + card | drag grows with speed, a falls, D = W at terminal velocity; a parachute: D > W, she slows, a new lower terminal velocity. Card: the shape of the v–t graph | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| shuttle | a 5.0 g shuttlecock falls at 3.0 m s⁻¹ with 0.020 N of drag: acceleration? | **5.81 m s⁻²** (4.00: drag ÷ m · 9.81: drag left out · 13.8: drag added) |
| cyclist | drag on a cyclist goes as v²: 30 N at 8.0 m s⁻¹. At her top speed her pedals push with 120 N. Top speed? | **16.0 m s⁻¹** (32.0: drag in step with speed · 8.0 · 4.0) |
| heavier | two skydivers of the same shape, 60 kg and 90 kg; the lighter one's terminal velocity is 48.0 m s⁻¹. The heavier one's? | **58.8 m s⁻¹** (72.0: in step with mass · 48.0: the same · 39.2: slower) |
| down | a ball is thrown straight down faster than its terminal velocity. What happens to its speed? | **it falls until it reaches terminal velocity** (keeps rising · stays the same · falls to zero) |

**You can now:** explain why a falling body reaches terminal velocity · use ΣF = W − D to find the acceleration on the way · read the v–t graph of a fall, parachute included · say how terminal velocity changes with weight.

**Recap:** the two lanes at terminal velocity: "Four times the weight needs four times the drag, and that takes only twice the speed: 2.40 m s⁻¹."

**Notebook card:** `D = W at terminal v` — "Drag grows with speed until it equals the weight. Then ΣF = 0 and the speed stays steady."

## What is built

1. Physics, `src/physics/drag.ts` + test.
2. Figure "fall" (`src/figures/FallFigure.tsx`): the scene on the left (a cake case or a stack, or a skydiver who turns upright under the canopy), the air streaming up past it at a speed ∝ v, W and D to one scale from the centre of gravity; optionally the v–t graph on the right with a dashed line at each terminal velocity and a dot at the current time. Played: cases in real time, the skydive sped up (the sheet says so). Slider: the time since she jumped.
3. Content `src/content/falling-through-air.ts` + test, `ready: true` on the map.

## Changed while building

- **Arrows are drawn only on a single body** (one case, or the skydiver): with two lanes the stack's 4 W arrows would not fit. The two-lane figures show the speeds and the air streaming past.
- **Two scales for the skydiver:** 40 units per W while no parachute will open, 22 on the parachute screens (5 W must fit). In free fall she is drawn 1.4 times larger.
- Options of the prediction are short words ("The same speed", "Slower than one case"), so they fit two to a row.

## Open for the owner

- **"Drag grows as v²"** is told, not derived: the specification only asks for the term terminal velocity. It is what makes the puzzle work. Fine, or too far beyond the course?
- **The parachute opens over 4 s** (the model grows the canopy evenly), so the biggest drag is 5.0 times the weight. A parachute that opened at once would give an impossible jolt.

## v3 changes (24 Nov)

Task D6. The puzzle (four cake cases, twice the speed: 1.20 → 2.40 m s⁻¹) and its recap are unchanged. 15 screens + 4 Skill check; chapters *The puzzle* → *Why the speed levels off* → *The parachute*; cast: Ines (the skydiver, now named).

| Was | Now |
|---|---|
| choice "drag vs weight at 50 m s⁻¹" | **order** `why-steady`: speed ↑ → drag ↑ → resultant ↓ → a ↓ → D = W, ΣF = 0 |
| text "jump" | removed (`start-a` shows the jump) |
| text "square" (two paragraphs) | one sentence, **D = kv²** with k = 0.275 N s² m⁻² for Ines; "heavier falls faster" moved into `terminal` |
| — | **build** `vt-build`: `v = √(m × g ÷ k)` = 50.0 m s⁻¹ (wrong chips: 687 N, k ten times too big) |
| choice `hook-again` (2.40 m s⁻¹ among four) | **estimate**: the stack's terminal velocity, scale 0–6 (2.40, tolerance 0.2) |
| text "chute" + choice "drag under the canopy" | text kept; **graphPick** `chute-graph`: her whole v–t graph (wrong: a = g then suddenly flat; the speed falls to zero) |
| choice `peak` (a at 5.0 W) | **build** `a = (D − W) ÷ m` = 39.2 m s⁻² upward |

Skill check: **build** (the cyclist, `v = v₀ × √(F ÷ D₀)`, 16.0 m s⁻¹), **graphPick** (Ines tucks in at 15 s: the speed rises again to 60 m s⁻¹; wrong: it stays flat, it falls), **choice** (the ball thrown down faster than terminal velocity), **exam card** on a shuttlecock: (a) Calculate its acceleration [2] (5.81 m s⁻²), (b) Explain why it stops speeding up [3] (order). The old shuttlecock, cyclist and heavier-diver choices became the build, the card and nothing (the diver one is gone).

New: figure kind `fallVt` (`src/figures/FallVtGraph.tsx`): one v–t curve of a skydive on a full sheet, three variants (`model`, `stop`, `straight`, `flat`) drawn from `fallVtCurve` in `src/physics/drag.ts`, same axes in one question. Found while building: the figure with the graph beside the diver gave away the answer of the build (50 m s⁻¹ dashed on the axis), so that screen shows the diver only.
