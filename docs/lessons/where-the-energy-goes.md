# Lesson spec — "Where the energy goes"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `conservation` · level 4 "Energy", third lesson · WPH11 point **20** (conservation of energy, with work done, GPE and kinetic energy) · ~11 min
- **Idea:** energy is never made or destroyed, only moved from one store to another. With no friction or air, the GPE a body loses is the kinetic energy it gains: ½mv² = ½mu² + mgΔh. Energy has no direction, so how a body is thrown does not change how fast it lands. With friction, the "missing" energy is the work done against it, FΔs, and it heats the body and its surroundings; now the path does matter.
- **Not in this lesson:** power and efficiency (next lesson), elastic strain energy, energy stores by name beyond kinetic, gravitational and thermal.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12d):
  - **C-DIRECTION**: the direction of a throw changes the landing speed (down is fastest, up "uses up" energy);
  - **C-ADD-SPEED**: speeds added instead of energies (12 + 19.8 = 31.8 m s⁻¹);
  - **C-START**: the starting kinetic energy left out;
  - **C-TOTAL**: the total energy changes during the flight (biggest at the top, or falls as the body slows);
  - **C-LOST**: the energy transferred by friction taken as Ek or Ep, or their sum, not their difference;
  - **C-HEIGHT-DIST**: the work against friction divided by the height, not by the distance moved along the slide;
  - **C-PATH**: with friction the path still does not matter (a longer slide of the same height gives the same speed);
  - **E-HALF**, **E-ROOT**, **E-MASS-HEIGHT** (from lesson 16).
- **The puzzle:** from the top of a 20 m sea cliff three identical stones are thrown at 12 m s⁻¹: A at 45° upwards, B level, C at 45° downwards. Ignoring air, which one hits the sea fastest?
- **The "oh, interesting" moment:** **all three hit the sea at 23.2 m s⁻¹.** Each starts with the same ½mu² and the same GPE and ends at the same level; energy has no direction. A and C even hit with the same velocity, arrow for arrow. Second moment: on a playground slide friction takes 413 J of the child's 613 J, and a longer, gentler slide of the same height is **slower**: without friction the path does not matter, with friction it does.

All numbers come from `src/physics/energy.ts` and `src/physics/projectile.ts`, g = 9.81 m s⁻², and are re-checked by a test.

| Quantity | Value |
|---|---|
| A stone dropped from rest from the 20 m cliff | **19.8 m s⁻¹** (14.0: the ½ lost, √(gh) · 392: no root · 196: gh) |
| Explore: stone A (0.40 kg), slider = time 0 to 3.05 s | Ep + Ek stays **107 J** (78.5 J + 28.8 J at the start); Ek is smallest at the top, not zero |
| The puzzle | **all three at 23.2 m s⁻¹** (31.8 for all: speeds added · 19.8 for all: the throw left out · C fastest, A slowest: the direction counts) |
| A 25 kg child down a slide 2.5 m high, 5.0 m long, reaches 4.0 m s⁻¹: energy transferred by friction | **413 J** (200 J: that is Ek · 613 J: all the GPE · 813 J: added); without friction 7.00 m s⁻¹ |
| The average friction force along the slide | **82.6 N** (123 N: all the GPE ÷ 5.0 m · 40.0 N: Ek ÷ 5.0 m · 165 N: ÷ the height) |
| Explore: the same height and friction, slider = the slide's length 3.0 to 7.0 m | v = 5.41 m s⁻¹ at 3.0 m, 4.00 at 5.0 m, 1.67 at 7.0 m: a longer slide is slower |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | three stones from the cliff | the cliff; A, B and C fly by the model and splash |
| 2 | hook | predict | "Which stone hits the sea fastest?" A / C / all the same / not sure | the same |
| 3 | conserve | text + card | **principle of conservation of energy**; with no air, GPE lost = Ek gained | — |
| 4 | drop | choice | a stone dropped from rest → **19.8 m s⁻¹** | one stone dropped; "v = ?" at the sea until answered |
| 5 | flight | explore | slider = time; "What happens to Ek + Ep as A flies?" → **stays 107 J** | stone A at time t on its path; a column of Ep under Ek, the total's line |
| 6 | start-speed | text | a thrown stone starts with ½mu² as well: ½mv² = ½mu² + mgΔh; m cancels: v² = u² + 2gΔh, the suvat equation | — |
| 7 | hook-again | choice (revisit) | how fast does each stone hit the sea? → **all 23.2 m s⁻¹** | the three paths; after Check the three landing velocities, equal arrows |
| 8 | losses | text + card | friction and air do work, **heating** the body and its surroundings; Ep lost = Ek gained + work done against friction | — |
| 9 | slide | choice | 25 kg child, 2.5 m high, reaches 4.0 m s⁻¹ → **413 J** | the slide, the child slides down by the model; columns: Ep at the top, Ek at the bottom; after Check the heating part fills the gap |
| 10 | friction | choice | over 5.0 m of slide → **82.6 N** | the child at the bottom; friction "F = ?" up the slide until answered |
| 11 | longer | explore | slider = the slide's length; "A longer, gentler slide of the same height?" → **slower** | the slide changes length; the heating part grows, Ek shrinks |
| 12 | rules | text | summary; next: power and efficiency | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| coaster | a coaster car from rest at the top of a 32 m drop, then up to the top of a 14 m hill, no friction: its speed there | **18.8 m s⁻¹** (25.1: the 32 m drop · 16.6: the 14 m hill · 13.3: the ½ lost) |
| skater | a skateboarder rolls at 6.0 m s⁻¹ at the foot of a ramp: how high can she rise, no friction | **1.83 m** (3.67 m: the ½ lost · 0.612 m: v ÷ g · it depends on her mass) |
| cyclist | 80 kg with the bike, freewheels down a 12 m drop from 4.0 to 13 m s⁻¹: work done against resistive forces | **3.30 kJ** (2.66 kJ: the start speed left out · 6.12 kJ: that is ΔEk · 9.42 kJ: all the GPE) |
| ball | a 0.20 kg ball thrown up at 15 m s⁻¹ rises only 10.0 m: the average air resistance | **0.288 N** (2.25 N: all of Ek ÷ 10 m · 1.96 N: that is the weight · 4.21 N: energies added) |

**You can now:** state the principle of conservation of energy · use GPE lost = Ek gained to find a speed or a height · find the energy transferred by friction or air resistance · find an average resistive force from the energy it takes.

**Recap:** the three stones at the sea, three equal arrows. "Thrown up, level or down at 12 m s⁻¹, each stone hits the sea at 23.2 m s⁻¹: energy has no direction."

**Notebook card:** `mgΔh = ΔEk + FΔs` — "Energy is never lost: the GPE a body gives up becomes kinetic energy, or heats things through friction."

## What is built

1. Physics, `src/physics/energy.ts`: `speedAfterDrop` (v = √(u² + 2gΔh)), `energyToFriction` (mgΔh − ΔEk), `slideSpeed` (from rest down a slide with a steady friction force). Test.
2. Figures: `src/figures/CliffFigure.tsx` (the cliff over the sea, stones thrown by the model at given angles; played, they fly together and splash; the launch arrows all the same length; with `landing`, each stone's velocity at the sea as an outline arrow and a table of speeds; with `follow`, the explore: one stone at the slider's time, its Ep and Ek stacked in a column with the total's line) and `src/figures/SlideFigure.tsx` (a playground slide with a ladder, a seated child that slides down by the model, a = g h ÷ L − F ÷ m; two columns to one scale: Ep at the top, and Ek with the heating part at the bottom; friction up the slide; the slider sets the slide's length at the same height).
3. Content `src/content/where-the-energy-goes.ts` + test, `ready: true` on the map; new ids in the Energy misconception bank, `docs/LESSON_FRAMEWORK.md`, 12d.

## v3 changes (24 Nov)

Task D9. The puzzle (every stone 23.2 m s⁻¹) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *Energy in a fall* → *Back to the cliff*; cast: Ella, Chen, Marco, Petra.

| Was | Now |
|---|---|
| — | **estimate** `sea-speed`: stone B is thrown level; drag to its speed at the sea (23.2 m s⁻¹, scale 0–40, tolerance 2) |
| choice `hook-again` (all three at 23.2) | **build** `v = √(u² + 2 × g × h)` (wrong chips: 45°, the mass) |
| — | **spotError** `forgot`: Chen leaves out the starting Ek and gets 19.8 m s⁻¹, a dropped stone's speed |
| — | **sort** `stores`: kinetic / potential / thermal — six items about Ella on the slide |
| choice `slide` (413 J) | **build** `E = m × (g × h − ½ × v²)` (wrong chips: the slide's 5.0 m length, the 7.00 m s⁻¹ with no friction); the 82.6 N friction moves into its explanation |
| choice `friction` (82.6 N) | gone; the explore `longer` still shows the force |
| text `rules` | one sentence, with a figure |

`drop` (choice), `flight` and `longer` (explores) stay. Skill check: **build** (the coaster, 18.8 m s⁻¹, from the 18 m the car is below its start), **spotError** (Marco's ramp: the ½ dropped when the mass cancels), **choice** (steep and gentle frictionless ramps, same speed), **exam card** on Petra's freewheel: (a) Calculate the energy transferred to the surroundings [2] (3.30 kJ), (b) Calculate the average resistive force [2] (11.0 N). The ball with air resistance is gone.
