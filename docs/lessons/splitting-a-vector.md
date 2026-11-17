# Lesson spec — "Splitting a vector"

17 Nov 2026 · status: **built 17 Nov** after the owner's ok (`src/content/splitting-a-vector.ts`, checked in the web at 375×667, light and dark theme); not yet played on a phone or by the owner · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `resolving` · level 1 "Motion" (blue) · WPH11 points **5** (resolve a vector into two components at right angles, by drawing and by calculation) and **6** (resultant of two coplanar vectors; here: by adding components) · ~11 min
- **Idea:** a slanted vector does two jobs at once. Split it into two **components** at right angles: the side next to the angle is F cos θ, the side opposite is F sin θ. The components add tip to tail, never as plain numbers, and each one is smaller than the vector.
- **Misconceptions:** whole force taken as acting forward (100 N instead of 50.0 N), sin and cos swapped (86.6 instead of 50.0; angle measured from the vertical), components shared out like numbers (100 − 50 = 50 N "left over"; "half and half" at 45°), components added as numbers (50.0 + 86.6 = 136.6 N), weight on a slope taken as having no part along the slope, K-SCALAR-VEC.
- **The puzzle:** two identical sledges on flat snow. Ana pulls hers with a rope at 60° above the snow, with a force of 100 N. Ben pushes his straight forward with 60 N. Which sledge gets the larger forward force?
- **The "oh, interesting" moment:** **Ben's**: 60 N against Ana's 50.0 N. The bigger pull loses, because only half of it goes forward; the other 86.6 N lifts the sledge. Then a second surprise: the two parts make 136.6 N "together", more than the 100 N pull, until you add them tip to tail and get 100 N back.

All numbers from `src/physics/` (new functions in `vectors.ts`), re-checked by a test.

| Quantity | Value |
|---|---|
| Ana: 100 N at 60° above the snow | forward **50.0 N**, up **86.6 N** |
| The parts added as numbers / tip to tail | **136.6 N** / **100 N** |
| Rope angle at which Ana pulls forward with 60 N, like Ben | **53.1°** (then up 80.0 N) |
| Rope at 45° | **70.7 N** each way (not 50 N) |
| The same rope measured from the vertical: 30° | forward 100 sin 30° = **50.0 N** |
| Kite string 20 N at 35° to the vertical: horizontal part | **11.5 N** |
| Ball kicked at 18 m s⁻¹, 40° above the ground: vertical part | **11.6 m s⁻¹** |
| Ben's sledge, weight 250 N, on a 20° hill: along / into the slope | **85.5 N** / **234.9 N** |

## Story (16 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Ana pulls with 100 N on a rope at 60°, Ben pushes straight forward with 60 N | sledges: both, forces drawn |
| 2 | hook | predict | "Which sledge gets the larger forward force?" the one Ana pulls / the one Ben pushes / the same / not sure | sledges |
| 3 | parts | text + card | Ana's rope does two jobs: it pulls forward and lifts. Card: **components** — two vectors at right angles that add tip to tail to give the original one. Finding them is **resolving** | — |
| 4 | which-part | tapFig | "Tap the part of Ana's pull that moves the sledge forward" → the horizontal dashed arrow (the vertical one: lifts · the rope: the whole pull, not a part) | sledge A: rope force, a dashed rectangle, both components unlabelled |
| 5 | forward | choice | forward component, the side next to the 60° angle → **50.0 N** = 100 cos 60° (86.6: sin, the side opposite · 100: all of it goes forward · 200: divided by cos) | sledge A, F_x = ? |
| 6 | hook-again | choice (revisit) | who wins? → **Ben, 60 N against 50.0 N** (Ana: 100 N is the whole pull · the same: both "about 60") | both sledges, forward parts side by side |
| 7 | lift | choice | the upward component → **86.6 N** = 100 sin 60° (50.0: "100 − 50, what is left" · 100 · 0: a rope cannot lift) | sledge A, F_y = ? |
| 8 | add-back | text + fig | 50.0 + 86.6 = 136.6 N, more than the pull? Components add **tip to tail**, like the hiker: √(50.0² + 86.6²) = 100 N | the two parts tip to tail, closing on the 100 N rope |
| 9 | angle | explore | slider = rope angle, 0°–90°; the two parts change live in the header. "At what angle does Ana pull forward with 60 N, like Ben?" → **about 53°** | sledge A, live |
| 10 | half | choice | rope at 45°: each component → **70.7 N** (50 N: half and half · 100 N · 141 N: multiplied) | sledge A at 45°, both = ? |
| 11 | from-vertical | text | cos goes with the side **next to** the angle, wherever the angle is. The same rope is 30° from the vertical: forward = 100 sin 30° = 50.0 N | — |
| 12 | kite | choice | kite string, 20 N at 35° to the vertical: horizontal part → **11.5 N** (16.4: cos with the wrong angle · 20 · 14.0: tan) | single vector on squared paper, angle from the vertical |
| 13 | kick | choice | any vector splits the same way: ball kicked at 18 m s⁻¹, 40° up; vertical part → **11.6 m s⁻¹** (13.8: cos · 18.0 · 9.0: half). One line: the next lesson runs on this | single vector, velocity (outline arrow) |
| 14 | slope | text + fig | Ben's sledge on a 20° hill. The weight points straight down; split it along the slope and into it. The angle between W and the line into the slope is the hill's 20° again | sledge on a hill, W and its two parts, both angles marked |
| 15 | along | choice | the part of W along the slope (250 N) → **85.5 N** = 250 sin 20° (234.9: cos, that is the part into the slope · 250 · 0: "weight is straight down") | hill, along = ? |
| 16 | rules | text + card | how to resolve: draw the rectangle; next to the angle → F cos θ, opposite → F sin θ; check: each part smaller than F. By drawing: a scale drawing, measure the sides. Notebook card | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| climb | an aircraft flies at 240 m s⁻¹, climbing at 12° to the horizontal: vertical component of its velocity | **49.9 m s⁻¹** (234.8: cos · 240 · 0: "it moves along its path") |
| angle | a force has components 36 N horizontally and 15 N vertically: angle of the force above the horizontal | **22.6°** (67.4°: from the vertical · 24.6°: sin⁻¹(15/36) · 65.4°: cos⁻¹(15/36)) |
| skier | a skier of mass 70 kg on a 14° slope, g = 9.81 N kg⁻¹: component of the weight along the slope | **166 N** (666 N: cos, into the slope · 687 N: all of W · 16.9 N: mass without g) |
| tow | a barge towed by two ropes, each 300 N at 25° either side of the canal: resultant forward force | **544 N** (600 N: added as numbers · 254 N: sin · 272 N: one rope only) |

The last two are new contexts; "tow" asks for a resultant at an angle by adding components (the sideways parts cancel).

**You can now:** split a vector into two components at right angles · pick cos or sin from where the angle is · split a weight along and into a slope · add vectors at any angle through their components.

**Recap:** the two sledges side by side with their forward parts: "Ana pulled with 100 N, Ben pushed with 60 N, but only 50.0 N of Ana's pull went forward. The rest lifted her sledge."

**Notebook card:** `F cos θ, F sin θ` — "The side next to the angle is F cos θ. Components add tip to tail, never as plain numbers."

## What was built

1. Physics, `src/physics/vectors.ts`: `components(size, θ)` → { along (next to the angle), across (opposite) }, `angleForComponent(size, along)` (the 53.1°), `onSlope(W, θ)` → { along, into }; the angle from components reuses `angleFromFirst`. Test.
2. Figure "sledge" (`src/figures/SledgeFigure.tsx`): flat snow seen from the side; the people are off the drawing, only a gloved hand holds Ana's rope and pushes Ben's sledge (a standing person cannot hold a rope at every angle of the slider). Forces in course blue from a dot where they act; Ana's pull split from the hitch with a dashed rectangle ('box'), tip to tail ('chain') or only the forward part ('forward'); labels by name, "?", "?" until Check, or size; dashed tap boxes on the pull and both parts; on the explore screen the slider tilts the rope and the header reads both parts.
3. Figure "hill" (same file): the slope runs off the sheet so the forces can be large, hatched underneath; its angle marked against a dashed horizontal; a pale sledge, W from the centre of gravity, its parts along and into the slope, the angle at W marked.
4. Figure "resolve" (`src/figures/ResolveFigure.tsx`): one vector on squared paper with its angle from the horizontal or the vertical, both components from the tail, force (solid) or velocity (outline arrow), the asked component "?" until Check.
5. The explore slider shows angles (`unit: '°'`: "θ = 60°", ends 0° and 90°).
6. Content `src/content/splitting-a-vector.ts` + test, `ready: true` on the map.

## Open for the owner

- The context: sledges on snow, with a rope at 60° (steep, but it gives the clean "half"). Another option: dragging a suitcase by its handle.
- Ana and Ben are drawn only as gloved hands, not whole people.
- Level: screens 3–5 are basic for a strong student, but they lead quickly to the traps (sin/cos from the vertical, 45° is not half, the slope).
- Point 5 "by drawing" is only told (rules screen), as in lesson 5: a drag-to-draw screen would be a new kind of screen.
