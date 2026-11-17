# Lesson spec — "Two motions at once"

17 Nov 2026 · status: **spec and lesson built together** (the owner: "do what you can, feedback later"), checked in the web at 375×667, light and dark theme; the owner has not seen either yet, not yet on a phone · format: story + Skill check (`docs/LESSON_FRAMEWORK.md`, 1b)

- **id:** `projectiles` · level 1 "Motion" (blue), the last lesson of the level · WPH11 point **7** (the independence of the vertical and horizontal motion of a projectile moving freely under gravity) · ~12 min
- **Idea:** a projectile does two motions at once, and they do not affect each other. Sideways nothing pushes it, so its horizontal velocity never changes (s = ut). Downward it accelerates at g, exactly like a dropped ball. The two share only the clock: **the time comes from the vertical motion**, then it is used sideways. Air resistance is ignored.
- **Misconceptions:** the faster ball stays up longer (or lands first); the time found from the horizontal speed (h ÷ u); the whole launch speed used in the vertical equations; only the way up counted (time to the top, not the time of flight); speed at the top = 0; the ½ or the 2 lost in s = ½gt² and v² = u² + 2as; the vertical and horizontal speeds added as plain numbers; a dropped package falls behind the plane.
- **The puzzle:** Mia and Leo kick a ball from the same spot at 20 m s⁻¹: Mia at 30° above the ground, Leo at 60°. Whose ball lands further away?
- **The "oh, interesting" moment:** **neither**: both land 35.3 m away. Mia's ball moves faster sideways (17.3 m s⁻¹) but is up only 2.04 s; Leo's moves at 10.0 m s⁻¹ but stays up 3.53 s. Same product. Then the explore screen shows 45° beats both (40.8 m), and angles either side of 45° tie.

All numbers from `src/physics/projectile.ts`, re-checked by a test. g = 9.81 m s⁻².

| Quantity | Value |
|---|---|
| Bench 1.25 m high: time to fall (any sideways speed) | **0.505 s** |
| Ball B rolled off at 2.0 m s⁻¹: lands from the bench | **1.01 m** (0.20 m sideways every 0.1 s) |
| Ball C at 4.0 m s⁻¹ | same 0.505 s, lands **2.02 m** out |
| Mia, 20 m s⁻¹ at 30°: along / up | **17.3 / 10.0 m s⁻¹** |
| Mia: time in the air / speed at the top / range | **2.04 s** / **17.3 m s⁻¹** / **35.3 m** |
| Leo, 60°: along / up / time / range / highest point | 10.0 / 17.3 m s⁻¹ / **3.53 s** / **35.3 m** / **15.3 m** |
| 45°: range | **40.8 m** |

## Story (16 screens)

| # | id | Kind | What happens | Figure |
|---|---|---|---|---|
| 1 | intro | intro | Mia and Leo kick from the same spot at 20 m s⁻¹, at 30° and 60° | field: both launch arrows with their angles |
| 2 | hook | predict | "Whose ball lands further away?" Mia's (lower) / Leo's (higher) / the same spot / not sure | field |
| 3 | two-motions | text + card | a ball in flight does two motions at once: sideways steady, downward like a dropped ball. Card: **independent** motions share only the time | — |
| 4 | race | choice | bench 1.25 m: A drops off one end as B rolls off the other at 2.0 m s⁻¹. Which lands first? → **together** (B, faster, stays up longer · A, the shorter path). After Check the fall plays at ¼ speed with strobe copies and dashed lines joining the same moments | bench, A and B |
| 5 | strobe | explore | slider = time 0–0.50 s; strobe copies every 0.1 s, B's two velocity arrows (sideways stays the same, downward grows). "How far does B move sideways in each 0.1 s?" → **0.20 m every time** | bench, live |
| 6 | fall-time | choice | how long does the 1.25 m fall take? → **0.505 s** (0.357: the 2 lost · 0.625: 1.25 ÷ 2.0, the sideways speed · 0.255: no square root) | bench, B |
| 7 | land | choice | how far from the bench does B land? → **1.01 m** (1.25: time from h ÷ u · 0.71: the 2 lost · 2.50: the landing vertical speed used) | bench, B; distance after Check |
| 8 | faster | choice | C rolls off at 4.0 m s⁻¹, twice as fast: how long is its fall? → **0.505 s, the same** (0.252 s · 1.01 s) | bench, B and C landed; plays after Check |
| 9 | split | text + fig | at an angle: split Mia's kick into 17.3 m s⁻¹ along and 10.0 m s⁻¹ up, as in the last lesson; each part runs on its own | field, Mia, components |
| 10 | flight-time | choice | Mia's ball goes up at 10.0 and comes back to the ground: time in the air → **2.04 s** (1.02: only the way up · 3.53: the sideways part · 4.08: the whole 20 m s⁻¹) | field, Mia, components; the flight plays after Check |
| 11 | top | choice | speed at the top → **17.3 m s⁻¹** (0: only the vertical part is zero · 20.0 · 10.0) | field, Mia at the top, "v = ?" |
| 12 | range | choice | how far away does Mia's ball land? → **35.3 m** (40.8: the whole speed · 17.7: the time to the top only · 20.4: the vertical part) | field, Mia's path, distance "?" |
| 13 | hook-again | choice (revisit) | Leo: up at 17.3, along at 10.0, up for 3.53 s. Whose ball lands further? → **the same spot, 35.3 m** | field, both; paths and distance after Check |
| 14 | angle | explore | slider = angle 0°–90°, the path redrawn live, header = time and distance. "At what angle does it land furthest?" → **about 45°** (40.8 m) | field, live |
| 15 | height | choice | how high does Leo's ball rise? → **15.3 m** (20.4: the whole speed · 5.1: the 10.0 part, Mia's height · 30.6: the 2 lost) | field, Leo at the top; height after Check |
| 16 | rules | text + card | split u; horizontal s = ut; vertical suvat with g; the time links them; air resistance ignored. Notebook card | — |

## Skill check (4 questions, one try, no hints)

| id | Question | Answer |
|---|---|---|
| cliff | a stone kicked horizontally at 15 m s⁻¹ off a 20 m cliff: how far from the foot of the cliff does it land? | **30.3 m** (21.4: the 2 lost · 61.2: no square root · 20.0: time from h ÷ u) |
| impact | the same stone: speed just before it lands | **24.8 m s⁻¹** (19.8: vertical only · 34.8: added as numbers · 15.0: horizontal only) |
| golf | a golf ball hit at 25 m s⁻¹, 40° above level ground: highest point | **13.2 m** (31.9: the whole speed · 18.7: the horizontal part · 26.3: the 2 lost) |
| package | a plane flying level at 60 m s⁻¹, 180 m up, drops a package: where is the plane when it lands? | **directly above it** (363 m ahead of it · 363 m behind it · above the point of release) |

**You can now:** treat a projectile as two motions on one clock · find the time of flight from the vertical motion alone · find how far and how high a projectile goes · explain why the speed at the top is not zero.

**Recap:** both kicks with their paths, landing at the same spot: "Mia's ball moved faster sideways, Leo's stayed up longer. Both landed 35.3 m away."

**Notebook card:** `x: s = ut; y: a = g` — "Horizontal and vertical motions are independent. They share only the time t."

## What was built

1. Physics, `src/physics/projectile.ts`: `launchParts`, `projectilePosition`, `projectileVelocity`, `flightTime`, `projectileRange`, `timeToTop`, `topHeight`, `landingSpeed`. Test.
   Small fixes on the way: "You said earlier:" keeps the capital of a name or "I" ("Mia's", "I'm"); the course list no longer needs `ready: false` filled in.
2. Figure "bench" (`src/figures/BenchFigure.tsx`): a lab bench seen from the side, ball A at the left end (dropped), B (and C) rolling off the right end; plays at ¼ speed with strobe copies every 0.1 s and dashed lines joining the copies taken at the same moment; on the explore screen the slider is the clock and B carries its two velocity arrows; the landing distance as a dimension line on the floor.
3. Figure "kick" (`src/figures/KickFigure.tsx`): level ground, the launch spot on the left; each kick's velocity as an outline arrow with its angle, optionally split into components; the path as a dashed curve; the ball still at the start or at the top, or the flight played in real time with a clock; distance and height as dimension lines ("?" until Check); on the explore screen the slider is the launch angle.
4. Content `src/content/two-motions-at-once.ts` + test, `ready: true` on the map.

## Open for the owner

- The puzzle is a football kick on level ground; a strong student may know the 30°/60° trick. The bench screens come first so the idea is built before it is used.
- Mia and Leo are not drawn; only the ball, the launch spot and the paths.
- No air resistance anywhere (said on the rules screen and in the predict prompt).
- The bench falls play at ¼ speed (real time is half a second); the sheet says "¼ SPEED".
- With two kicks the distance line stays hidden until Check: a single "?" line would already tell they land at the same spot.
