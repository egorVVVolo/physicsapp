# Lesson spec — "Force and acceleration"

17 Nov 2026 · status: **spec and lesson built together** (the owner: "do the next one", feedback later); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `f-ma` · level 2 "Forces" · WPH11 points **9** (ΣF = ma for constant mass, Newton's first law when a = 0) and **10** (g = F/m, W = mg) · ~12 min
- **Idea:** only the **resultant** force accelerates a body: add every force with its sign first, then a = ΣF / m, where m is **all the mass that force has to move**. Mass is not weight: weight is a force, W = mg, and g (N kg⁻¹) changes from planet to planet while the mass stays the same. No resultant force means no change in velocity (first law).
- **Misconceptions** (new entries for the Forces bank, 12b):
  - **F-APPLIED-NOT-RESULTANT**: puts the applied force into F = ma (a = 150 / 40 = 3.75 m s⁻²);
  - **F-PUSH-LINEAR**: twice the push, twice the acceleration, even with friction;
  - **F-MASS-WEIGHT**: divides by the weight instead of the mass, or thinks the mass shrinks on the Moon;
  - **F-STRING-WEIGHT**: the string pulls with the whole hanging weight while it accelerates;
  - **F-PART-MASS**: the force accelerates only part of a joined system (divides by the trolley's mass);
  - **F-WEIGHT-FORGOT**: leaves the weight out of a vertical ΣF (rocket at lift-off);
  - plus F-MOTION-FORCE (the trolley slows once the string goes slack).
- **The puzzle:** Rose drags her 40 kg crate again, with the rope flat this time: 150 N, and friction on the floor is 100 N. The crate speeds up. She pulls twice as hard, 300 N. What happens to the acceleration?
- **The "oh, interesting" moment:** **it is four times bigger, not twice: 1.25 → 5.00 m s⁻².** Friction takes the same 100 N each time, so the resultant goes from 50 N to 200 N. And a second one: in the lab, a falling 0.20 kg mass pulls a trolley, but the string pulls with **1.57 N, less than the mass's weight of 1.96 N**; if it pulled with the whole weight, the mass would not speed up.

All numbers come from `src/physics/` (new small functions in `dynamics.ts`) and are re-checked by a test. g = 9.81 N kg⁻¹.

| Quantity | Value |
|---|---|
| Crate 40 kg: weight | **392 N** |
| Pull 150 N, friction 100 N: resultant / acceleration | **50 N** / **1.25 m s⁻²** |
| Pull 300 N: resultant / acceleration (the puzzle) | **200 N** / **5.00 m s⁻²** |
| Mistakes: pull only / pull + friction / ÷ weight | 3.75 / 6.25 / 0.127 m s⁻² |
| Explore: pull 0 → 300 N | a from −2.50 (slows, then stops) through 0 (steady, at 100 N) to 5.00 m s⁻² |
| Moon, g = 1.62 N kg⁻¹: the same crate on smooth ice, resultant 50 N | **1.25 m s⁻²** (mass smaller: 7.57 · ÷ Moon weight: 0.772) |
| Lab: trolley 0.80 kg on a smooth bench, hanging mass 0.20 kg | a = **1.96 m s⁻²**, T = **1.57 N** |
| Mistakes: trolley only / falls freely / ÷ total weight | 2.45 / 9.81 / 0.200 m s⁻² |
| Mistakes for T: the hanging weight / ma of the hanging mass / mg + ma | 1.96 / 0.392 / 2.35 N |
| The mass falls 0.50 m, then the string goes slack: the trolley's speed from then on | **1.40 m s⁻¹**, steady |
| Explore: hanging mass 0.10 → 2.00 kg | a from 1.09 to 7.01 m s⁻², never 9.81 |

## Story (15 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Rose's crate again, rope flat: 150 N, friction 100 N; the crate speeds up | crate, floor sliding past faster and faster, a speed tag counting up |
| 2 | hook | predict | "She pulls twice as hard, 300 N. What happens to the acceleration?" twice / more than twice / less than twice / it stays the same, only the speed is bigger / not sure | crate |
| 3 | law | text + card | Newton's second law: ΣF = ma. ΣF is the **resultant force**: every force on the body added with its sign. Card: resultant force | — |
| 4 | fbd | text + fig | "Forward 150 N, back 100 N: the resultant is 50 N forward." | crate's free-body diagram with sizes, ΣF in the list |
| 5 | first-a | choice | acceleration at 150 N → **1.25** (3.75: the pull alone · 6.25: friction added · 0.127: divided by the weight) | crate, a = ? until Check |
| 6 | pull | explore | slider = the pull, 0–300 N; the header reads ΣF and a; the floor speeds up or slows by the model. "What does the crate do when Rose pulls with exactly 100 N?" → **keeps a steady speed** | crate, live |
| 7 | hook-again | choice (revisit) | 300 N → **5.00 m s⁻²** (2.50: doubled · 7.50: the pull alone · 1.25: "the same, only faster") | crate at 300 N, a = ? until Check |
| 8 | mass | text + card | **Mass** (kg) is how hard a body is to accelerate; **weight** is a force, W = mg. Card: gravitational field strength g = F / m, the force of gravity on each kilogram: 9.81 N kg⁻¹ on Earth, 1.62 on the Moon | — |
| 9 | moon | choice | the crate on smooth ice on the Moon, resultant 50 N → **1.25** (7.57: "mass is smaller on the Moon" · 0.772: divided by the Moon weight) | — |
| 10 | lab | text + fig | "In the lab, a falling 0.20 kg mass pulls a 0.80 kg trolley along a smooth bench." | trolley, bench, pulley, hanging mass; plays by the model |
| 11 | lab-a | choice | acceleration → **1.96** = 1.96 N ÷ 1.00 kg (2.45: the trolley only · 9.81: falls freely · 0.200: divided by the weight) | lab, a = ? until Check |
| 12 | tension | choice | the pull of the string → **1.57 N** = 0.80 × 1.96 (1.96 N: the hanging weight · 0.392 N: the hanging mass's own ma · 2.35 N: mg + ma) | lab, forces on both bodies, T = ? until Check |
| 13 | heavier | explore | slider = the hanging mass, 0.10–2.00 kg; the header reads a and T. "As the hanging mass grows, what happens to a?" → **it grows, but stays below 9.81 m s⁻²** | lab, live |
| 14 | slack | choice | the mass lands after 0.50 m and the string goes slack. What does the trolley do? → **keeps a steady 1.40 m s⁻¹** (slows down and stops · keeps speeding up · stops at once). After Check the clip plays on | lab, the mass on the floor |
| 15 | rules | text + card | Find the resultant first, then divide by all the mass it moves. Weight is a force (mg); the mass is the same everywhere. Card: Newton's first law | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| tow | a 1100 kg car tows a 500 kg trailer; driving force 2400 N, resistance negligible. Tension in the tow bar? | **750 N** (2400 N: the whole driving force · 1091 N: shared by trailer ÷ car · 1650 N: the car's ma) |
| rocket | a 0.50 kg model rocket, thrust 8.0 N at lift-off. Acceleration? | **6.19 m s⁻²** (16.0: weight forgotten · 25.8: weight added · 0.631: divided by the weight) |
| mars | on Mars a 2.00 kg sample hangs still from a spring balance reading 7.42 N; the probe's arm then lifts it with 10.0 N. Acceleration? | **1.29 m s⁻² upward** (5.00: weight forgotten · 8.71: weight added · "it does not rise: its weight is 19.6 N") |
| car | a 1500 kg car goes from rest to 24.0 m s⁻¹ in 15.0 s; resistive forces 600 N. Driving force? | **3000 N** (2400 N: resistance forgotten · 1800 N: resistance subtracted · 36 000 N: m × v) |

All four are new contexts; "mars" uses g = F/m and ΣF = ma together; "car" brings back a = Δv / t from Motion.

**You can now:** find the resultant force and use ΣF = ma · tell mass from weight and use W = mg on any planet · find the acceleration and the tension for bodies joined by a string · use the first law: no resultant force, no change in velocity.

**Recap:** the crate at 300 N with its forces: "Twice the pull, but four times the resultant: 50 N → 200 N, so a goes from 1.25 to 5.00 m s⁻²."

**Notebook card:** `ΣF = ma` — "Only the resultant force accelerates a body, and it has to accelerate all the mass it moves."

## What is built

1. Physics, `src/physics/dynamics.ts`: `acceleration(ΣF, m)`, `fieldStrength(F, m)`, `connectedAcceleration(M, m, g)` = mg / (M + m), `stringTension(M, m, g)` = M · a. Test.
2. Crate figure (`src/figures/CrateFigure.tsx`), new options: `friction` (a fixed sliding friction, so the crate accelerates), `accel` (a chevron on the free-body diagram with a = … or a = ?), `slider: 'force'` (the explore slider is the pull). Played with a fixed friction, the crate starts at 2.0 m s⁻¹ and the floor slides past by s = ut + ½at² for 2 s (a slowing crate stops and waits), again and again, with the speed written above the crate.
3. Lab figure (`src/figures/PulleyFigure.tsx`): bench, pulley, trolley, string, hanging mass, hatched floor. Forces on both bodies (T on the trolley, T and W on the mass), a = ? / a = …, play from rest by the model: the mass falls 0.50 m and lands, the string goes slack, the trolley rolls on at a steady speed. Slider: the hanging mass.
4. Content `src/content/force-and-acceleration.ts` + test, `ready: true` on the map; the new misconceptions in `docs/LESSON_FRAMEWORK.md`, 12b.

## Changed while building

- **The flat-rope crate has its own layout:** a shorter rope and a narrower scene, so a 300 N pull still fits on the free-body diagram at the same scale as lesson 8. "CRATE ALONE" sits bottom right.
- **The accelerating clip starts at 2.0 m s⁻¹,** not 1.0: a crate slowing at 2.50 m s⁻² (no pull) then slides long enough to see. Once it stops it waits 0.6 s and the clip starts again; the tag says "stopped".
- **The lab clip stops where the mass lands** on screens 10 and 13, so it never answers screen 14; only screen 14, once answered, plays on and shows the trolley rolling at a steady 1.40 m s⁻¹ with evenly spaced marks.

## Open for the owner

- **The same crate as in "Drawing the forces".** It ties the two lessons together (the last screen there says "the diagram shows the acceleration"). If it feels repetitive, the first half can move to a different body.
- **Friction stays 100 N whatever the speed.** True for sliding friction at this level; the lesson does not say "μ".
- **Connected bodies** (trolley and hanging mass, car and trailer) are at the top of the exam level for Unit 1. Too hard, or exactly right for a strong class?

## v3 changes (24 Nov)

Task D5. The puzzle (twice the pull, four times the acceleration: 1.25 → 5.00 m s⁻²) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *The resultant force* → *Back to the crate*; cast: Rose (shared with the other Forces lessons, `SHARED_CAST`).

| Was | Now |
|---|---|
| choice "acceleration at 150 N" | **build** `a = (pull − friction) ÷ mass` (wrong chips: the weight, 250 N), 1.25 m s⁻² |
| — | **estimate** `double`: the acceleration at 300 N (5.00 m s⁻², tolerance 0.3; the scale is 0–8 so the slider does not start on the answer) |
| choice "acceleration at 300 N" | choice **by idea**: why doubling the pull more than doubles a (ΣF goes 50 N → 200 N) |
| choices "Moon", "tension", explore "heavier", choice "slack" | removed (the Moon stays in the text; the tension moved to the exam card) |
| — | **graphPick** `lab-graph`: the trolley's v–t graph (rises, then flat after the landing; the wrong ones keep rising and slow down) |
| choice "what does the trolley do next" | **order** `slack`: the string goes slack → nothing pulls → ΣF = 0 → it rolls on at 1.40 m s⁻¹ |

Skill check: **build** (the rocket, `a = (thrust − weight) ÷ mass`, 6.19 m s⁻²), **graphPick** (a book sliding to rest), **choice** (the puck at steady speed: no resultant force), **exam card** on the tow: (a) Calculate the acceleration [2] (1.50 m s⁻²), (b) Explain why the tension is less than the driving force [2] (order, T = 750 N).
