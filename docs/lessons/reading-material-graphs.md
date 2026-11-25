# Lesson spec — "Reading material graphs"

21 Nov 2026 · status: **spec and lesson built together** (the owner: "yes, do it"); not yet seen by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `material-graphs` · level 6 "Materials", third lesson · WPH11 points **29–30** (stress–strain graphs: limit of proportionality, elastic limit, yield point, ultimate tensile stress, breaking; elastic and plastic behaviour; ductile and brittle) · ~10 min
- **Idea:** a stress–strain graph tells how a material behaves. Up to the **limit of proportionality** the line is straight (Hooke); the **elastic limit** is the last point it still springs back from; past it the behaviour is **plastic**: some strain is permanent. At the **yield point** the material gives; the greatest stress is the **ultimate tensile stress** (UTS); then it **breaks**. Unloading from beyond the elastic limit follows a line **parallel to the loading line**, so only the elastic part of the strain springs back. **Ductile** materials have a long plastic region, **brittle** ones break soon after the straight part. A wire's breaking force is the stress times its area.
- **Not in this lesson:** strain energy and the area under a force–extension graph (lesson 24), rubber hysteresis and polymers (only mentioned nowhere: kept out), necking in detail.
- **Misconceptions** (bank, 12f): G-RETURN, G-RETRACE, G-WHOLE, G-LP-EL, G-UTS-BREAK, G-BRITTLE-WEAK, G-FORCE-STRESS, G-MM-SLIP.
- **The puzzle:** a copper wire is stretched to a stress of 240 MPa and a strain of 5.0 × 10⁻³, then the load is taken off. How much of the strain is left?
- **The "oh, interesting" moment:** **3.0 × 10⁻³**, most of it. The wire does not retrace its curve: it comes back along a line parallel to the straight part, so only the elastic 2.0 × 10⁻³ (σ ÷ E) springs back. A 1.50 m wire stays 4.50 mm longer.

All numbers from `src/physics/materials.ts`, re-checked by `src/content/reading-material-graphs.test.ts`. Copper wire in the puzzle: E = 1.2 × 10¹¹ Pa, straight to 180 MPa at strain 1.5 × 10⁻³, then curving on to 240 MPa at 5.0 × 10⁻³ (a zoomed graph, real scale).

| Quantity | Value |
|---|---|
| Elastic part that springs back | σ ÷ E = **2.0 × 10⁻³** |
| Permanent strain | 5.0 × 10⁻³ − 2.0 × 10⁻³ = **3.0 × 10⁻³** (0 · 2.0 × 10⁻³ · 5.0 × 10⁻³) |
| 1.50 m wire: permanent extension | **4.50 mm** (0 · 3.00 mm: the springy part · 7.50 mm: all of it) |
| Explore: slider = the strain reached before release, 0–5.0 × 10⁻³ | up to 1.5 × 10⁻³ it springs back fully; beyond, the unloading line is parallel to the loading line |
| UTS 340 MPa, wire d = 0.80 mm | largest load **171 N** (684 N: d for r · 218 N: no π · 1.71 × 10⁸ N: mm² as m²) |

## Story (12 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | copper wire stretched to 240 MPa, strain 5.0 × 10⁻³, then released | zoomed stress–strain graph, loading curve |
| 2 | hook | predict | how much of the strain is left: none / 2.0 / 3.0 / 5.0 × 10⁻³ | the graph; the unloading line after the pick |
| 3 | elastic | text + card | elastic, plastic, limit of proportionality, elastic limit | — |
| 4 | points | text + fig | the full curve with its five labelled points | the sketch, a legend |
| 5 | elastic-limit | tapFig | tap the elastic limit → **E** | the sketch, letters only |
| 6 | uts | tapFig | tap the ultimate tensile stress → **U** | the sketch, letters only |
| 7 | release | explore | slider = strain reached before release; "the unloading line is…" → parallel | the zoomed graph, unloading line and permanent strain |
| 8 | left | choice (revisit) | the 1.50 m wire stays **4.50 mm** longer | the graph; after Check the unloading line |
| 9 | ductile | text + card | ductile and brittle | — |
| 10 | brittle | tapFig | which curve is the brittle material → **B** | three sketched curves A, B, C |
| 11 | load | choice | largest load on a 0.80 mm wire of UTS 340 MPa = **171 N** | — |
| 12 | rules | text | summary | — |

## Skill check

| id | Question | Answer |
|---|---|---|
| beyond | stretched past the elastic limit, load removed | **it stays longer than at the start** |
| permanent | 2.0 m wire, 300 MPa at strain 4.0 × 10⁻³, E = 1.2 × 10¹¹ Pa: permanent extension | **3.0 mm** (0 · 5.0 mm: the springy part · 8.0 mm: all of it) |
| ductile | the best description of a ductile material | **a large plastic region before it breaks** |
| thick | same material: P breaks at 170 N; Q has twice the diameter | **680 N** (340 N · 170 N · 1360 N) |

**Recap:** the same graph with the unloading line: 3.0 × 10⁻³ stays. **Notebook card:** unloading parallel to loading.

## What is built

1. `src/physics/materials.ts` + test: the copper curve (`loadingStress`), `elasticRecovery`, `permanentStrain`, `unloadingStress`, `breakingForce`.
2. `src/figures/MaterialFigure.tsx`: `view: 'loop'` (zoomed real-scale graph, loading curve, unloading line, brackets for the part that springs back and the permanent part), `view: 'sketch'` (the full ductile curve, letters P E Y U B as tap targets, a legend when they are not), `view: 'compare'` (three sketched curves A, B, C).
3. Content `src/content/reading-material-graphs.ts` + test, `ready: true` on the map; bank 12f.

## v3 changes (25 Nov)

Task D12. The puzzle (3.0 × 10⁻³ of strain stays) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *Elastic and plastic* → *Back to the wire*; cast: Felix. The predict now ends with "I'm not sure".

| Was | Now |
|---|---|
| — | **sort** `elastic-sort`: elastic or plastic for six everyday things |
| — | **estimate** `left-strain`: drag to the strain left in the wire (3.0 × 10⁻³, scale 0–8, tolerance 0.5); the wire is released after Check |
| choice `left` (how much longer) | **build** `Δx = ε × L`, 4.50 mm (wrong chips: the springy 2.0 × 10⁻³, the whole 5.0 × 10⁻³) |
| tapFig `brittle` | **graphPick** `brittle`: three sketched stress–strain curves with no numbers on the axes (ductile, brittle, soft); made with `PlotFigure` (`sketch: true`) |
| text `rules` | one sentence, with a figure |

`elastic-limit` and `uts` (tap the sketch), `release` (explore) and `load` (choice, 171 N) stay. Skill check: **build** (another copper wire, 0.60 mm across, `F = σ × π × d² ÷ 4`, 96.1 N), **graphPick** (the unloading of a wire stretched to 3.5 × 10⁻³: parallel line, retraced curve, straight down), **choice** (what ductile means), **exam card** on Felix's wire (2.0 m, 300 MPa, 4.0 × 10⁻³): (a) Calculate the strain that springs back [2] (2.5 × 10⁻³), (b) Calculate how much longer the wire is [2] (3.0 mm). Different from the task: it keeps the build and the choice the v3 rules ask for, so the sort lives in the story. The beyond-the-limit choice and the thick-wire choice are gone.
