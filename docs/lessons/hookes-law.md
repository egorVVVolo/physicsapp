# Lesson spec — "Hooke's law"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `hooke` · level 6 "Materials", first lesson · WPH11 point **27** (Hooke's law ΔF = kΔx, k the stiffness of the object), compression too · ~10 min
- **Idea:** the **extension** Δx is the change in length, not the length. Up to the limit of proportionality ΔF = kΔx, k the **stiffness** in N m⁻¹, the gradient of a force–extension graph. Every part of a hanging spring carries the whole load, so every coil stretches the same: half the coils, half the extension, twice the stiffness. Stiffness belongs to the object, not just the material (next lesson: stress, strain, Young modulus). The same law for **compression**.
- **Not in this lesson:** the limit of proportionality and elastic limit on a graph (lesson 23, points 29–30), stress and strain (lesson 22), strain energy (lesson 24). Springs in series and parallel only as the cut halves.
- **Misconceptions** (bank, 12f): H-LENGTH, H-CM, H-UPSIDE, H-ONE-LOAD, H-MATERIAL, H-SHARE, H-SOFTER.
- **The puzzle:** a 3.0 N weight stretches a spring from 10.0 cm to 16.0 cm. Lena cuts it in half and hangs the same weight on one half. How far does it stretch?
- **The "oh, interesting" moment:** **only 3.0 cm**, half as far, not the same: the half is twice as stiff, 100 N m⁻¹. The same steel, a different stiffness.

All numbers from `src/physics/springs.ts`, re-checked by `src/content/hookes-law.test.ts`.

| Quantity | Value |
|---|---|
| The spring: k | **50.0 N m⁻¹** (18.8: the length · 0.500: cm · 0.0200: Δx ÷ F) |
| The pull of the top half on the bottom half | **3.0 N** (1.5 · 6.0 · 0) |
| The bottom half's extension (mark 5.0 → 8.0 cm, end 10.0 → 16.0 cm) | **3.0 cm** (6.0: the whole · 8.0: its length · 1.5) |
| The puzzle: one half's stiffness | **100 N m⁻¹** (50.0: same steel · 25.0 · 200) |
| Explore: slider = load 0–6.0 N | the point traces a line, gradient 50.0 N m⁻¹ |

## Story (11 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | the spring with no load and with 3.0 N | stand, ruler, two springs, readings |
| 2 | hook | predict | the half with the same weight: 1.5 / 3.0 / 6.0 / 12.0 cm | the whole spring loaded, the half with its weight on the bench |
| 3 | law | text + card | extension; ΔF = kΔx; stiffness | — |
| 4 | stiffness | choice | k = **50.0 N m⁻¹** | the two springs, k "?" |
| 5 | graph | explore | slider = load; "what does the gradient give?" → k | the spring bobs to each new load by the model; force–extension graph traced |
| 6 | pull | choice | T of the top half on the bottom half = **3.0 N** | paint mark, "T ?" and W; after Check T grows to 3.0 N |
| 7 | half | choice | the bottom half stretched **3.0 cm** | the mark read on the ruler, unloaded and loaded |
| 8 | hook-again | choice (revisit) | one half's stiffness **100 N m⁻¹** | after Check the weight is hung on the half and it bobs and settles at 3.0 cm |
| 9 | lines | tapFig | line C is the whole spring; tap one half → **B** | four lines: 200, 100, 50, 25 N m⁻¹ |
| 10 | object | text | k belongs to the object; compression | — |
| 11 | rules | text | summary; limit of proportionality, later | — |

## Skill check

| id | Question | Answer |
|---|---|---|
| parallel | both halves side by side share 3.0 N: each stretches | **1.5 cm** (0.8 · 3.0: one half carrying it all · 6.0) |
| pair | 15.0 cm at 2.0 N, 22.5 cm at 5.0 N: k | **40.0 N m⁻¹** (66.7: one load · 22.2: the length · 0.400: cm) |
| launcher | k = 400 N m⁻¹, 8.0 cm squashed to 5.0 cm: force | **12.0 N** (20.0 · 32.0 · 1200) |
| coils | same wire and coils, P 30 coils, Q 10 | **Q is 3 times as stiff** |

**Recap:** both springs loaded with 3.0 N: 6.0 cm and 3.0 cm, 50.0 and 100 N m⁻¹. **Notebook card:** `ΔF = kΔx`.

## What is built

1. `src/physics/springs.ts` + test: `hookeForce`, `extensionFor`, `stiffness`, `stiffnessFromPair`, `springLength`, `cutStiffness`, `seriesStiffness`, `parallelStiffness`, `bobOmega`, `bounceAt` (exact damped bob), `bobStep` (the figure's stepper).
2. `src/figures/SpringFigure.tsx`: clamp stand, cm ruler, one or two springs (whole / half), weights hung or on the bench; a hung weight bobs and settles by `bobStep` (the only thing that bounces, by formula); readings / halves / traced graph panel; `view: 'lines'` — force–extension lines with tappable letters.
3. Content `src/content/hookes-law.ts` + test, `ready: true` on the map; bank 12f.

## v3 changes (24 Nov)

Task D11. The puzzle (the half stretches 3.0 cm) and its recap are unchanged. 12 screens + 4 Skill check; chapters *The puzzle* → *Hooke's law* → *Back to the spring*; cast: Lena, Aisha. Lena in the Skill check of *Where the energy goes* became Petra. The predict now ends with "I'm not sure".

| Was | Now |
|---|---|
| choice `stiffness` | **build** `k = ΔF ÷ Δx`, 50 N m⁻¹ (wrong chips: the length 16.0 cm, the extension in cm) |
| choice `half` (mark on the middle coil) | **estimate** `half`: drag to how far the mark moves (3.0 cm); the unloaded spring is shown, the readings only after Check |
| choice `hook-again` (k of one half) | **build** `k = ΔF ÷ Δx` with Δx = 0.030 m, 100 N m⁻¹ (wrong chip: the whole spring's 0.060 m) |
| tapFig `lines` | **graphPick** `lines`: three force–extension lines from the origin (25, 50, 100 N m⁻¹), the half is the steepest; made with `PlotFigure` |
| — | **spotError** `error`: Aisha uses the length 16.0 cm as Δx (18.8 N m⁻¹) |
| text `rules` | one sentence, with a figure |

`pull` (choice) and `graph` (explore) stay. Skill check: **build** (the launcher, `F = k × Δx`, 12.0 N), **spotError** (the pair of readings: Δx left in cm, 0.40 N m⁻¹), **choice** (springs P and Q with 30 and 10 coils), **exam card** on the two halves side by side: (a) Calculate the extension of each half [2] (1.5 cm), (b) Calculate the stiffness of the pair [1] (200 N m⁻¹). Different from the task: the check keeps a choice (the v3 rules need one build, one of order/spotError/sort/graphPick, one choice, then the exam card), so the graph pick lives in the story. The `view: 'lines'` of `SpringFigure` is no longer used by any lesson.
