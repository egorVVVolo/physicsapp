# Lesson spec — "Elastic strain energy"

22 Nov 2026 · status: **spec and lesson built together** (the owner: "yes, do it"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `strain-energy` · level 6 "Materials", fourth and last lesson of the course · WPH11 point **32** (elastic strain energy ΔEel = ½FΔx, the area under a force–extension graph) · ~10 min
- **Idea:** squashing or stretching takes work, stored as **elastic strain energy**. The force grows from 0, so the work is the **area under the force–extension graph**: on a straight line a triangle, ½FΔx = ½kΔx². Twice the extension means twice the force over twice the distance: **four times** the energy. For the same force the softer spring moves further and stores more. A curved graph (a rubber band): count the squares under the curve.
- **Not in this lesson:** hysteresis, energy lost past the elastic limit (the area between loading and unloading).
- **Misconceptions** (bank, 12f): S-LINEAR, S-NO-HALF, S-CM, S-NO-SQUARE, S-FINAL, S-STIFF-MORE, S-TRIANGLE-ANY, E-HALF and E-ROOT from 12d.
- **The puzzle:** a 12 N push squashes a toy launcher's spring 3.0 cm. Squash it twice as far: how much energy does it store compared with before?
- **The "oh, interesting" moment:** **four times**, 0.72 J against 0.18 J: the push doubles too, so the triangle is twice as wide and twice as tall. And the ball leaves only twice as fast (8.49 against 4.24 m s⁻¹).

All numbers from `src/physics/elastic.ts`, re-checked by `src/content/elastic-strain-energy.test.ts`. Launcher: k = 400 N m⁻¹, ball 20 g.

| Quantity | Value |
|---|---|
| 3.0 cm, push 12 N | **0.18 J** (0.36: no ½ · 18: cm) |
| 6.0 cm, push 24 N (the revisit) | **0.72 J** (0.18 · 0.36: doubled · 1.4: no ½) |
| The ball's speed from 0.72 J | **8.49 m s⁻¹** (6.00: no ½ · 72.0: no root · 0.268: grams) |
| Same 12 N, B twice as stiff | **A stores twice as much**, 0.18 J against 0.090 J |
| Explore: slider = squash 0–6.0 cm | the triangle under the line, E = ½kΔx² |

## Story (11 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | launcher, 12 N, 3.0 cm, a 20 g ball | launcher, readings |
| 2 | hook | predict | twice the squash: same / twice / 4 times / 8 times the energy | launcher at 6.0 cm |
| 3 | work | text + card | elastic strain energy; area under the graph; ½FΔx | — |
| 4 | energy | choice | 0.18 J | launcher, E "?" |
| 5 | graph | explore | slider = squash; the triangle; "twice the squash?" → 4 times the area | launcher + force–squash graph |
| 6 | formula | text + card | ½kΔx² | — |
| 7 | stored | choice (revisit) | 6.0 cm: **0.72 J** | launcher, E "?" |
| 8 | speed | choice | 8.49 m s⁻¹ | after Check the spring is released, the speed drawn |
| 9 | curve | choice | a rubber band: the area under the curve | curved graph on squared paper |
| 10 | softer | choice | same 12 N, B twice as stiff: A stores more | two launchers, two triangles after Check |
| 11 | rules | text | summary | — |

## Skill check

| id | Question | Answer |
|---|---|---|
| stretch | k = 50 N m⁻¹, stretched 6.0 cm | **0.090 J** (1.5: no square · 0.18: no ½ · 900: cm) |
| wire | steel wire, 2.2 mm under 60 N | **0.066 J** (0.13 · 66 · 130) |
| height | 0.18 J lifts the 20 g ball | **0.92 m** (9.0: no g · 0.46 · 0.92 mm: grams) |
| band | stretched 2.0 cm, then on to 4.0 cm: the second 2.0 cm adds | **3 times as much** |

**Recap:** the graph at 6.0 cm with the 3.0 cm triangle inside: four of them. **Notebook card:** `E = ½FΔx`.

## What is built

1. `src/physics/elastic.ts` + test: `elasticEnergy`, `springEnergy`, `energyForForce`, `launchSpeed`, `riseHeight`, `bandForce`, `areaUnder`.
2. `src/figures/LauncherFigure.tsx`: the launcher (spring, plunger, ball, push F, the speed after release), readings / force–squash graph with the shaded triangle / two launchers; `view: 'curve'` the rubber band on squared paper.
3. Content `src/content/elastic-strain-energy.ts` + test, `ready: true` on the map; bank 12f.
