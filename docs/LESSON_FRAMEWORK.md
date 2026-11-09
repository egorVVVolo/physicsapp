# Lesson Design Framework — Physicsapp

Nov 4, 2026 · Egor · live version: https://claude.ai/artifact/UHketLhprt3oQ4s26kWrQ3

## 1. Purpose and how to use

Every lesson is built from this framework: one idea per lesson, about 12–15 minutes, split into three short chapters, with two paths (novice and intermediate) that meet at the same exam-style finish.

- **For Claude Code:** before writing any lesson, fill the template in section 13, check it against the misconception bank (section 12) and the definition of done (section 15). Content lives in `src/content/` as typed data; every number is computed by `src/physics/`.
- **For Egor:** review a lesson spec (section 13 format) before it is built — it is the cheapest point to fix physics, level and flow. Then play the built lesson on a phone.
- **Language:** lesson content in English; this framework is the source of truth for structure, step types, visuals and exam alignment.
- **Scope:** written for Kinematics (Edexcel IAL Unit 1, WPH11), designed to reuse for every later module.

## 1a. Decisions of 9 Nov 2026 (override older text below where they conflict)

Agreed with Egor after the visuals research (`docs/research/visuals-2026-11-09.md`) and the balloon prototype (`prototypes/balloon-step.html`, kept as a reference only).

**Sessions**
- A core session is about **10 minutes**: present → practise → close. Deeper follow-up sessions come later: *Tricky cases* (harder cases, no worked examples) and *Exam workout* (mixed topics, exam format, marks shown). The three chapters in section 4 are spread over these sessions; a chapter end is where a session can close.

**Screen and visuals**
- **Big scene, one object in focus.** The moving object fills the scene; at any moment only one thing asks for attention. On a small phone a combined scene + graph is unreadable (owner's verdict on prototype B).
- **Scene and graph are separate views,** never squeezed side by side. The graph gets its own full-width view (its own step, or a switch on the same step); both still run on the same model and clock `t`.
- **One screen, no scrolling.** Condition, scene, question, answers and one primary button fit on a phone screen.
- **The problem statement is always complete and visible** while the learner answers.
- **Playback auto-continues.** It pauses briefly at key events (top, return, impact) with a short caption on the scene, then carries on by itself. Tap the scene to pause. No "Continue" buttons.
- **Minimal controls:** one small replay button; after playback, drag on the scene or graph to scrub. No speed buttons or sliders by default.
- **Wrong answer plays out on the scene** (ghost of the learner's answer next to the real motion, frozen where they diverge, gap labelled).
- **Flat schematic bodies, fixed world frame** (no follow camera), arrows start at the point of application and carry symbol, value and unit.
- **Colour:** the prototype looked too grey. Keep a light base, but use clearer, more saturated accents and less grey; final values are set in the M1 design tokens and checked for contrast.

**Calculation on a phone**
- The learner never does arithmetic in their head. They choose the relation and the values (with signs); the app solves.
- Multiple-choice options are used only where the options can be told apart without calculating (sign, direction, ratio, which method).
- Numeric exam steps get a built-in calculator.

**Stack:** react-native-svg + Reanimated + Gesture Handler, analytic models in `src/physics/`, no physics engine. Check which SDK the store Expo Go runs before creating the project.

## 2. Learner model

We design for three learners; the **novice is the default reader** — every lesson must work for them without extra help.

| Learner | Who they are | What they need | Path in a lesson |
| --- | --- | --- | --- |
| Novice | Comfortable with algebra (rearranging, substituting), weak on physics formulas, little physics knowledge | Meaning before symbols; worked examples; which formula and why; app does arithmetic | Example-first, faded steps |
| Intermediate | Knows the formulas, makes classic mistakes (signs, slope vs height, wrong SUVAT) | Problems first; feedback aimed at the exact mistake; no re-teaching what they know | Problem-first, example only on error |
| Advanced | Solid, wants exam-level stretch | Multi-step, unfamiliar contexts, “show that” questions | Problem-first + Challenge chapter |

**Level of content** is Foundations / Intermediate / Advanced per step (prior knowledge needed + reasoning steps + independence), not age or number size. Ugly arithmetic never makes a step “hard”.

**Entry:** the placement result sets the starting path per topic; inside a lesson the path switches on behaviour (section 6). Nobody is locked into a path.

**Arithmetic rule:** the app always does the calculation once the learner has chosen the relation and the values. We train choosing and setting up physics, not calculator use.

## 3. Core principles

Ten rules, each tied to evidence; when a lesson idea conflicts with one, the rule wins unless Egor decides otherwise.

1. **One idea per lesson.** A lesson teaches one transferable idea (“area under v–t is displacement”), not a topic.
2. **Predict before you see.** Every lesson opens with a prediction the learner commits to; the animation never reveals the answer before “Check”.
3. **Novices learn from examples, intermediates from problems.** Worked examples help novices most and lose value as expertise grows (expertise reversal), so novices get example-first faded steps and intermediates get problem-first.
4. **Fade, don’t jump.** Full worked example → same type with one step missing → learner does all steps.
5. **Aim at a named misconception.** Every lesson targets at least one entry from the misconception bank; every wrong option maps to one.
6. **Meaning before symbols.** Quantities are shown on the scene before they appear in an equation; equations are built from tiles that point back to the scene.
7. **One screen, one job (Mayer).** Remove decoration (coherence); highlight what matters now (signaling); labels sit on the diagram (spatial contiguity); text appears with the motion it describes (temporal contiguity); learner controls pace with taps (segmenting).
8. **Show the invisible (PhET).** Velocity arrows, signed areas, tangents, component shadows — things a real experiment cannot show.
9. **Finish on the exam.** Every lesson ends with at least one question in Edexcel format, units included.
10. **Come back later.** Each lesson creates review items that return after 1, 3 and 7 days; spaced practice reliably beats massed practice. Mixed-topic practice only after topics are learned — interleaving complex physics during first learning can hurt.

## 4. Lesson anatomy

A lesson is about 12–15 minutes and 14–20 screens, in three chapters of about 5 minutes; progress saves after every screen and a chapter end is a natural place to stop.

```
A · See it      Hook: predict → Explore the scene → Explain with motion
                                        │
B · Build it                       Which path?
                 ┌──────────────────────┴──────────────────────┐
     Novice · example first                     Intermediate · problem first
     Worked example                              Problem (example only on error)
     Faded example        ◄── switch once ──►    Variation
     Solo step
                 └──────────────► Spot the error (shared) ◄─────┘
                                        │
C · Exam it     Exam card → Transfer → Challenge (optional) → Wrap-up
                                        │
                           Review after 1 · 3 · 7 days
```

Both paths start from the same hook and meet again at “Spot the error”; only Chapter B differs.

| Chapter | Goal | Beats (screens) | Time |
| --- | --- | --- | --- |
| A — See it | Build intuition before symbols | Hook: predict (1) · Explore: play with the scene to find the pattern (2–3) · Explain: concept card synced with motion (1–2) | ~4 min |
| B — Build it | Turn intuition into a method | Path split (section 6). Novice: worked example (1) → faded example (1–2) → solo (1). Intermediate: solo problem (1–2), example shown only on error → variation (1). Both: spot-the-error or misconception check (1) | ~5–6 min |
| C — Exam it | Prove it in exam format | Exam step with marks shown (1–2) · Transfer to a new situation (1) · Challenge, Advanced, optional (1–2) · Wrap-up: “You can now…” + 1-tap difficulty rating (1) | ~4–5 min |

Rules for the flow:

- The same scene carries the whole lesson; it changes configuration, not style, so the learner never re-learns the picture.
- No screen has more than one new idea and one action.
- The hook’s answer is revisited in Explain (“remember your prediction?”), closing the loop.
- Both paths reach the same Chapter C: different routes, one standard.

## 5. Step type catalogue

Twelve step types cover every lesson; a lesson should use at least five different types so it never feels like a quiz.

| Type | What the learner does | Best for | Checking | Phone UI |
| --- | --- | --- | --- | --- |
| `predict` | Picks an outcome before seeing it | Hooks, misconceptions | Exact option | 2–4 large options under the scene |
| `scene-explore` | Drags a handle/slider freely to find a pattern; continues after a set interaction | Discovery | None (gated by interaction) | Scene full width, one control |
| `scene-target` | Drags the scene to a target state (“make the gap reach zero at 3 s”) | Applying an idea with feedback | State within tolerance | Live readout of the value being set |
| `graph-pick` | Chooses the graph that matches a motion (or vice versa) | Graph-as-picture, slope/height | Exact option | 3 small graphs, tap to enlarge |
| `graph-sketch` | Drags 2–4 points to shape a graph | Producing, not recognising | Shape rules (sign of slope, zero crossing) | Snap to grid |
| `identify-knowns` | Taps words in the question and assigns s, u, v, a, t (or “not given”) | Novices weak on formulas | Each assignment | Highlighted text + 5 slots |
| `choose-relation` | Picks the SUVAT equation (or graph rule) that fits the knowns | Model choice | Any valid relation | Equation cards; missing variable greyed |
| `build-equation` | Places values/tiles into the chosen relation; app computes | Setting up without arithmetic | Correct substitution | Tiles linked to the scene by colour |
| `numeric` | Enters a value + picks a unit | Exam steps, when the app has shown the setup | Value within tolerance + unit | Number pad + unit chips |
| `order-reasoning` | Orders 3–5 statements into an explanation chain | “Explain” questions | Order (some swaps allowed) | Drag cards |
| `spot-error` | Finds the wrong line in a worked solution | Intermediates; misconceptions | Exact line | Tap a line |
| `exam-card` | A full exam-style question (marks shown, command word bold) built from the types above | Chapter C | Per part | Card with parts (a), (b) |

Per-type rules: options are never “all of the above”; distractors come from the misconception bank; every interactive step has a reduced-motion version; `numeric` tolerance is ±1% unless the step says otherwise (exam rounding is taught in Explain, not punished in tolerance).

## 6. Branching and adaptivity

The path is chosen at the start of Chapter B from two signals and can switch once in either direction; the rules are simple so they can be explained and tested.

**Choosing the path (start of Chapter B)**

| Placement result for this topic | Hook answered correctly first try? | Path |
| --- | --- | --- |
| `strong` | yes | Intermediate |
| `strong` | no | Intermediate (with a targeted feedback card first) |
| `shaky` / `not yet` / skipped | yes | Intermediate |
| `shaky` / `not yet` / skipped | no | Novice |

**Switching inside Chapter B**

- Intermediate → Novice: two wrong first attempts in a row, or a hint ladder used to the reveal. The learner sees “Let’s look at one worked example”, not a demotion.
- Novice → Intermediate: faded example and solo step both correct first try with no hints → skip the remaining scaffolded screens.
- One switch per lesson at most, to avoid ping-pong.

**Outcomes recorded per step:** `independent` (first try, no hint) · `assisted` (hint or second try) · `revealed` (answer shown). A lesson counts as “done independently” only if the exam step and transfer step are `independent`.

**Challenge chapter:** offered (not forced) when the path is Intermediate or the exam step is `independent`. Skipping it never blocks progress.

## 7. Feedback and hints

Feedback names the specific mistake and points back to the scene; it never just says “wrong”.

**Correct answer:** one short line of why (max 20 words) + the scene animates the consequence + light haptic. No confetti.

**Wrong answer:** feedback written per distractor, tied to its misconception id. Pattern: what you did → why it is tempting → where to look. Example: “You read the height of the graph. Velocity is the slope — how steep is the line at 3 s?” The relevant part of the scene highlights. Then “Try again”.

**Hint ladder (per step, max 2 hints, then reveal):**

1. **Nudge** — points attention: “Which quantity is not given in the question?”
2. **Targeted** — gives the method step: “Without t, use v² = u² + 2as.”
3. **Reveal** — worked solution, animated on the scene; step becomes `revealed`, and a similar item is queued for review.

**Tone:** calm, direct, second person, no shame (“Most people pick this — here’s the catch”). Never praise effort with filler (“Great job!”) on every step; reserve stronger reactions for exam steps and transfer.

**Timing:** feedback panel slides up within 150 ms of Check; explanation text appears in sync with the explaining motion, not after it.

## 8. Visualization system

Every scene is assembled from a small set of parts driven by one model and one clock `t`, so the object, the graphs and the arrows can never disagree.

**Screen layout (top to bottom):** progress bar + close · step title (max 2 lines) · scene (40–55% of height) · prompt and input · one primary button. Nothing else.

**Scene parts**

| Part | What it shows | Rules |
| --- | --- | --- |
| Track | Object on a 1D axis | Origin marked 0; positive direction arrow always visible; tick labels in metres |
| Strobe trail | Object positions at equal time steps | Spacing shows speed without numbers; ideal for hooks |
| Graph panels | s–t, v–t, a–t | Stacked with aligned time axes; one shared time cursor; axes labelled with quantity and unit |
| Vector arrow | Velocity, acceleration, components | Starts at the object’s centre and moves with it; length proportional to magnitude; label beside the tip |
| Signed area | Displacement under v–t | Above the axis filled, below hatched; running total shown as a number with sign |
| Tangent tool | Gradient at a point | Draggable along the curve; shows rise/run triangle |
| Component shadows | Projectile x and y motion | Shadow dots on both axes move with the object |

**Colour semantics (fixed in every lesson):** displacement/position = ink navy · velocity = blue · acceleration = coral · time and axes = neutral grey · current focus = amber highlight · correct = green · incorrect = red with icon and text. Exact values are set in the design tokens (milestone 1). Max three semantic colours active on one screen.

**Motion rules**

- Physics motion follows the model in linear time (no easing); a typical replay lasts 2–4 s, scaled from real time and labelled “× 0.5” if slowed.
- UI motion (cards, buttons, feedback) uses springs with light overshoot.
- Explanations are choreographed: highlight → motion → label appears, one at a time.
- `revealPolicy`: in `predict` steps the scene shows only the setup until Check.
- Every scene has pause, replay and a reduced-motion mode (step-through frames).

**Never:** decorative wobble, toy-car clip art, mascots, more than one moving thing that is not the subject, legends far from what they label.

## 9. Exam alignment

Every lesson maps to numbered statements of the official Edexcel IAL Physics specification (Issue 3) and ends in Edexcel question format.

**Spec statements for the Kinematics module** (Unit 1, Mechanics; numbering as in the specification):

| Spec | Statement (short) | Lessons |
| --- | --- | --- |
| 1 | Use the equations for uniformly accelerated motion in one dimension | L3, L4, L5 |
| 2 | Draw and interpret displacement–time, velocity–time and acceleration–time graphs | L2, L4 |
| 3 | Quantities from slopes and areas of graphs, incl. non-uniform acceleration | L2 |
| 4 | Scalar and vector quantities, with examples | L1 |
| 5 | Resolve a vector into two perpendicular components (drawing and calculation) | L5 |
| 6 | Resultant of two coplanar vectors (any angle by drawing; right angles by calculation) | L1, L5 |
| 7 | Independence of vertical and horizontal motion of a projectile | L5 |
| 11 | Core Practical 1: acceleration of a freely falling object | L4 |

**Assessment objectives:** Unit 1 is weighted roughly equally between AO1 (knowledge and understanding) and AO2(a) (application in familiar and unfamiliar contexts), with a smaller AO2(b) share (analysis and judgement). So each lesson needs both a “know it” step and an “apply it to something new” step.

**Exam conventions we copy:**

- Command word in bold at the start of the task: **Calculate**, **Determine**, **Show that**, **Explain**, **State**, **Sketch**.
- Marks in brackets after each part: (2), (3).
- SI units required on numeric answers; prefixes allowed (km, ms).
- Significant figures: answers given to the precision of the data (usually 2–3 s.f.); taught in Explain, accepted within tolerance.
- **Show that** parts give the target value; the learner sets up the method (`choose-relation` + `build-equation`), and the app shows the result to one more s.f. than the target.
- **Explain** parts become `order-reasoning` chains whose steps mirror typical mark-scheme points.
- g = 9.81 m s⁻² unless the question says otherwise.

**Originality:** past papers set the format and level only. Never copy question text, diagrams or numbers from Pearson papers.

Sources: [Edexcel IAL Physics specification, Issue 3](https://insworld.edu.sg/wp-content/uploads/2024/02/IAL-Physics.pdf) (pp. 12–17, 42–43); [Pearson IAL Physics (2018) page](https://qualifications.pearson.com/en/qualifications/edexcel-international-advanced-levels/physics-2018.html).

## 10. Content writing rules

Short, concrete, conversational English that a B2 reader understands on first read.

- **Length:** step title ≤ 8 words; prompt ≤ 35 words; feedback ≤ 25 words; concept card ≤ 3 sentences.
- **Voice:** second person, present tense, active (“Drag the line until…”). No “It can be seen that…”.
- **Terms:** introduce a term the moment it is shown on the scene; bold it once; use exactly that word afterwards (“displacement”, never also “position change”).
- **Symbols:** use exam symbols — s, u, v, a, t; units as m s⁻¹, m s⁻².
- **Numbers:** realistic and clean enough to reason about, never trivial (Intermediate steps avoid all-integer one-step answers). Answers computed by `src/physics/`.
- **Contexts:** real, varied, adult — cyclists, lifts, trains, sprinters, drones, phones dropped from a balcony. No cartoon contexts.
- **Distractors:** each wrong option is a real misconception (bank id in the spec) and plausible at a glance.
- **Accessibility:** no meaning by colour alone; every scene has a one-sentence text description for screen readers.

## 11. Review system

Each lesson produces 4–6 review items that come back after about 1, 3 and 7 days in a short Review session of 3–5 questions on the home screen.

- **Item sources:** the hook (re-asked with new numbers), the exam step, every step that ended `assisted` or `revealed`, and the transfer step.
- **Item format:** short — `predict`, `graph-pick`, `choose-relation`, `numeric`; no long explore steps. Numbers and contexts vary from the lesson so it is retrieval, not recognition.
- **Scheduling:** correct first try → next interval (1 → 3 → 7 → 21 days); wrong → back to 1 day plus a link to the relevant lesson screen.
- **Session:** 3–5 items, about 2–3 minutes, mixed across learned topics only (interleaving after first learning, not during it).
- **Honesty:** progress shows “reviewed on time” counts, never an invented mastery percentage.

## 12. Misconception bank — Kinematics

Every lesson targets at least one id below; every distractor and wrong-answer feedback cites one.

| Id | Misconception | How it shows up | Scene that breaks it |
| --- | --- | --- | --- |
| K-GRAPH-PICTURE | Graph is a picture of the path | Draws a “hill” for a car going up a hill | Track and graph side by side; same motion, different graph shapes |
| K-SLOPE-HEIGHT | Confuses slope with height | Reads velocity off the height of an s–t graph | Tangent tool + linked v–t panel |
| K-POINT-INTERVAL | Uses a single point instead of an interval | Average velocity from one reading | Two cursors marking the interval |
| K-AREA-SIGN | Area below the axis counted as positive | Displacement too large after reversing | Signed area with running total |
| K-DIST-DISP | Distance = displacement | 800 m path called 800 m displacement | Strobe trail on a round trip |
| K-SPEED-VEL | Speed and velocity interchangeable | Ignores direction/sign | Velocity arrow flipping direction |
| K-SIGN-CONV | Inconsistent sign convention | g taken positive while upwards is positive | Positive-direction arrow on the track; sign check card |
| K-TOP-ZERO-A | Acceleration is zero at the top | “a = 0 when v = 0” | v–t straight line crossing zero; a–t constant |
| K-ACC-DIR | Acceleration points the way of motion | Braking car given positive a | Arrows: v right, a left |
| K-SUVAT-ANY | SUVAT used when acceleration isn’t constant | Applies v = u + at to a curved v–t | Non-uniform v–t with a “constant a?” check |
| K-SUVAT-PICK | Picks an equation containing an unknown that isn’t needed | Uses equation with t when t isn’t given | `identify-knowns` greys out the missing variable |
| K-PROJ-HORIZ-A | Horizontal velocity changes in flight | Thinks the ball slows horizontally | Component shadows: x shadow moves evenly |
| K-PROJ-TIME | Horizontal speed changes fall time | “The launched ball lands later” | Dropped vs launched ball, same instant |
| K-PROJ-TOP-V | Velocity is zero at the top of a projectile | v = 0 at max height | Velocity arrow stays horizontal at the top |
| K-SCALAR-VEC | Treats vectors like scalars when adding | 3 + 4 = 7 for perpendicular displacements | Tip-to-tail drag with live resultant |

Sources: [Beichner (1994), kinematics graphs](https://moodle2.units.it/pluginfile.php/732257/mod_resource/content/1/Testing%20student%20understanding%20kinematics%20graphs.pdf); [Planinic et al. (2012)](https://www.bib.irb.hr/452519).

## 13. Lesson spec template

Every lesson is written in this shape first (reviewable by Egor), then translated 1:1 into typed content in `src/content/`.

```yaml
lesson:
  id: kin-02-graphs
  number: L2
  title: Read motion from a graph        # ≤ 6 words
  idea: "Slope of v–t is acceleration; signed area under v–t is displacement."
  spec: [2, 3]                           # spec statement numbers (section 9)
  level: Intermediate                    # default level of the core path
  prerequisites: [kin-01-signs]
  misconceptions: [K-SLOPE-HEIGHT, K-AREA-SIGN, K-GRAPH-PICTURE]
  minutes: 14
  scene: motion-lab                       # one scene for the whole lesson
  youCanNow:                              # 1–2 lines shown at the end
    - "Find acceleration and displacement from any v–t graph"

chapters:
  - id: A-see
    steps:
      - id: hook
        type: predict
        prompt: "…"
        scene: { config: {...}, revealPolicy: after-answer }
        options:
          - { id: a, text: "…", correct: true }
          - { id: b, text: "…", misconception: K-GRAPH-PICTURE, feedback: "…" }
        hints: ["nudge…", "targeted…"]
        explanation: "…"                  # shown after Check, synced with motion
        answer: { computeFrom: physics.vtArea, args: {...} }
  - id: B-build
    paths:
      novice: [ ...steps ]
      intermediate: [ ...steps ]
    shared: [ ...steps ]                  # e.g. spot-error
  - id: C-exam
    steps: [ exam-card, transfer, challenge?, wrap-up ]

review:                                   # 4–6 items, varied numbers
  - { from: hook, vary: [numbers, context] }
  - { from: exam-b }
```

Required per step: `id`, `type`, `prompt`, `answer` (computed, never typed), `hints` (2) for checked steps, `feedback` per wrong option with a misconception id, `explanation`, scene config. Optional: `level` override, `marks` (exam steps), `tolerance`.

## 14. Worked example — L2 “Read motion from a graph”

This is the reference lesson: about 14 minutes, 15–17 screens per path, spec 2 and 3, targeting K-SLOPE-HEIGHT, K-AREA-SIGN, K-GRAPH-PICTURE and K-SUVAT-ANY. All numbers below are checked; in code they come from `src/physics/`.

**Idea:** slope of v–t is acceleration; signed area under v–t is displacement. **Scene:** Motion Lab — a rider on a straight path (track + strobe trail) above linked v–t and s–t panels with one time cursor.

### Chapter A — See it (~4 min)

| # | Type | Content | Visual | Answer / feedback |
| --- | --- | --- | --- | --- |
| A1 | `predict` | v–t: 0 → 8 m s⁻¹ in 4 s, steady 8 m s⁻¹ for 6 s, 8 → 0 in 2 s. “How far from the start is the rider at 12 s?” | Only the v–t graph; track hidden until Check | **72 m** ✓ · 96 m (max speed × 12 s, K-POINT-INTERVAL) · 0 m (“graph ends at zero”, K-GRAPH-PICTURE) · 48 m (steady part only) |
| A2 | `scene-explore` | “Drag the time cursor. Watch the shaded area and the rider.” | Area fills behind the cursor; running total “s = … m”; rider moves on the track | Gate: cursor reaches 12 s. Areas: 16 + 48 + 8 = 72 m |
| A3 | `scene-explore` | “Now watch the slope readout.” | Tangent triangle rides the cursor; readout a = 2, 0, −4 m s⁻² | Gate: visit all three segments |
| A4 | concept card | “Slope of v–t = acceleration. Area under v–t = displacement. Remember your prediction?” | The three areas pulse in turn with their values | — |

### Chapter B — Build it (~5–6 min)

Novice path

| # | Type | Content | Answer |
| --- | --- | --- | --- |
| B1n | worked example | v–t: 0 → 6 m s⁻¹ in 3 s, then 6 m s⁻¹ for 5 s. Area split into triangle + rectangle, animated step by step | ½ × 3 × 6 = 9 m; 6 × 5 = 30 m; **39 m** |
| B2n | faded (`build-equation`) | v–t: 2 → 10 m s⁻¹ in 4 s. Learner taps the shapes (triangle + rectangle) and places the values; app computes | 16 m + 8 m = **24 m** |
| B3n | `numeric` | “What is the acceleration on the same graph?” Learner picks rise and run on the graph; app computes | **2 m s⁻²** |

Intermediate path

| # | Type | Content | Answer |
| --- | --- | --- | --- |
| B1i | `numeric` | v–t falls steadily from +6 to −4 m s⁻¹ over 5 s. “Find the displacement over 5 s.” | Crosses zero at 3 s; +9 m and −4 m → **+5 m**. Distractor 13 m → K-AREA-SIGN feedback |
| B2i | `numeric` | “And the distance travelled?” | **13 m** |

Shared

| # | Type | Content | Answer |
| --- | --- | --- | --- |
| B4 | `spot-error` | s–t straight line from (0 s, 0 m) to (4 s, 12 m). Solution: (1) at 4 s, s = 12 m; (2) so v = 12 m s⁻¹; (3) the rider moves at constant velocity | Line (2): velocity is the slope, **3 m s⁻¹** (K-SLOPE-HEIGHT) |

### Chapter C — Exam it (~4–5 min)

| # | Type | Content | Answer |
| --- | --- | --- | --- |
| C1 | `exam-card` | A train: 0 → 15 m s⁻¹ in 20 s, steady for 30 s, stops in 10 s. (a) **Calculate** the acceleration in the first 20 s. (2) (b) **Calculate** the distance travelled in 60 s. (3) | (a) **0.75 m s⁻²** (b) 150 + 450 + 75 = **675 m** |
| C2 | transfer (`predict` + `order-reasoning`) | A sprinter’s v–t is curved (non-uniform acceleration). “Which method gives the distance in the first 4 s?” then order the explanation | **Estimate the area under the curve** ✓ · s = ut + ½at² (K-SUVAT-ANY) · final v × t (K-POINT-INTERVAL). Chain: a is not constant → SUVAT needs constant a → area under v–t is displacement for any motion → estimate by counting squares |
| C3 | Challenge (`scene-target` + `numeric`) | Car A drives at a steady 12 m s⁻¹; car B starts beside it from rest at 3 m s⁻². “Drag the cursor until B has caught up.” Then: when are they furthest apart? | Equal areas: 12t = 1.5t² → **t = 8 s**, both at **96 m**. Furthest apart when velocities are equal: **t = 4 s**, gap **24 m** |
| C4 | wrap-up | “You can now find acceleration and displacement from any v–t graph.” + Too easy / Just right / Too hard | — |

**Review items:** A1 with new numbers and context · C1(b) variant · B1i reversal variant · B4 variant with a curved s–t (tangent) · C2 method choice with a different curve.

## 15. Definition of done

A lesson ships only when every box is ticked; Claude Code checks the first two groups, Egor the last.

**Spec and content**

- [ ] Spec template filled; one idea; spec statements listed
- [ ] Hook targets a named misconception; every distractor has an id and feedback
- [ ] Novice and intermediate paths both reach the same Chapter C
- [ ] At least 5 different step types; Chapter C has an exam card with command words, marks and units
- [ ] Transfer step uses a context not seen earlier in the lesson
- [ ] Challenge step present (Advanced, optional)
- [ ] 4–6 review items defined
- [ ] No text, numbers or diagrams copied from Pearson papers

**Build and physics**

- [ ] Every answer computed by `src/physics/`; a test checks each one
- [ ] Scene motion follows the model; arrows attached; reveal policy respected
- [ ] Pause, replay and reduced motion work; screen-reader description present
- [ ] Text within length limits; contrast ≥ 4.5:1; touch targets ≥ 44 pt
- [ ] Played end to end on a real phone on both paths

**Owner review (Egor)**

- [ ] Physics correct and at exam level
- [ ] At least one “oh, interesting” moment
- [ ] Animations feel smooth and meaningful, not decorative
- [ ] Fits in about 15 minutes

## Sources

- [Edexcel IAL Physics specification, Issue 3](https://insworld.edu.sg/wp-content/uploads/2024/02/IAL-Physics.pdf)
- [Worked-example effect and expertise reversal (overview)](https://en.wikipedia.org/wiki/Worked-example_effect)
- [Kalyuga et al. — worked example to problem-solving transition](https://www.skills.sh/garethmanning/claude-education-skills/worked-example-to-problem-solving-transition-designer)
- [Spacing, interleaving, retrieval: one size does not fit all](https://pmc.ncbi.nlm.nih.gov/articles/PMC10950551)
- [Interleaving complex physics (May 2026 digest)](https://carlhendrick.substack.com/p/the-monthly-dispatch-whats-new-in-3c4)
- [Mayer (2020), multimedia principles](https://ugc.futurelearn.com/uploads/files/7d/d6/7dd6188d-c343-4311-b064-ac98d2c95abc/Multimedia_Principles._R._E._Mayer__2020.pdf)
- [PhET simulation design](https://www.aapt.org/Conferences/newfaculty/upload/2018_06_PhET_NFW_presentation.pdf)
- [Beichner (1994), kinematics graphs](https://moodle2.units.it/pluginfile.php/732257/mod_resource/content/1/Testing%20student%20understanding%20kinematics%20graphs.pdf)
