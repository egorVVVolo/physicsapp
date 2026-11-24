# Lesson spec — "Viscous drag"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `viscosity` · level 5 "Fluids", second and last lesson · WPH11 points **25** (laminar flow, streamlines, turbulent flow) and **26** (Stokes' law F = 6πηrv, where it applies, viscosity depends on temperature), with the falling-ball method of finding a viscosity · ~11 min
- **Idea:** a fluid's layers drag on one another: its **viscosity** η, in Pa s. A body moving through it feels **viscous drag**, against its motion. In **laminar flow** the fluid moves in smooth layers and the **streamlines** never cross; in **turbulent flow** they break into eddies. For a small sphere moving slowly, in laminar flow, **Stokes' law**: F = 6πηrv. A ball sinking at its terminal velocity has W = U + F. Weight and upthrust grow as r³, the drag only as r, so a ball twice as wide sinks four times as fast. Warm a liquid and its viscosity falls: the ball sinks faster.
- **Not in this lesson:** the Reynolds number (not in Unit 1, used only in the test to check the flow really is laminar), drag ∝ v² (lesson 10), pressure.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12e):
  - **F-SAME-FALL** (from 12b): balls of the same material sink at the same speed;
  - **V-SIZE-LINEAR**: twice as wide, twice as fast (or twice as heavy);
  - **V-DRAG-SIZE**: the drag at a given speed does not depend on the size of the ball (×8 for the big ball);
  - **V-NO-UPTHRUST**: upthrust left out of the balance at terminal velocity (η 1.68 Pa s; the glass bead 0.324 cm s⁻¹);
  - **F-TERMINAL-NO-FORCE** (from 12b): at a steady speed no drag is needed;
  - **V-DIAMETER**: the diameter put in for r (η 0.705 Pa s);
  - **V-UNITS**: cm s⁻¹ or mm left unconverted (η 0.0141 Pa s);
  - **V-ANY**: Stokes' law used for any body at any speed, turbulent flow included;
  - **V-FIXED**: viscosity is a fixed property of a liquid, or warming makes it thicker;
  - **V-DRAG-UP**: the drag always acts upwards (the rising bubble).
- **The puzzle:** two steel balls are dropped into a tall tube of glycerol: one 2.0 mm across, one 4.0 mm. The small one sinks at a steady 1.01 cm s⁻¹. How fast does the big one sink?
- **The "oh, interesting" moment:** **four times as fast, 4.04 cm s⁻¹**, not the same (as dropped in air) and not twice. It is 8 times as heavy (volume ∝ r³), the upthrust is 8 times as big too, so at terminal velocity the drag must be 8 times as big. The drag F = 6πηrv has only r, not r³, in it: twice the radius gives twice the drag, so the speed must be 4 times as big. Compare lesson 10: in air (drag ∝ v²) four times the weight gave only twice the speed.

All numbers come from `src/physics/viscosity.ts` (steel 7800 kg m⁻³, glycerol 1260 kg m⁻³, η of glycerol from the measured table, 1.41 Pa s at 20 °C, g = 9.81 m s⁻²) and are re-checked by a test. The flow round both balls is laminar (Reynolds number 0.018 and 0.14); in water the small ball drops at about 62 cm s⁻¹ and the flow is turbulent.

| Quantity | Value |
|---|---|
| The small ball, r = 1.0 mm: W, U | 3.21 × 10⁻⁴ N, 5.18 × 10⁻⁵ N |
| At terminal velocity: the drag | **F = W − U** = 2.69 × 10⁻⁴ N (F = W · F = 0 · F = W + U) |
| The lab: 9.89 s between rubber bands 10.0 cm apart: η | **1.41 Pa s** (0.705: the diameter for r · 1.68: no upthrust · 0.0141: v in cm s⁻¹) |
| The big ball: its weight | **8 times** the small one's (×2 · ×4) |
| The puzzle: the big ball's terminal velocity | **4.04 cm s⁻¹** (1.01: the same · 2.02: twice · 8.09: drag not depending on r) |
| Explore: slider = temperature, 10 to 40 °C | η 3.90 → 0.284 Pa s; the small ball 0.366 → 5.02 cm s⁻¹; at 30 °C 2.33 cm s⁻¹ |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | two steel balls, 2.0 mm and 4.0 mm, over a tall tube of glycerol | the tube (rubber bands, cm ruler), the two balls at the surface |
| 2 | hook | predict | "The small one sinks at a steady 1.01 cm s⁻¹. The big one?" same / twice / four times / eight times | the same |
| 3 | viscosity | text + card | **viscosity** η, Pa s: water 0.0010, honey about 10; **viscous drag** against the motion, bigger the faster | — |
| 4 | balance | choice | the small ball at a steady speed: **F = W − U** | the small ball magnified: W down, U up, F as "F ?" stacked on U; after Check F grows to fill the gap |
| 5 | flow | text + card | **laminar flow**: smooth layers, **streamlines** never cross; **turbulent flow**: eddies | — |
| 6 | flowTap | tapFig | the same ball in glycerol (1.01 cm s⁻¹) and in water (62 cm s⁻¹), seen from the ball: tap the laminar flow → **glycerol** | two panels: Stokes streamlines by the model, moving; in water eddies behind the ball |
| 7 | stokes | text + card | **Stokes' law** F = 6πηrv; only a small sphere, moving slowly, in laminar flow | — |
| 8 | lab | choice | 9.89 s between the bands 10.0 cm apart → **η = 1.41 Pa s** | the tube with the small ball between the bands, a stopwatch "9.89 s"; the forces written |
| 9 | heavier | choice | the big ball's weight → **8 times** | the two balls magnified side by side, W of the big one "?" |
| 10 | hook-again | choice (revisit) | the big ball → **4.04 cm s⁻¹** | the tube; after Check both balls fall by the model in real time, the big one four times as fast |
| 11 | warm | explore | slider = temperature; "From 20 °C to 30 °C?" → **sinks faster** | the small ball drifting down at v(T); a thermometer, η and v written |
| 12 | rules | text | summary; next level: Materials | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| glass | a glass bead the size of the small ball, 2500 kg m⁻³, in the same glycerol: its terminal velocity | **0.192 cm s⁻¹** (0.324: no upthrust · 1.01: the same · 5.33: upside down) |
| bubble | a small air bubble rises at a steady speed through glycerol: the forces | **U = W + F** (W = U + F: drag always up · U = W: no drag · F = W + U) |
| turbulent | a 2.0 cm steel ball timed falling through water, η from Stokes' law: why it is wrong | **the flow round it is turbulent** (upthrust left out · water too thin to have a viscosity · it never reaches a steady speed) |
| castor | a 3.0 mm steel ball falls steadily at 3.4 cm s⁻¹ through castor oil, 960 kg m⁻³: η | **0.987 Pa s** (1.13: no upthrust · 3.95: the diameter for r · 0.00987: v in cm s⁻¹) |

**You can now:** describe laminar and turbulent flow · use Stokes' law and say when it applies · balance weight, upthrust and drag at terminal velocity · find a viscosity with a falling ball · say how temperature changes viscosity.

**Recap:** the tube 5 s after the drop: the small ball 5.06 cm down, the big one 20.2 cm. "Twice as wide: 8 times the weight, but only twice the drag at the same speed. So it sinks 4 times as fast: 4.04 cm s⁻¹."

**Notebook card:** `F = 6πηrv` — "Viscous drag on a small, slow sphere in laminar flow. At terminal velocity W = U + F."

## What is built

1. Physics, `src/physics/viscosity.ts`: `stokesDrag`, `sphereVolume`, `sphereWeight`, `sphereUpthrust`, `stokesTerminal`, `viscosityFromForces`, `viscosityFromFall`, `stokesFall` (from rest at the surface, τ of a few ms), `reynolds`, `turbulentTerminal`, `glycerolViscosity` (the measured table, ln η interpolated), `stokesStream` and `streamlineOffset` (the Stokes stream function, for the streamlines). Test.
2. Figures: `src/figures/TubeFigure.tsx` (a tall tube of glycerol with two rubber bands 10.0 cm apart and a cm ruler; the balls fall by `stokesFall` in real time; a panel on the right: the readings, the magnified ball with W, U and F to one scale, the two balls side by side, or a thermometer with η and v on the explore) and `src/figures/FlowFigure.tsx` (the same ball seen from itself in glycerol and in water: Stokes streamlines from the stream function with dashes streaming along them; in water a wake of eddies; the two panels can be tapped).
3. Content `src/content/viscous-drag.ts` + test, `ready: true` on the map; `Pa s`, `mm`, `°C` kept with their numbers in `src/content/units.ts`; bank entries in `docs/LESSON_FRAMEWORK.md`, 12e.

## v3 changes (24 Nov)

Task D11. The puzzle (the big ball sinks at 4.04 cm s⁻¹, four times as fast) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *Drag and flow* → *Back to the tube*; cast: Mei (the exam card). The predict now ends with "I'm not sure".

| Was | Now |
|---|---|
| choice `balance` (F = W − U) | **order** `terminal`: the weight alone → the drag grows → the resultant shrinks → a steady speed |
| — | **graphPick** `vt-graph`: v against t for the first 6 ms after release, `stokesFall` (A), a straight ramp (B), an instant jump (C) |
| — | **sort** `flow-sort`: laminar or turbulent for six everyday flows |
| choice `lab` (η) | **build** `η = F ÷ (6π × r × v)`, 1.41 Pa s (wrong chips: the diameter, the weight 0.000321 N, v in cm s⁻¹) |
| text `rules` | one sentence, with a figure |

`flowTap` (tap), `heavier` and `hook-again` (choices) and `warm` (explore) stay. Chips are short plain decimals (`0.000269 N`, `0.0101 m s⁻¹`): a chip is at most 14 characters, so `1.01 × 10⁻² m s⁻¹` does not fit. Skill check: **build** (castor oil, `η = 2r²(ρ₁ − ρ₂)g ÷ 9v`, 0.987 Pa s), **sort** (does Stokes' law apply: a bead in treacle, a cricket ball in air, …), **choice** (the rising bubble: U = W + F), **exam card** on the falling-ball method: (a) Explain why the marks are set well below the surface [2] (order), (b) Calculate η [2] (1.41 Pa s). The glass bead and the turbulent-water question are gone.
