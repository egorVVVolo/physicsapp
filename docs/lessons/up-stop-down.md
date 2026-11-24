# Lesson spec — "Up, stop, down"

15 Nov 2026 · status: **built 15 Nov** (`src/content/up-stop-down.ts`, checked in the web at 375×667, light and dark); not yet played on a phone · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b) · reference: `src/content/normal-reaction.ts`

- **id:** `up-stop-down` · level 1 "Motion" (blue) · WPH11 points **1** (SUVAT) and **11** (Core Practical 1) · ~12 min
- **Idea:** with up as positive, a = −9.81 m s⁻² for the whole flight — on the way up, at the top where v = 0, and on the way down. One sign convention carries the whole motion.
- **Misconceptions:** K-TOP-ZERO-A (a = 0 at the top), K-SIGN-CONV (signs of s and a), K-SPEED-VEL (+8 vs −8), K-ROOT-PICK (negative root), K-RELEASE-REST (Skill check).
- **Trap problem (exam level, for Egor to approve):** ball thrown up at 8.0 m s⁻¹ from 12.0 m — signed values into s = ut + ½at², then pick the root: t = 2.58 s, not −0.95 s.
- **The "oh, interesting" moment:** a ball thrown **up** and a ball thrown **down** at the same speed hit the ground at the **same** speed — because ball A comes back past your hand at −8.0 m s⁻¹, and because u is squared in v² = u² + 2as.

All numbers: g = 9.81, h = 12.0 m (hand above ground), u = 8.0 m s⁻¹. Computed by `src/physics/`, re-checked by a test.

| Quantity | Value |
|---|---|
| Ball A: time to the top u/g | 0.82 s |
| Ball A: rise above the hand u²/2g | 3.26 m |
| Ball A: back at the hand, 2u/g | 1.63 s, v = −8.0 m s⁻¹ |
| Both balls at the ground √(u² + 2gh) | **17.3 m s⁻¹** |
| Ball A lands / ball B lands | 2.58 s / 0.95 s (difference 1.63 s = 2u/g) |
| Roots of −12.0 = 8.0t − 4.905t² | 2.58 s and −0.95 s |

## Story (16 screens)

| # | id | Kind | Text | Figure | Answer, wrong options (named mistakes) |
|---|---|---|---|---|---|
| 1 | intro | intro | **Up, stop, down.** "From a balcony 12.0 m up, you throw two balls at 8.0 m s⁻¹: ball A straight up, ball B straight down." | balcony, hand, balls A and B with velocity arrows (still) | — |
| 2 | hook | predict | "Which ball hits the ground moving faster?" | same | Ball A · Ball B · Both the same · I'm not sure → "Let's find out" |
| 3 | signs | text + fig | "Take **up as positive**. Ball A starts with u = +8.0 m s⁻¹, ball B with u = −8.0 m s⁻¹." | the "+ up" axis lights up, values on the arrows | — |
| 4 | weight | text | "Once a ball leaves your hand, the only force on it is its **weight**, pulling down (we ignore air resistance)." / "Ball A slows on the way up, stops at the top for an instant, then falls back." | — | — |
| 5 | top | tapFig | "At the top, ball A stops for an instant. Which way does its acceleration point there?" — *Tap the acceleration you expect.* | ball A at the top, "v = 0", three candidates: up chevrons · "a = 0" · down chevrons | **Down** ✓ · a = 0 ("If a were zero at the top, v would stay zero and the ball would hang there.") · Up ("Only the weight acts, and weight points down.") |
| 6 | scrub | explore | "Drag the slider to move ball A through time." Slider t = 0…1.2 s (steps 0.02 s). Then: "When is the acceleration of ball A zero?" | ball A at s(t), v arrow shrinks, passes 0, flips; a chevrons and "a = −9.81 m s⁻²" never change | **Never** ✓ · At the top · On the way down (hints point back to the slider) |
| 7 | free-fall | text + card | "Up, stop and down are **one motion** with one acceleration. v falls by 9.81 m s⁻¹ every second, straight through zero." Card **Free fall**: "Moving under gravity alone: a = g downward the whole time, even at the top where v = 0." | — | — |
| 8 | back | choice | "Ball A falls back past your hand. What is its velocity now?" | ball A at the hand, moving down, velocity "?" | **−8.0 m s⁻¹** ✓ · +8.0 (K-SPEED-VEL: "right speed, but it's moving down now") · between 0 and −8.0 · faster than 8.0 downward |
| 9 | vt | text + fig | "On a v–t graph the flight is **one straight line**, with gradient −9.81 m s⁻²." | v–t from +8.0 to −8.0, crossing zero at the top (0.82 s) | — |
| 10 | alike | text + fig | "Back at your hand, ball A moves exactly like ball B at the start: −8.0 m s⁻¹, down." | A passing the hand beside B's start, both arrows −8.0 | — |
| 11 | v2 | text | "To find a speed without the time, use **v² = u² + 2as**. Keep every sign: down to the ground, s = −12.0 m and a = −9.81 m s⁻²." | — | — |
| 12 | hook-again | choice (revisit) | "Back to the puzzle. How fast do the balls hit the ground?" | both balls at the ground, arrows "?"; after Check both flights play and land with "17.3 m s⁻¹" | **17.3 m s⁻¹** ✓ · 13.1 (√(2gh − u²): "u is squared, so its sign drops out") · 15.3 (from rest, K-RELEASE-REST) · 23.3 (u + √(2gh), speeds added) |
| 13 | values | choice | "Now the time. Which values go into s = ut + ½at² for ball A, down to the ground?" | — | **s = −12.0 m, u = +8.0 m s⁻¹, a = −9.81 m s⁻²** ✓ · s = +12.0 … · a = +9.81 … · u = 0 … (K-SIGN-CONV, K-RELEASE-REST) |
| 14 | roots | choice | "The equation gives t = 2.58 s or t = −0.95 s. When does ball A hit the ground?" | — | **2.58 s** ✓ · 0.95 s (negative root without its sign) · 1.63 s (that's when it passes your hand) · 3.53 s (roots added) (K-ROOT-PICK) |
| 15 | cp1 | text | "In Core Practical 1 you measure g. Drop a ball **from rest** through a height h and time the fall: s = ut + ½at² becomes **h = ½gt²**." / "So a graph of h against t² is a straight line through the origin." | — | — |
| 16 | gradient | choice | "A student's graph of h against t² has a gradient of 4.87 m s⁻². What value of g do they get?" | h–t² graph: points, line, gradient triangle | **9.74 m s⁻²** ✓ · 2.44 (gradient ÷ 2) · 4.87 (gradient taken as g) · 9.81 ("that's the accepted value, not their result") |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer, wrong options |
|---|---|---|
| later | "Ball A lands later than ball B. How much later?" | **1.63 s** ✓ (up and back to the hand, 2u/g; after that A moves exactly like B) · 0.82 s (only the way up) · 2.58 s (A's whole flight) |
| cliff | "A stone is thrown straight up at 6.0 m s⁻¹ from a cliff 20.0 m above the sea. How high above the sea does it rise?" | **21.8 m** ✓ · 1.8 m (above the hand, forgot the cliff) · 23.7 m (u²/g, lost the ½) |
| drone | "A drone rising at a steady 3.0 m s⁻¹ lets go of a parcel. Just after release, what are the parcel's v and a?" | **v = +3.0 m s⁻¹, a = −9.81 m s⁻²** ✓ · v = 0, a = −9.81 (K-RELEASE-REST) · v = +3.0, a = 0 |
| timer | "In Core Practical 1 a student times each fall with a stopwatch. Which change improves their value of g most?" | **Use a light gate and an electronic timer** ✓ · use a heavier ball · drop from smaller heights · plot h against t instead of t² |

**You can now:** explain why a = −9.81 m s⁻² even at the top, where v = 0 · solve up-and-down motion with one sign convention · pick the right root, and find g from an h–t² graph.

**Recap (last screen):** both flights play side by side and land with "17.3 m s⁻¹" — "Up or down at 8.0 m s⁻¹, both balls land at 17.3 m s⁻¹. Ball A just gets there 1.63 s later."

**Notebook card:** `v² = u² + 2as` — "With up positive, a = −9.81 m s⁻² the whole flight: on the way up, at the top where v = 0, and down."

## What has to be built

1. **Figure "throw"** (`src/figures/ThrowFigure.tsx`): balcony edge with a railing, hatched ground, a ruler in metres with the "+ up" arrow, balls A and B (flat 3D), velocity = outline arrow (flips through zero), acceleration = double chevron. States: at the hand / at the top (with three tap candidates) / back at the hand / live time from the slider / the flight played by the model in real time (s = ut + ½at², loops, pause button) — still until Check where it would give the answer away. Draws itself the first time.
2. **v–t graph of the throw** (the lift graph learns negative v and a non-zero start) and an **h–t² graph** for Core Practical 1.
3. **Explore screen** works with the new figure: the slider drives time instead of the lift's acceleration.
4. Content `src/content/up-stop-down.ts` + test that recomputes every number and every named mistake; `ready: true` on the map.
5. Check every screen in the web at 375×667, light and dark, then commit, push, show the owner.

## v3 changes (24 Nov)

Task D3. The puzzle (both balls land at 17.3 m s⁻¹) and its recap are unchanged. 14 screens + 4 Skill check; chapters *The puzzle* → *One motion, one sign* → *Back to the balls*; cast: Zara.

| Was | Now |
|---|---|
| choice "velocity when A falls back past the hand", text "alike", text "v²" | removed (the graph pick and the build carry them) |
| — | **order** `at-top`: v = 0 → the weight still pulls → v keeps changing → the ball turns round |
| — | **estimate** `rise`: how high above the hand (answer 3.26 m, tolerance 0.5 m) |
| — | **build** `height`: `s = (v² − u²) ÷ (2a)` with v = 0, u = +8.0 m s⁻¹, a = −9.81 m s⁻² (wrong chips: +9.81, −8.0, 12.0 m) |
| text "v–t is one straight line" | **graphPick** `vt`: the flight on a v–t graph (the right one is the throw graph; the wrong ones are the speed, a V, and a flat line, on the same −10…10 axis) |
| choice "which values go in s = ut + ½at²" | removed |
| choice "student's g from the gradient" | moved to the exam card |

Skill check: **build** (the stone on the cliff, 21.8 m), **spotError** (Zara uses a = +9.81 and gets a negative time), **choice** (the drone's parcel, kept), **exam card** CP1: (a) State what the gradient of h against t² represents [1] (½g), (b) Determine g [2] (`g = 2 × gradient`, 9.74 m s⁻²). Deviation from the task text: the graph pick is about the v–t graph of the flight, not h–t², because the h–t² figure can only draw one straight line (it is the exam card's picture).
