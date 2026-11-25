# Lesson spec — "Stress, strain, Young modulus"

21 Nov 2026 · status: **spec and lesson built together** (the owner: "make the lessons, I'll go through them all later"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `young` · level 6 "Materials", second lesson · WPH11 points **28** (stress, strain, Young modulus) and **31** (Core Practical 2: Young modulus of a metal wire) · ~10 min
- **Idea:** Hooke's k belongs to the object. To compare materials, divide out the size: **stress** σ = F ÷ A (Pa) and **strain** ε = Δx ÷ L (no unit). Their ratio, the **Young modulus** E = σ ÷ ε (Pa), belongs to the material: the same for a short thin wire and a long thick one. A wire stretches by Δx = FL ÷ (AE): longer means more, thicker means less, and the area goes as d². In the lab: a long thin wire, d read with a micrometer, L clamp to marker, E = gradient × L ÷ A from a force–extension graph.
- **Not in this lesson:** the limit of proportionality, elastic and plastic, the breaking stress (lesson 23, points 29–30), strain energy (lesson 24). Uncertainty in E only as the Skill check's diameter question.
- **Misconceptions** (bank, 12f): Y-RADIUS, Y-PI, Y-MM, Y-STRAIN-DX, Y-INVERT, Y-WIDTH, Y-MATERIAL-K, Y-LONG-THIN, Y-NO-LENGTH, Y-D-SQUARED, Y-UNIT.
- **The puzzle:** two wires of the same steel hang side by side under the same 60 N. Wire B is twice as long as wire A and twice as wide. How far does B stretch compared with A?
- **The "oh, interesting" moment:** **half as far**. Twice as long would double it; twice as wide quarters it (area goes as d²). 2 × ¼ = ½. Most people say "the same": two doublings cancel.

All numbers from `src/physics/young.ts`, re-checked by `src/content/stress-strain-young.test.ts`. Steel: E = 2.1 × 10¹¹ Pa.

| Quantity | Value |
|---|---|
| Wire A: L = 1.5 m, d = 0.50 mm; wire B: L = 3.0 m, d = 1.00 mm; load 60 N | A = 0.196 mm², 0.785 mm² |
| Stress in A | **3.06 × 10⁸ Pa** (7.64 × 10⁷ d for r · 306 Pa mm² as m² · 9.60 × 10⁸ no π) |
| Extension of A (from σ, ε, E) | **2.18 mm**, strain **1.46 × 10⁻³** (2.18 × 10⁻³: no ÷ L · 1.46: mm over m · 687: upside down) |
| E from A's σ and ε | **2.10 × 10¹¹ Pa** (4.76 × 10⁻¹² · 4.45 × 10⁵ product · 2.10 × 10⁵ MPa not converted) |
| The puzzle: B's extension | **1.09 mm** (0.55 · 2.18 · 4.37) |
| Explore: slider = load 0–70 N | the point traces a line, gradient 2.10 × 10¹¹ Pa |
| Lab: L = 1.60 m, d = 0.40 mm, gradient 1.6 × 10⁴ N m⁻¹ | E = **2.04 × 10¹¹ Pa** (5.09 × 10¹⁰: d as r · 1.27 × 10¹¹: no L · 2.04 × 10⁵: mm² as m²) |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | two steel wires, 60 N each | beam, wires A and B, readings L, d |
| 2 | hook | predict | B twice as long, twice as wide: its stretch compared with A | the wires, cross-sections; the stretch drawn after the pick |
| 3 | law | text + card | stress and strain | — |
| 4 | stress | choice | stress in A = **3.06 × 10⁸ Pa** | wire A, its cross-section to scale |
| 5 | strain | choice | A stretches 2.18 mm: strain **1.46 × 10⁻³** | wire A with Δx and L |
| 6 | graph | explore | slider = load; the stress–strain line; "what does the gradient give?" → E | stress–strain graph, point traced |
| 7 | material | text + card | E = σ ÷ ε, a property of the material; k of the object | — |
| 8 | young | choice | E of the steel from A's σ and ε = **2.10 × 10¹¹ Pa** | readings σ, ε, E "?" |
| 9 | hook-again | choice (revisit) | B's extension **1.09 mm** | both wires; after Check B's stretch drawn |
| 10 | long-thin | choice | why a long thin wire in the lab | the rig: stand, wire, marker on a mm scale, micrometer, weights |
| 11 | gradient | choice | E from the gradient of a force–extension graph = **2.04 × 10¹¹ Pa** | F–Δx plot, gradient triangle |
| 12 | rules | text | summary | — |

## Skill check

| id | Question | Answer |
|---|---|---|
| extension | steel wire 1.5 m, 0.80 mm², 400 N: extension | **3.57 mm** (2.38: no L · 1.59: ÷ L · 3.57 μm: mm² as m²) |
| halved | the wire cut in half, the same load on one half: what stays the same? | **stress, strain and E** (not the extension, not k) |
| modulus | rod: stress 1.4 × 10⁸ Pa at strain 2.0 × 10⁻³: E | **7.00 × 10¹⁰ Pa** (1.43 × 10⁻¹¹ · 2.80 × 10⁵ · wrong unit N m⁻¹) |
| diameter | diameter read 2 % too big: E comes out | **about 4 % too small** |

**Recap:** both wires, 60 N: 2.18 mm and 1.09 mm, the same steel, E = 2.10 × 10¹¹ Pa. **Notebook card:** `E = σ ÷ ε`.

## What is built

1. `src/physics/young.ts` + test: `circleArea`, `stress`, `strain`, `youngModulus`, `wireExtension`, `wireStiffness`, `youngFromGradient`.
2. `src/figures/WireFigure.tsx`: beam and hanging wires (the stretch magnified ×300, said on the sheet), cross-sections to scale / readings / stress–strain graph on the right; `view: 'rig'` the lab; `view: 'plot'` the force–extension plot with a gradient triangle.
3. Content `src/content/stress-strain-young.ts` + test, `ready: true` on the map; bank 12f.

## v3 changes (25 Nov)

Task D12. The puzzle (B stretches half as far as A, 1.09 mm against 2.18 mm) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *Stress, strain, E* → *Back to the wires*; cast: Hana. The predict now ends with "I'm not sure".

| Was | Now |
|---|---|
| choice `stress` | **build** `σ = F ÷ (π × d² ÷ 4)`, 306 MPa (wrong chips: the radius 0.00025 m, the diameter in mm) |
| choice `young` | **build** `E = σ ÷ ε`, 210 GPa (wrong chips: the extension 2.18 mm, the length 1.5 m) |
| choice `hook-again` | **build** `Δx = F × L ÷ (A × E)` for B, 1.09 mm (wrong chips: A's length and area) |
| — | **spotError** `error`: Hana puts the diameter into πr² (stress 76.4 MPa, 4 times too small) |
| — | **order** `cp2`: Core Practical 2 — length, diameter, loading, graph |
| choice `gradient` | **build** `E = k × L ÷ (π × d² ÷ 4)`, 204 GPa (wrong chip: the radius) |
| text `rules` | one sentence, with a figure |

`strain` and `long-thin` (choices) and `graph` (explore) stay. Skill check: **build** (a 400 N load on a 1.5 m, 0.80 mm² steel wire, 3.57 mm), **order** (why the wire must stay below its elastic limit), **choice** (the wire cut in half), **exam card** on Hana's steel wire (80 N on 2.0 m, 0.50 mm across, 3.9 mm): (a) Calculate the stress [2] (407 MPa), (b) Calculate the Young modulus [2] (209 GPa). The 2 %-too-big diameter, the modulus from σ and ε, and the extension choices are gone. Chips are plain decimals (`0.00050 m`) or `3.06 × 10⁸ Pa`: at most 14 characters.
