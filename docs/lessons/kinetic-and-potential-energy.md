# Lesson spec — "Kinetic and potential energy"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `ke-gpe` · level 4 "Energy", second lesson · WPH11 points **18** (Ek = ½mv²) and **19** (ΔEgrav = mgΔh) · ~11 min
- **Idea:** a moving body has **kinetic energy**, the work needed to bring it from rest to its speed: Ek = ½mv². Speed counts twice, so the same gain in speed costs more energy the faster the body already goes. Lifting a body stores **gravitational potential energy**, the work done against its weight: ΔEp = mgΔh, where only the change in height counts.
- **Not in this lesson:** energy changing from one form to another and losses (next lesson, "Where the energy goes"), power, elastic strain energy.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12d):
  - **E-LINEAR**: kinetic energy grows in step with speed: every 10 m s⁻¹ costs the same;
  - **E-FINAL**: the energy needed for a stage is the kinetic energy at its end, not the change;
  - **E-HALF**: the ½ forgotten in ½mv², or put into mgΔh;
  - **E-MOMENTUM**: mv used for the kinetic energy; equal energies give speeds in the inverse ratio of the masses;
  - **E-ROOT**: the square root forgotten when finding a speed from Ek;
  - **E-MASS-HEIGHT**: a heavier body at the same speed needs a different height to hold the same energy (the mass does not cancel);
  - **W-WEIGHT** (from lesson 15): the distance along a path used for the height;
  - **W-UNIT** (from lesson 15): mass × height, without g.
- **The puzzle:** an electric car of 1200 kg pulls away from traffic lights, up to 10 m s⁻¹ and then on to 20 m s⁻¹. Ignoring friction and air, which stage needs more work from the motor?
- **The "oh, interesting" moment:** **the second, three times as much: 60.0 kJ, then 180 kJ** for the same 10 m s⁻¹. The energy is a square of side v: doubling the side makes four squares, and the new L-shaped band holds three of them. Second moment: at 20 m s⁻¹ the car holds as much energy as if a crane had lifted it **20.4 m**, and a van twice as heavy needs the same 20.4 m: the mass cancels.

All numbers come from `src/physics/energy.ts`, g = 9.81 m s⁻², and are re-checked by a test.

| Quantity | Value |
|---|---|
| The car at 10 m s⁻¹ | **60.0 kJ** (6.00 kJ: ½mv · 12.0 kJ: mv · 120 kJ: no ½) |
| Explore: the car's speed from 0 to 20 m s⁻¹ | Ek = 600 v² J: 60.0 kJ at 10, 240 kJ at 20; 1 square (2 m s⁻¹ × 2 m s⁻¹) = 2.40 kJ |
| The puzzle | **60.0 kJ, then 180 kJ** (60.0 and 60.0: in step with speed · 60.0 and 240: the energy at the end · 120 and 360: no ½) |
| The car driven up a car park, 9.0 m higher along 120 m of ramps | **106 kJ** (1410 kJ: along the ramps · 10.8 kJ: no g · 53.0 kJ: a ½) |
| Explore: a crane lifts the car from 0 to 25 m | ΔEp = mgh against Ek at 20 m s⁻¹ = 240 kJ: equal at 20.4 m |
| A 2400 kg van at 20 m s⁻¹: the matching height | **20.4 m**, the same (10.2 m: twice the mass, half the height · 40.8 m: twice the energy · 2.04 m: v ÷ g) |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | the car pulls away, up to 10 then 20 m s⁻¹ | the car on a road, speeding up by the model; the road slides past |
| 2 | hook | predict | "Which stage needs more work?" 0 → 10 / the same / 10 → 20 / not sure | the same |
| 3 | kinetic | text + card | **kinetic energy**: the work to reach the speed from rest; Ek = ½mv² | — |
| 4 | ke10 | choice | the car at 10 m s⁻¹ → **60.0 kJ** | the car at 10 m s⁻¹, "Ek = ?" until answered |
| 5 | why-square | text | where ½mv² comes from: FΔs with F = ma and v² = 2aΔs; twice the speed, four times the work | — |
| 6 | square | explore | slider = the car's speed. "What happens to Ek when the speed doubles from 10 to 20?" → **four times** | the car above a square of side v, cut into 2 m s⁻¹ cells, Ek by it |
| 7 | hook-again | choice (revisit) | how much work in each stage? → **60.0 kJ, then 180 kJ** | the car at 20 m s⁻¹; after Check the square: the 10 m s⁻¹ square and the L-shaped band around it |
| 8 | gpe | text + card | **gravitational potential energy**: ΔEp = mgΔh; only the change in height counts (the washing machine: 471 J) | — |
| 9 | car-park | choice | 9.0 m up along 120 m of ramps → **106 kJ** | — |
| 10 | crane | explore | slider = height. "How high for as much GPE as Ek at 20 m s⁻¹?" → **about 20 m** | a crane holding the car over the road, a height ruler, bars Ep (grows) and Ek at 20 m s⁻¹ |
| 11 | van | choice | a 2400 kg van at 20 m s⁻¹ → **20.4 m, the same** | — |
| 12 | rules | text | summary; next: energy that changes form | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| cricket | a 0.16 kg cricket ball bowled at 35 m s⁻¹: its kinetic energy | **98.0 J** (5.60 J: mv · 196 J: no ½ · 2.80 J: ½mv) |
| hiker | a 62 kg walker follows a 2.4 km path that climbs 450 m: gain in GPE | **274 kJ** (1460 kJ: along the path · 27.9 kJ: no g · 137 kJ: a ½) |
| serve | a 0.058 kg tennis ball leaves the racket with 70 J: its speed | **49.1 m s⁻¹** (34.7: the 2 forgotten · 2410: no root · 1210: E ÷ m) |
| trolleys | A, 0.60 kg at 2.4 m s⁻¹; B, 1.5 kg with the same Ek: B's speed | **1.52 m s⁻¹** (0.960: the same momentum · 3.79: the ratio upside down · 6.00) |

**You can now:** calculate kinetic energy with Ek = ½mv² · find a speed from a kinetic energy · calculate a change in gravitational potential energy with ΔEp = mgΔh · explain why the same gain in speed costs more energy at a higher speed.

**Recap:** the square: 60.0 kJ inside, the 180 kJ band around it. "The same 10 m s⁻¹ costs 60.0 kJ from rest and 180 kJ from 10 m s⁻¹: Ek grows with v²."

**Notebook card:** `Ek = ½mv²  ΔEp = mgΔh` — "Kinetic energy grows with the square of the speed; GPE changes by weight × change in height."

## What is built

1. Physics, `src/physics/energy.ts`: `kineticEnergy`, `speedFromKinetic`, `potentialChange`, `heightForSpeed`. Test.
2. Figures, `src/figures/EnergyFigure.tsx`: `KineticFigure` (the car on a road that slides past at its speed; played, it speeds up from rest by the model; with the square, the road moves up and the square of side v is drawn under it, one cell per 2 m s⁻¹, with Ek; with two stages, the first square and the band around it carry their own energies) and `HeightFigure` (a tower crane holds the car over the road, a height ruler, the car's height; two bars to one scale: ΔEp, growing with the height, and Ek at a given speed).
3. Content `src/content/kinetic-and-potential-energy.ts` + test, `ready: true` on the map; new ids in the Energy misconception bank, `docs/LESSON_FRAMEWORK.md`, 12d. `kJ` added to the units that never part from their number (`src/content/units.ts`).
