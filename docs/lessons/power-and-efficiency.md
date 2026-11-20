# Lesson spec — "Power and efficiency"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `power` · level 4 "Energy", fourth and last lesson · WPH11 points **21** (power as the rate of doing work, P = ΔW ÷ Δt, P = E ÷ t) and **22** (efficiency = useful energy output ÷ total energy input, and the same with powers) · ~11 min
- **Idea:** power is how fast work is done: P = ΔW ÷ Δt, in watts (1 W = 1 J s⁻¹). For a force moving its point of application at speed v, the work done each second is F × v, so P = Fv. A cyclist at a steady speed pushes as hard as the air pushes back, and air resistance grows as v²: twice the speed costs eight times the power. Efficiency is the useful share of what goes in, useful output ÷ total input, for energies or powers; it is never more than 100 %, and the rest mostly heats the machine.
- **Not in this lesson:** the kilowatt-hour, electrical power (P = IV, Unit 2), the efficiency of human muscles, rolling resistance.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12d):
  - **P-NOT-RATE**: the work or energy given as the power, not divided by the time (the winch 9.42 kW, the stairs 2.74 kW), or multiplied by it;
  - **P-STEADY**: at a steady speed there is no resultant force, so no work and no power is needed (0 J each second; "the same 54.0 W at 12 m s⁻¹"; the car's resistance 0 N);
  - **P-ONE-FACTOR**: when the speed doubles only one factor of P = Dv is changed: the speed (108 W) or the force (216 W);
  - **P-F-V**: force and speed divided or multiplied the wrong way (1.50 J each second; the car 750 kN; the e-bike 1.92 kN);
  - **EFF-UPSIDE**: efficiency upside down, input ÷ useful output, giving more than 100 % (153 %);
  - **EFF-WASTED**: the wasted share given as the efficiency (34.6 %);
  - **EFF-DIRECTION**: multiplying by the efficiency where the input is wanted, or dividing where the output is (the motor 589 J; the e-bike 37.5 N or 46.9 N);
  - **W-UNIT** (from lesson 15): the mass for the weight (80.0 W, 6.67 %, 87.2 W).
- **The puzzle:** Kira cycles along a flat road at a steady 6.0 m s⁻¹; the air pushes back on her with 9.0 N. Air resistance grows as v². To cycle twice as fast, at 12 m s⁻¹, how much power must she give?
- **The "oh, interesting" moment:** **eight times as much: 54.0 W → 432 W.** Twice the speed is four times the air resistance (9.0 N → 36.0 N), and each second she pushes it twice as far. Power grows as v³: that is why the last few km h⁻¹ are the hardest, on a bike or in a car. Second moment: a winch that gives the same useful power lifts twice the load at half the speed: P = Fv again, with F = mg.

All numbers come from `src/physics/power.ts` (with `drag.ts` and `energy.ts`), g = 9.81 m s⁻², and are re-checked by a test.

| Quantity | Value |
|---|---|
| Kira at 6.0 m s⁻¹ against 9.0 N: work done against the air each second | **54.0 J**, so her power is 54.0 W (9.0 J: the force alone · 1.50 J: F ÷ v · 0 J: "steady speed, no work") |
| Explore: slider = her speed 2.0 to 14.0 m s⁻¹, D = 0.25 v² | 1.0 N at 2.0, 9.0 N at 6.0, 36.0 N at 12, 49.0 N at 14: doubling the speed makes D four times as big |
| The puzzle: her power at 12 m s⁻¹ | **432 W**, eight times 54.0 W (108 W: only the speed doubled · 216 W: 36.0 N × the old 6.0 m s⁻¹ · 54.0 W: the same, "steady speed") |
| A winch lifts 120 kg of bricks 8.0 m in 12 s at a steady speed: useful power | **785 W** (9.42 kW: that is the energy, mgΔh · 80.0 W: the mass for the weight · 113 kW: multiplied by the time) |
| The motor takes 1.20 kW from the mains: efficiency | **65.4 %** (153 %: upside down · 34.6 %: the wasted share · 6.67 %: the mass for the weight); 415 W heats the motor |
| Explore: the same 785 W of useful power, slider = the load 40 to 240 kg | v = P ÷ mg: 2.00 m s⁻¹ at 40 kg, 0.667 at 120 kg, 0.333 at 240 kg: twice the load, half the speed |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Kira at a steady 6.0 m s⁻¹, the air pushes back with 9.0 N | the ride: the road and the air stream past, wheels and pedals turn; D back from her, the road's push F forward at the back wheel |
| 2 | hook | predict | "To cycle at 12 m s⁻¹, how much power?" twice / four times / eight times / not sure | the same |
| 3 | power | text + card | **power** = the rate of doing work, P = ΔW ÷ Δt; the watt, 1 W = 1 J s⁻¹ | — |
| 4 | per-second | choice | work done against the air each second → **54.0 J** | the roadside posts stand 6.0 m apart: she passes one each second; after Check "P = 54.0 W" |
| 5 | fv | text | ΔW = FΔs, so each second P = F × Δs ÷ Δt = **Fv**; at a steady speed her push equals the air resistance | — |
| 6 | faster | explore | slider = speed; "Twice the speed: what happens to D?" → **four times** | the ride at the slider's speed, D and F grow as v² |
| 7 | hook-again | choice (revisit) | her power at 12 m s⁻¹ → **432 W** | the ride at 12 m s⁻¹, D = 36.0 N; after Check "P = 432 W" |
| 8 | efficiency | text + card | **efficiency** = useful output ÷ total input (energy or power); never above 100 %; the rest mostly heats the machine | — |
| 9 | winch | choice | 120 kg up 8.0 m in 12 s → useful power **785 W** | a winch on a scaffold lifts a pallet of bricks by the model; the power flow from the mains, "useful ?" until answered |
| 10 | efficient | choice | the motor takes 1.20 kW → **65.4 %** | the power flow split: useful 785 W, heating 415 W; "efficiency ?" until answered |
| 11 | heavier | explore | slider = the load, the same useful power; "Twice the load?" → **half the speed** | the pallet rises at v = P ÷ mg; the cable's pull T up, v beside it |
| 12 | rules | text | summary; the Energy level is done; next: fluids | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| stairs | a 62 kg student runs up stairs, rising 4.5 m in 3.2 s: average useful power | **855 W** (87.2 W: the mass for the weight · 2.74 kW: the energy, not per second · 8.76 kW: multiplied by the time) |
| car | a car at a steady 25 m s⁻¹, engine's useful power 30 kW: the total resistive force | **1.20 kN** (750 kN: P × v · 48.0 N: ÷ v² · 0 N: "steady speed") |
| motor | a motor, 40 % efficient, lifts 30 kg through 5.0 m: electrical energy used | **3.68 kJ** (1.47 kJ: the useful energy · 589 J: multiplied by 40 % · 2.45 kJ: divided by the wasted 60 %) |
| ebike | an e-bike motor, 80 % efficient, takes 300 W; steady 8.0 m s⁻¹ on the level: the resistive force | **30.0 N** (37.5 N: the efficiency left out · 46.9 N: divided by it · 1.92 kN: P × v) |

**You can now:** define power as the rate of doing work, in watts · use P = ΔW ÷ Δt and P = Fv · explain why going faster costs far more power · calculate an efficiency from energies or powers, and use it to find an input or an output.

**Recap:** Kira at 6.0 and at 12 m s⁻¹, one above the other, each with D and P. "Twice the speed: four times the air resistance, pushed twice as far each second. Eight times the power: 54.0 W → 432 W."

**Notebook card:** `P = ΔW/Δt = Fv` — "Power is how fast work is done. Efficiency is the useful share of what goes in, never above 100%."

## What is built

1. Physics, `src/physics/power.ts`: `power` (ΔW ÷ Δt), `powerFromForce` (F × v), `efficiency` (useful ÷ total), `inputFor` and `outputFor` (by the efficiency), `liftPower` (mg × v), `liftSpeed` (P ÷ mg). Test.
2. Figures: `src/figures/RideFigure.tsx` (a cyclist on a level road seen from the side; she stays put while the road, its posts and the air stream past at her speed, the wheels roll and the cranks turn; air resistance D = kv² back from her centre of gravity and the road's push F forward at the back wheel, one scale; with `perSecond` the posts stand v × 1 s apart with a dimension between two; her power "P = ?" or its value; with `compare`, two lanes at two speeds) and `src/figures/WinchFigure.tsx` (a scaffold with an electric winch on top, the cable over a pulley down to a pallet of bricks that rises at a steady speed by the model; a power-flow diagram from the mains: in, useful, heating, with "?" until answered; on the explore the slider sets the load and the speed follows v = P ÷ mg, with the cable's pull T and v).
3. Content `src/content/power-and-efficiency.ts` + test, `ready: true` on the map; `kW` and `kN` in `src/content/units.ts`; new ids in the Energy misconception bank, `docs/LESSON_FRAMEWORK.md`, 12d.
