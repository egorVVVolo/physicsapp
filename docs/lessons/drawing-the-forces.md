# Lesson spec — "Drawing the forces"

17 Nov 2026 · status: **draft, waiting for the owner's ok** · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `free-body` · level 2 "Forces" · WPH11 point **8** (draw and interpret free-body force diagrams for a particle or an extended but rigid body); uses point 9 (balanced forces → steady velocity) and lesson 6 (components) along the way · ~12 min
- **Idea:** pick **one** body and draw it alone. Its forces are its weight (from the centre of gravity) plus **one force wherever something touches it**: a surface pushes at right angles (N) and rubs along itself (friction), a rope pulls along itself (tension). Nothing the body does to other things, and no "force of motion". Then read the diagram: balanced in each direction means steady velocity (rest is only one case); unbalanced tells you which way it **accelerates**, not which way it moves.
- **Misconceptions** (new Forces bank, added to the framework when the lesson is built):
  - **F-N-EQUALS-W**: the floor always pushes with the weight (N = 392 N for the pulled crate);
  - **F-MOTION-FORCE**: a moving body needs a forward force ("the force of the pull" still on the crate after Rose lets go; "the force of the throw" on a rising ball);
  - **F-BY-NOT-ON**: a force the body exerts on something else drawn on its diagram (the crate's push on the floor);
  - **F-FRICTION-WHOLE**: friction at steady speed equals the whole pull (120 N), or is zero "because it moves";
  - **F-FBD-MOTION**: reads the direction of motion off the diagram (the resultant points back, so "it moves back");
  - **F-SMOOTH-DIR**: a smooth surface pushes along the body (the wall pushes down the ladder) instead of at right angles to the surface;
  - plus K-SCALAR-VEC (the slanted rope taken whole).
- **The puzzle:** Rose pulls a 40 kg crate across the floor at a steady speed, with a rope at 30° above the floor and a force of 120 N. The floor pushes up on the crate. Is that push bigger than the crate's weight, equal to it, or smaller?
- **The "oh, interesting" moment:** **smaller: 332 N against a weight of 392 N.** The rope pulls up a little (60.0 N), so the floor only has to hold up the rest. And a second one: friction is **104 N**, not 120 N: only the forward part of the pull has to balance it. Push the crate down with a pole instead, and the floor pushes harder than the weight (452 N).

All numbers from `src/physics/` (two small new functions in `dynamics.ts`, the rest from `vectors.ts`), re-checked by a test. g = 9.81 N kg⁻¹.

| Quantity | Value |
|---|---|
| Crate, 40 kg: weight | **392 N** |
| Rope 120 N at 30°: forward / up | **103.9 N** / **60.0 N** |
| Friction at steady speed | **104 N** |
| Normal reaction with the rope pulling up (the puzzle) | **332 N** = 392.4 − 60.0 |
| … with a pole pushing down at 30° instead | **452 N** = 392.4 + 60.0 |
| Explore: N as the rope gets steeper, 0° → 60° | 392 N → 288 N |
| Ladder, 12 kg, at 65° to the floor, smooth wall: weight / push of the wall | **118 N** / **27.4 N** |
| … friction at the foot / normal reaction at the foot | **27.4 N** towards the wall / **118 N** |
| Sign, 6.0 kg, on two cables at 50° to the horizontal: tension in each | **38.4 N** |
| Box, 5.0 kg, at rest on a 25° slope: friction | **20.7 N** up the slope |
| Book, 1.2 kg, pressed on a wall with 30 N, not slipping: friction | **11.8 N** upward |

## Story (16 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Rose pulls a 40 kg crate across the floor with a rope: 120 N at 30°, steady speed | crate: hand, rope, sliding along a hatched floor |
| 2 | hook | predict | "Is the floor's push on the crate bigger than its weight, equal, or smaller?" bigger / equal / smaller / not sure | crate |
| 3 | fbd | text + card | To work out forces, draw the crate alone. Card: **free-body diagram** — one object and every force acting on it, and nothing else. Arrows start where the force acts; longer arrow, bigger force | — |
| 4 | find | text + fig | How to find them: the **weight**, from the centre of gravity, always. Then look for everything touching the crate: the floor (pushes up: **N**; rubs back: **friction**) and the rope (pulls along itself: **tension**). Four forces | crate alone, the four arrows grow one by one, named |
| 5 | not-on | tapFig | "One arrow does not belong on the crate's diagram. Tap it." → **P, the crate's push on the floor** (it acts on the floor) · W, N, F, T each get a hint | crate with five arrows, P drawn on the floor under it |
| 6 | let-go | choice | Rose lets go; the crate slides on and slows down. Which forces act on it now? → **W, N and friction** (W, N, friction and a forward force left over from the pull: nothing touches the front any more · W and N only: then it would not slow down · friction only) | crate sliding, the rope lying slack on the floor |
| 7 | balance | text | Steady speed means no acceleration, so the forces **balance in each direction**: up = down, forward = back. The rope is slanted, so split it first (lesson "Splitting a vector") | crate, T split with a dashed rectangle into forward and up parts |
| 8 | friction | choice | friction on the crate at steady speed → **104 N** = 120 cos 30° (120 N: the whole pull · 60.0 N: sin, the up part · 0 N: "it moves, so nothing holds it back") | crate, F = ? |
| 9 | hook-again | choice (revisit) | what is N? → **332 N**: N + 60.0 = 392 (392 N: N = W · 452 N: the rope pushes down · 288 N: took the forward part, cos) | crate, N = ?, after Check the real N arrow next to W |
| 10 | steeper | explore | slider = rope angle 0°–60°, the pull stays 120 N; the header reads N and the forward part live. "As the rope gets steeper, what happens to N?" → **it gets smaller** | crate, live |
| 11 | push | choice | Rose pushes the crate with a pole instead: 120 N, pointing down at 30°. The crate stays on the floor. N? → **452 N** (332 N: copied from the rope · 392 N: N = W · 496 N: added the forward part). Why: vertical balance needs only "no vertical acceleration", whatever the crate does sideways | crate with a pole, N = ? |
| 12 | body | text | A body that does not turn can be shrunk to a **particle**: every arrow from one dot. A ladder can turn, so it is an **extended body**: each force is drawn where it acts, weight from the centre of gravity | particle crate next to the ladder |
| 13 | wall | tapFig | a ladder leans on a **smooth** wall. "Which way does the wall push on the ladder?" → **at right angles to the wall, away from it** (down along the ladder: a surface pushes at right angles to itself · straight up: smooth means no friction, nothing along the wall) | ladder, three candidate arrows at the top |
| 14 | foot | choice | the ladder does not slip; the wall pushes with 27.4 N. Friction at the foot → **27.4 N towards the wall** (27.4 N away from the wall · 0 N: "the floor only pushes up" · 118 N: the weight) | ladder, all four forces, friction "?" |
| 15 | car | choice | the diagram of a car shown as a particle: 1200 N forward, 3000 N back, W and N equal. Which way is the car moving? → **can't tell: it accelerates backwards** (backwards: the diagram shows acceleration, not motion · forwards · at rest) | particle with four arrows |
| 16 | rules | text + card | How to draw one: one body, drawn alone · weight from the centre of gravity · one force per contact (N at right angles to the surface, friction along it, tension along the rope) · nothing it does to others, no force of motion · label every arrow. Notebook card | — |

Screen 15 is the bridge to the next lesson ("Force and acceleration").

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| thrown | a ball is thrown up and is still rising; air resistance ignored. Which forces act on it? | **its weight only** (weight and an upward force from the throw · weight and an upward force that shrinks · no forces at the top) |
| sign | a 6.0 kg sign hangs still from two cables, each at 50° to the horizontal: tension in each cable | **38.4 N** (29.4 N: half the weight, angle ignored · 45.8 N: cos instead of sin · 58.9 N: the whole weight) |
| slope | a 5.0 kg box rests on a rough slope at 25°: friction on the box | **20.7 N up the slope** (44.5 N: cos, the part into the slope · 49.1 N: the whole weight · 0 N: "at rest, so no friction") |
| book | a hand presses a 1.2 kg book flat against a wall with 30 N; the book does not slip: friction on the book | **11.8 N upward** (30 N: the press · 41.8 N: press + weight · 0 N) |

All four are new contexts; "sign" and "slope" need the components from lesson 6, "book" shows that friction balances what it must, not what you press with.

**You can now:** draw a free-body diagram for a body that is pulled, pushed or leaning · leave out forces the body exerts on others and "forces of motion" · find a missing force from balance in each direction · read which way a body accelerates, not which way it moves.

**Recap:** the crate with all four forces and the rope split: "The rope holds up 60.0 N of the crate's 392 N weight, so the floor only pushes with 332 N."

**Notebook card:** `ΣF = 0 each way` — "Draw one body alone: its weight, plus one force wherever something touches it. Balanced each way means steady velocity, not only rest."

## What to build

1. Physics, `src/physics/dynamics.ts`: `normalWithRope(W, T, θ)` = W − T sin θ (θ above the horizontal, negative for a push downwards); `ladderWallPush(W, α)` = W / (2 tan α) for a uniform ladder on a smooth wall (the wall's value is given in the lesson, moments come later). The cable and slope numbers reuse `components` and `onSlope` from `vectors.ts`. Test.
2. Figure "crate" (`src/figures/CrateFigure.tsx`): side view, hatched floor, a flat-3D wooden crate with its centre of gravity marked; the gloved hand and rope from `SledgeFigure.tsx` (moved into a shared drawing if needed), or a pole for screen 11. Modes: scene (sliding by the model, floor marks moving past); forces (W, N, F, T grow one by one from where they act, named or "?"); the extra arrow P on the floor for the tap screen; T split with a dashed rectangle; the slider tilts the rope and the header reads N and the forward part; let go (slack rope, the crate slows by the model and stops).
3. Figure "ladder" (`src/figures/LadderFigure.tsx`): wall and floor hatched, a ladder at 65°, forces at the foot and the top, weight from the middle; three dashed tap candidates at the top for screen 13.
4. Figure "particle" (`src/figures/ParticleFigure.tsx`, or a mode of the crate figure): a dot with labelled arrows, lengths to scale; used for screens 12 and 15.
5. Content `src/content/drawing-the-forces.ts` + test, `ready: true` on the map; the Forces misconception bank in `docs/LESSON_FRAMEWORK.md`, section 12.

## Open for the owner

- **The context:** a crate pulled with a rope (Rose's hand only, as with the sledges). Another option: a suitcase on wheels pulled by its handle; it has no friction story, so the crate is better.
- **The ladder** shows an extended body, but the wall's 27.4 N is given: finding it needs moments (level 3). Is that fine, or should screens 13–14 be a different extended body?
- **Level:** screens 3–6 are basic for a strong student, but each one carries a named trap (P on the floor, the "force of the pull" after letting go). The hard part is 8–11 and 14.
- The lesson stands before "The push from the floor" on the map, which also introduces the free-body diagram (one screen). It can stay as a short reminder there.
