# Lesson spec — "Density and upthrust"

20 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `density-upthrust` · level 5 "Fluids", first lesson · WPH11 points **23** (density, ρ = m ÷ V) and **24** (upthrust = the weight of fluid displaced) · ~11 min
- **Idea:** density is mass per unit volume, ρ = m ÷ V, in kg m⁻³ (water 1000 kg m⁻³). A fluid pushes harder on the lower faces of a body than on the upper ones, and the difference is the upthrust. Archimedes: upthrust = the weight of the fluid displaced, U = ρ(fluid) × V(under the surface) × g. A body under water displaces its own volume; a floating body sinks until the fluid it displaces weighs as much as it does.
- **Not in this lesson:** pressure p = ρgh (not in Unit 1), viscosity and Stokes' law (next lesson), stability of floating bodies, hydrometers.
- **Misconceptions** (bank, `docs/LESSON_FRAMEWORK.md`, 12e):
  - **D-UPSIDE**: ρ = m ÷ V turned the wrong way round (V = m × ρ or ρ ÷ m);
  - **D-UNITS**: g cm⁻³ mixed with kg and m³ (a factor of 1000 out);
  - **U-BODY**: the body's own weight or density used for the upthrust, not the fluid's (7.65 N; the balloon with helium's density);
  - **U-MASS**: the mass of the fluid displaced given as the upthrust (0.100 N);
  - **U-DEPTH**: a body fully under the surface gets more upthrust the deeper it goes;
  - **F-VOLUME**: a floating body (or its load) displaces its own volume, not its own weight of fluid (the block in the boat: 100 cm³);
  - **F-SAME**: "the same things are in the tank, so the level stays the same";
  - **F-FULL**: upthrust = weight means a floating body is fully under the surface;
  - **W-READING**: the reading in water used as the body's weight.
- **The puzzle:** Sam's toy boat floats in a glass tank, carrying a 0.78 kg steel block. Sam lifts the block out and drops it over the side; it sinks to the bottom. Does the water level in the tank rise, fall or stay the same?
- **The "oh, interesting" moment:** **it falls, by 1.36 cm.** In the boat the block made the boat displace its own weight of water: 0.78 kg, so 780 cm³. On the bottom it displaces only its own volume: 100 cm³. Steel is 7.8 times as dense as water, so floating it pushes aside 7.8 times as much water. Second moment: a block with the density of water would leave the level where it was.

All numbers come from `src/physics/fluids.ts`, ρ(water) = 1000 kg m⁻³, g = 9.81 m s⁻², and are re-checked by a test.

| Quantity | Value |
|---|---|
| The steel block, 0.78 kg, 7800 kg m⁻³: its volume | **1.00 × 10⁻⁴ m³** = 100 cm³ (6080 m³: m × ρ · 1.00 × 10⁴ m³: ρ ÷ m · 0.100 m³: 7.8 g cm⁻³ with kg) |
| Under water on a newtonmeter: upthrust | **0.981 N**, the weight of 100 cm³ of water (7.65 N: the block's weight · 0.100 N: the mass of the water · 6.67 N: the reading) |
| Explore: slider = how deep the block's bottom is, 0 to 7.0 cm (the block is 4.0 cm tall) | the reading falls from 7.65 N to 6.67 N while the block goes under, then stays; the overflow grows to 100 cm³ and stops |
| The block in the boat: extra water the boat displaces | **7.80 × 10⁻⁴ m³** = 780 cm³ (1.00 × 10⁻⁴ m³: the block's own volume · 7.65 × 10⁻³ m³: the weight for the mass · 0.780 m³: 1 kg per m³) |
| The puzzle: the tank's base is 0.050 m²; the level | **falls by 1.36 cm** (rises by 0.20 cm: the block adds its volume · falls by 1.56 cm: forgets the block still displaces 100 cm³ · stays the same) |
| Explore: slider = the block's density, 1000 to 11 000 kg m⁻³, the same 0.78 kg | fall = m(1/ρw − 1/ρ) ÷ A: 0 at 1000, 1.36 cm at 7800, 1.42 cm at 11 000 |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Sam's toy boat in a glass tank, carrying a steel block | the tank: water, the boat floating with the block on board |
| 2 | hook | predict | "Over the side, it sinks: the level?" rises / falls / stays the same / not sure | the same |
| 3 | density | text + card | **density** ρ = m ÷ V, kg m⁻³; water 1000, steel 7800; 1 g cm⁻³ = 1000 kg m⁻³ | — |
| 4 | volume | choice | 0.78 kg of steel → **1.00 × 10⁻⁴ m³** | the block hangs from a newtonmeter, under water in a full displacement can; the overflow in a measuring cylinder, "? cm³" until answered |
| 5 | upthrust | text + card | the deeper face is pushed harder: **upthrust**; Archimedes: U = weight of fluid displaced = ρVg | — |
| 6 | weigh | choice | the upthrust on the block → **0.981 N** | the same, with the reading in air 7.65 N; the reading in water "?" until answered, then 6.67 N |
| 7 | deeper | explore | slider = depth; "Fully under, then deeper: the reading?" → **stays the same** | the block lowered into the can by the slider; the overflow and the reading follow; W, U and T on the block |
| 8 | floating | text | a floating body sinks until the water it displaces weighs as much as it does: U = W | — |
| 9 | pushed | choice | the block in the boat: extra water displaced → **7.80 × 10⁻⁴ m³** | the tank, with the water the boat pushes aside: boat 300 cm³ + block "?" |
| 10 | hook-again | choice (revisit) | the level → **falls by 1.36 cm** | the tank; after Check the block goes over the side and sinks, the boat rises, the level falls by the model |
| 11 | denser | explore | slider = the block's density; "As dense as water?" → **the level stays the same** | the block on the bottom, sized by its volume; the level "in the boat" dashed, the fall written |
| 12 | rules | text | summary; next: viscous drag | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| stone | a stone reads 4.5 N in air and 2.7 N fully under water: its density | **2500 kg m⁻³** (1500: the reading in water as the weight · 1670: 4.5 ÷ 2.7 · 400: upside down) |
| room | a classroom 8.0 m × 6.0 m × 3.0 m, air 1.20 kg m⁻³: the mass of the air | **173 kg** (120 kg m³ ÷ ρ: 120 · 0.00833 kg: ρ ÷ V · 1700 kg: the weight in N) |
| balloon | a party balloon of volume 0.012 m³ in air of 1.20 kg m⁻³: the upthrust | **0.141 N** (0.0144 N: the mass · 0.0212 N: the helium's density, 0.18 kg m⁻³ · 118 N: water's density) |
| ice | an ice block, 0.92 kg, density 920 kg m⁻³, floats in sea water, 1030 kg m⁻³: the volume under the surface | **8.93 × 10⁻⁴ m³** (1.00 × 10⁻³ m³: fully under · 9.20 × 10⁻⁴ m³: fresh water · 8.76 × 10⁻³ m³: the weight for the mass) |

**You can now:** use ρ = m ÷ V with consistent units · explain where upthrust comes from · find the upthrust as the weight of fluid displaced · use the fact that a floating body displaces its own weight of fluid · find a density by weighing in air and in water.

**Recap:** two tanks side by side: the block in the boat (780 cm³ displaced) and on the bottom (100 cm³), the level 1.36 cm lower. "Floating, the block pushes aside its own weight of water: 780 cm³. On the bottom, only its own volume: 100 cm³. The level falls by 1.36 cm."

**Notebook card:** `ρ = m/V,  U = ρVg` — "Upthrust is the weight of fluid pushed aside. A floating body pushes aside its own weight of fluid."

## What is built

1. Physics, `src/physics/fluids.ts`: `RHO_WATER`, `density`, `volumeOf`, `massOf`, `upthrust` (ρVg), `floatingDisplacement` (m ÷ ρ), `submergedVolume` (a block lowered into a fluid), `levelRise` (ΔV ÷ A), `apparentWeight`, `densityByWeighing`, `tankLevelFall`. Test. `sci` (× 10ⁿ) in `src/physics/format.ts`.
2. Figures: `src/figures/TankFigure.tsx` (a glass tank side view: water with fine horizontal dashes, a toy boat whose draft follows the water it displaces, the steel block on board or on the bottom, the level's height by the model; the block's drop over the side played by the model after the revisit's Check; the water displaced written beside; on the explore the block's size follows its density and the old level is dashed; the recap shows two tanks) and `src/figures/DunkFigure.tsx` (a stand with a newtonmeter, the block on a string, a displacement can filled to the spout and a measuring cylinder under the spout; on the explore the slider lowers the block: the reading, the overflow and the upthrust follow the submerged volume; W, U and T on the block).
3. Content `src/content/density-and-upthrust.ts` + test, `ready: true` on the map; `kg m⁻³` and `× 10ⁿ m³` kept together in `src/content/units.ts`; the Fluids misconception bank, `docs/LESSON_FRAMEWORK.md`, 12e.
