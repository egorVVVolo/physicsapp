# Lesson Design Framework — Physicsapp

Nov 4, 2026 · updated Nov 11, 2026 (section 1b: lesson format v2 overrides older sections) · Egor

## 1. Purpose and how to use

Every lesson is built from this framework: one idea per lesson, split into sessions of about 10 minutes (Core, Exam workout, Tricky cases), one path at exam level, ending in exam-style questions.

- **For Claude Code:** before writing any lesson, fill the template in section 13, check it against the misconception bank (section 12) and the definition of done (section 15). Content lives in `src/content/` as typed data; every number is computed by `src/physics/`.
- **For Egor:** review a lesson spec (section 13 format) before it is built — it is the cheapest point to fix physics, level and flow. Then play the built lesson on a phone.
- **Language:** lesson content in English; this framework is the source of truth for structure, step types, visuals and exam alignment.
- **Scope:** written for Kinematics (Edexcel IAL Unit 1, WPH11), designed to reuse for every later module.

## 1b. Lesson format v2: decisions of 11 Nov 2026, night (supersedes everything below where it conflicts)

The owner played the Blueprint L4 and rejected both the lessons and the look, then sent 60 screenshots of Brilliant. What we take from them:

**Story, not drills.** One small topic from the specification per lesson (for example "normal reaction", not "dynamics"). The lesson is a short story around one puzzle:
intro (title, one or two sentences, a figure) → a prediction with no right answer → screens that build the idea, each followed soon by a question → back to the puzzle, now answerable (`revisitOf`) → **Skill check** (3–5 exam-level questions, one try, "Why?" only after the answer) → **Lesson complete** with the honest tally.

**One focus per screen.** A screen is either text (at most two short paragraphs, optionally one definition card) or a figure with one sentence. Never a picture and text saying the same thing. Text screens are welcome when the text is the focus. Limits live in `src/content/rules.test.ts`.

**Six screen kinds** (`src/content/types.ts`): `intro`, `text`, `predict`, `choice`, `explore` (a slider drives the figure through the physics model, then a light question that is not counted), `tapFig` (answer by tapping something drawn on the figure).

**Answers and honesty.** Check → green sheet "Correct!" with Why? and Continue, or red "Not quite" with the wrong option's hint and Try again. The second miss in the story shows the answer (revealed); one miss in the Skill check shows it. Outcomes: independent / assisted / revealed (`src/session/logic.ts`). Predictions and explore questions have no outcome. After the answer the figure may show what the question hid (for example the real N arrow).

**Look: "Brilliant + engineering drawing".** White page, ink text, one dark pill button with a bottom lip, answer cards with a corner badge when right or wrong, a thin green progress bar plus one dot per Skill check question. The memorable part is the figure: a drawing sheet on pale drafting paper with `FIG. n` and the given values in IBM Plex Mono, flat line art, a centre-of-gravity mark, hatched floors. **Every force is drawn in one signature colour** (ruby); other vectors are told apart by shape (motion = outline arrow, acceleration = double chevron). Space Grotesk for titles and buttons, IBM Plex Sans for reading. Mono caps only inside figures. No mascot, no purple gradients, no XP or streaks yet.

**Course map.** Home is a map of Unit 1: levels follow the specification, each lesson is a puck on a path (done / current / soon), a card at the bottom starts the picked lesson. `src/content/course.ts` lists every lesson (with a one-line `about`); a test checks that all 32 WPH11 points are covered.
Map v2 (12 Nov, owner asked to polish one part at a time, map first): thick glossy pucks that sink when pressed; a raised tile with the lesson's line icon hovers (bobs) over the next lesson; the picked puck has a pulsing ring; pucks follow a gentle wave joined by a dash-dot centre line (solid in the level colour after a finished lesson); the level plate is pinned under the header and blends to the level you scroll into; a "Soon" lesson can be picked and the card says what it will cover with a disabled "Coming soon"; a round button scrolls back to the next lesson when it is off screen; pucks pop in once on opening. Code: `src/map/`, `src/figures/Puck.tsx`, `LessonIcon.tsx`, `CourseIcon.tsx`. With the React Compiler on, Reanimated shared values must use `.get()` / `.set()`, not `.value`.

**Reference lesson:** `src/content/normal-reaction.ts` ("The push from the floor", points 8, 9, 10, 12, and 3 in the Skill check). Copy its shape, not its text.

**Superseded:** "idea → question pairs" (10 Nov), "the scene is ~60 % of the screen", "every question has a separate how-to-answer line" (now only on `explore` and `tapFig`), the Blueprint dark stage, the balloon carrier, sessions Core / Exam workout (one lesson = story + Skill check for now).

## 1a. Decisions of 9–10 Nov 2026

Agreed with Egor after the visuals research (`docs/research/visuals-2026-11-09.md`) and the balloon prototype (`prototypes/balloon-step.html`, kept as a reference only).

**Sessions**
- A core session is about **10 minutes**: present → practise → close. Deeper follow-up sessions come later: *Tricky cases* (harder cases, no worked examples) and *Exam workout* (mixed topics, exam format, marks shown). Section 4 defines what goes into each session.

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

**Decisions of 10 Nov** (after the project review, `docs/research/review-2026-11-10.md`)
- **One path per lesson,** at exam level (Intermediate). A worked example appears only after an error. A separate novice path waits for pilot evidence.
- **Six step types** for the first build (section 5); others are added when a lesson needs them.
- **Pilot build first:** three lessons (L4, L3, L2), each with a Core session and an Exam workout; no placement, no accounts, no review scheduling yet.
- **The "wow" checkpoint** is one full Core session played on a phone.
- The sections below were rewritten on 10 Nov to match. Section 14 (reference lesson L2) is **not yet rewritten** and must not be copied.

**Decisions of 10 Nov, evening (design pass after the first L4 build, owner verdict "ugly, overloaded, childish")**
- **Lesson flow is idea → question, repeated** (one idea on one screen, shown on the scene with one sentence, then a question that checks it), then spot-error and an exam-format step. This replaces "problem first, example only after an error" for the pilot. Idea steps have no outcome and are not counted in the honest tally.
- **Look:** a dark stage (scene + progress + centred question) over a light sheet (answers, feedback, one primary button). Colours carry meaning only: velocity cyan, acceleration coral, right green, wrong rose. No paragraph conditions (givens live on the scene or as small pills), no trail dots, no readout row, no graph switch in a step. Feedback ≤ 45 characters, captions ≤ 38, idea line ≤ 70, question ≤ 48.
- **Interaction:** a chosen answer shows live on the scene before it is committed (an arrow on the held object); the button is named by the action ("Let go"); in the build step every stage is its own screen and a tap on a choice commits at once.
- **Carrier is a hot-air balloon** (sandbag released from a rising balloon). Illustrations are simple, flat, soft shapes; anything more detailed needs an asset from the owner.
- The sections below that describe the older layout (graph switch, readout, conditions) are superseded by this block where they conflict.

**Decisions of 11 Nov (second design pass, owner: "more creative answers, bigger scene, Duolingo/Brilliant style, a bit more adult")**
- **Look:** light theme (white page, pale sky scene, ink-navy chunky button with a bottom lip). The scene takes most of the screen; the answer strip is slim; after Check a green or red banner slides over the strip with one line and Continue (Try again on a build stage). The dark stage of 10 Nov is superseded.
- **Answer on the scene, in different ways, each chosen for what it teaches:**
  - drag the velocity arrow on the sandbag (sets direction and size, the learner sees their vector next to the balloon's);
  - strobe: three frozen moments (rising, top, falling), tap to set a on each (catches "a = 0 at the top" and "a follows the motion" at once);
  - drag s from the release point to where it ends (the sign comes from a direction the learner drew);
  - tap-turn the acceleration arrow;
  - tap the landing time on a time line where t = 0 is the release (the negative root is visibly "before the release");
  - spot the error: the student's working is drawn as arrows; tap the wrong one (v pointing up at the ground);
  - number tiles into the equation in the exam (a wrong-unit tile is possible and telling).
- **Ordinary choice stays where choosing is the skill:** which equation, and what the sign of an answer means.
- Bigger balloon (scale 0.72) and sandbag (about 36 pt). Every wrong answer still plays as a ghost from the model.

**Decision of 11 Nov, evening ("Blueprint" look, chosen by the owner out of five mock-up directions)**
- **Look:** a light page (`#F5F8FC`) around a **dark-blue stage with a fine 20 pt grid** (`#0F3B73`), like an engineering drawing. The question sits on the stage in white; the "how to answer" line sits just under the stage in blue; answers, the verdict banner and the button stay on the light page. This supersedes the "pale sky scene" of 11 Nov (the rest of that block stands).
- **Colours on the stage** have their own brighter twins (`stage` in `src/theme/tokens.ts`): velocity cyan, acceleration coral, white handles and labels. The page keeps the darker ones (`palette`). The contrast test covers both.
- **Type:** Space Grotesk for questions, titles and buttons; IBM Plex Sans for everything else (loaded with expo-font, work in Expo Go).
- **Buttons and cards are flat** (no bottom lip); the progress bar is a thin navy line.
- **Start screen:** a blueprint card with the swaying balloon; after the lesson is done the card shows the height–time graph from the model. The graph is not shown before: it would answer the first question.

## 2. Learner model

The **default reader is the Intermediate learner**: a strong A-level student who knows the formulas and makes the classic mistakes. The pilot runs in a strong school, where the main risk is "too easy".

| Learner | Who they are | What they need | How the lesson serves them |
| --- | --- | --- | --- |
| Intermediate (default) | Knows the formulas, makes classic mistakes (signs, slope vs height, wrong SUVAT) | Problems first; feedback aimed at the exact mistake; no re-teaching | The one path of every lesson |
| Needs support | Comfortable with algebra, weak on physics formulas | Meaning before symbols; a worked example; which relation and why | Same path; a worked example and a second, similar problem appear after an error |
| Advanced | Solid, wants exam-level stretch | Multi-step, unfamiliar contexts, "show that" questions | Trap problems in Core, then the Tricky cases session |

**Level of content** is Foundations / Intermediate / Advanced per step (prior knowledge needed + reasoning steps + independence), not age or number size. Ugly arithmetic never makes a step "hard".

**Entry:** in the pilot build everyone starts at lesson 1, step 1. Placement comes with the full MVP and only recommends where to start; it never changes the path inside a lesson.

**Arithmetic rule:** the learner never does arithmetic in their head. They choose the relation and the signed values; the app solves. Numeric exam steps have a built-in calculator.

## 3. Core principles

Ten rules, each tied to evidence; when a lesson idea conflicts with one, the rule wins unless Egor decides otherwise.

1. **One idea per lesson.** A lesson teaches one transferable idea (“area under v–t is displacement”), not a topic.
2. **Predict before you see.** Every lesson opens with a prediction the learner commits to; the animation never reveals the answer before “Check”.
3. **Problem first, example on error.** Worked examples help novices most and lose value as expertise grows (expertise reversal). Our default reader is not a novice, so a step starts with the problem; the worked example is shown only after a wrong attempt.
4. **Fade, don’t jump.** After a worked example the learner gets the same type of problem again with new values, not a harder one.
5. **Aim at a named misconception.** Every lesson targets at least one entry from the misconception bank; every wrong option maps to one.
6. **Meaning before symbols.** Quantities are shown on the scene before they appear in an equation; equations are built from tiles that point back to the scene.
7. **One screen, one job (Mayer).** Remove decoration (coherence); highlight what matters now (signaling); labels sit on the diagram (spatial contiguity); captions appear with the motion they describe (temporal contiguity); playback is cut into segments by short automatic holds at key events, and a tap pauses it (segmenting).
8. **Show the invisible (PhET).** Velocity arrows, signed areas, tangents, component shadows — things a real experiment cannot show.
9. **Finish on the exam.** Every lesson ends with at least one question in Edexcel format, units included.
10. **Come back later.** Each lesson creates review items that return after 1, 3 and 7 days; spaced practice reliably beats massed practice. Mixed-topic practice only after topics are learned. (Review scheduling is built after the pilot.)

## 4. Lesson anatomy

A lesson is one idea split into **sessions of about 10 minutes**; a session is what the learner does in one sitting. Progress saves after every step.

```
Core (~10 min)           Hook: predict → build the idea (1–2 predicts / graph picks)
                         → Build the solution (worked example only after an error)
                         → Spot the error → one exam-format step → wrap-up
Exam workout (~10 min)   3–4 exam cards on this lesson's idea, marks shown
Tricky cases (~10 min)   harder cases, no worked examples (after the pilot)
```

| Session | Goal | Steps | In the pilot |
| --- | --- | --- | --- |
| Core | Intuition, then method | 6–8: hook `predict` (1) · `predict` / `graph-pick` that build the idea (1–2) · `build-solution` on a trap problem (1–2) · `spot-error` (1) · one exam-format step (1) · wrap-up: “You can now…” + two 1-tap questions | Yes |
| Exam workout | Prove it in exam format | 3–4 `exam-card` steps; numeric parts use the calculator; one card uses a context not seen in Core (transfer) | Yes |
| Tricky cases | Stretch | 4–6 Advanced steps: multi-step, unfamiliar contexts, “show that” | No |

The old chapters map onto sessions: *See it* and *Build it* are the Core session, *Exam it* is the Exam workout. The step counts are a first estimate and are tuned after the first full session is played on a phone.

Rules for the flow:

- The explanation **is** the playback: the answer plays on the scene with captions at key events. There are no separate explanation screens and no Continue buttons.
- The same scene carries the whole session; it changes configuration, not style, so the learner never re-learns the picture.
- No step has more than one new idea and one action.
- A caption must not give away a later question (for example, do not caption “a is still 9.81 m s⁻² at the top” before asking about it).
- The hook’s answer is revisited later in the session, closing the loop.

## 5. Step type catalogue

Six step types cover the first build; a session should use at least three of them so it never feels like a quiz.

| Type | What the learner does | Best for | Checking | Phone UI |
| --- | --- | --- | --- | --- |
| `predict` | Picks an outcome before seeing it. One attempt; the answer then plays on the scene, a wrong one as a ghost | Hooks, misconceptions | Exact option | 2–3 options in one row under the scene |
| `graph-pick` | Chooses the graph that matches a motion (or the motion that matches a graph) | Graph-as-picture, slope vs height | Exact option | One full-width graph at a time; tap to move between candidates. Never several small graphs |
| `build-solution` | Picks the relation, then fills it with values from the condition, **with signs**; the app solves and plays the result | The exam-level core: sign conventions, which SUVAT, which root | Relation valid for the knowns + each value and sign | A tray replaces the options row; may be its own view if it does not fit with the scene |
| `spot-error` | Taps the wrong line in a short worked solution | Classic mistakes | Exact line | 3–4 lines, each a 44 pt target |
| `numeric` | Enters a value and picks a unit, with a built-in calculator | Exam-format steps only | Value within tolerance + unit | Calculator view; layout decided on the first build |
| `exam-card` | Answers a full exam-style question (command word bold, marks shown) | Exam workout | Per part | A wrapper: each part (a), (b) is one of the types above |

`build-solution` is built (type name `build` in `src/content/types.ts`, state machine in `src/session/build.ts`, view in `src/steps/BuildStepView.tsx`). Stages: pick the equation → fill the signed values into the equation itself (tap a box, then a chip) → choose the root or read the sign. The app solves. A wrong value is marked in its box and plays as a ghost (the motion the wrong numbers describe); all signs flipped is a note, not an error. Exam format (`exam` field): one attempt per part, a miss loses the mark and the part is corrected for the learner. Checked in the web version at 375×667; **not yet played on a phone**.

**Added later, when a lesson needs them:** free scene exploration, drag-to-target, graph sketching, tapping knowns in the text, ordering a reasoning chain. They were in the original list of twelve; several do not fit one phone screen as first specified.

Per-type rules: options are never “all of the above”; multiple-choice options must be distinguishable **without calculating** (sign, direction, ratio, which method); distractors come from the misconception bank; every step has a reduced-motion version; `numeric` tolerance is ±1% unless the step says otherwise.

## 6. Help on error and outcomes

There is one path. Help is reactive: it appears after a mistake, never before.

- **`predict` and `graph-pick`:** one attempt. The answer plays out (a wrong one as a ghost beside the real motion) and the verdict comes with a one-line reason.
- **`build-solution`, `spot-error`, `numeric`:** a wrong attempt plays as a ghost where possible and the wrong slot or line is highlighted (first level of help); a second wrong attempt shows the method step (second level); then the worked solution is shown and the learner gets the same type of problem again with new values.
- Whether help is also available on request (a Hint button) is an open question, decided on the first `build-solution` step on the phone.

**Outcomes recorded per step:** `independent` (first try, no help) · `assisted` (help or second try) · `revealed` (answer shown). A `predict` step can only be `independent` or `revealed`. A session counts as “done on your own” only if its exam-format steps are `independent`.

A novice path with example-first steps is not built. It returns only if pilot data shows learners stuck on the first problem.

## 7. Feedback

Feedback names the specific mistake and shows it on the scene; it never just says “wrong”.

**Correct answer:** the answer plays on the scene, compared with the most common mistake shown as a labelled ghost (for example “from rest”), so the right answer is at least as interesting to watch as a wrong one. One line of why, at most 110 characters.

**Wrong answer:** the learner’s answer plays as a ghost next to the real motion; the playback holds where they diverge and the gap is labelled. Feedback is written per option and tied to its misconception id: what is true and why, in one line.

**Where it appears:** in the fixed-height slot that held the question, so nothing on the screen moves when Check is pressed. The chosen and the correct option are marked with an icon, not colour alone. Captions on the scene are at most 80 characters. A test enforces both length limits.

**Playback must not answer later questions.** It stops before any event a following step asks about (for example the real landing time).

**Tone:** calm, direct, second person, no shame. No filler praise.

## 8. Visualization system

Every scene is assembled from a small set of parts driven by one model and one clock `t`, so the object, the graphs and the arrows can never disagree.

**Screen layout (top to bottom, one screen, no scrolling, checked at 375×667):** thin progress + close · the complete condition (up to 3 lines, always visible) · the view: scene **or** graph, one at a time, at least half the height · a fixed-height slot (question before Check, feedback after) · answers in one row or the build tray · one primary button (Check → disabled while playing → Next). No step title.

**Scene parts**

| Part | What it shows | Rules |
| --- | --- | --- |
| Track | Object on a 1D axis | Origin marked 0; positive direction arrow always visible; tick labels in metres |
| Strobe trail | Object positions at equal time steps | Spacing shows speed without numbers; ideal for hooks |
| Graph view | s–t, v–t or a–t, one at a time | A separate full-width view on the same clock as the scene, never beside it; axis ranges come from the playback, not constants; axes labelled with quantity and unit |
| Vector arrow | Velocity, acceleration, components | Starts at the point of application and moves with the object; length proportional to magnitude; label with symbol, value and unit |
| Signed area | Displacement under v–t | Above the axis filled, below hatched; running total shown as a number with sign |
| Tangent tool | Gradient at a point | Draggable along the curve; shows rise/run triangle |
| Component shadows | Projectile x and y motion | Shadow dots on both axes move with the object |

**Colour semantics (fixed in every lesson, values in `src/theme/tokens.ts`):** velocity = blue (`vel`) · acceleration = orange (`acc`) · events, gaps and captions = teal (`event`) · the learner’s ghost = dashed (`ghost`) · correct = green and incorrect = red, each with an icon and text. A token for displacement and signed area is added when the first graph-area scene needs it. Label text uses the `*Text` tokens, which pass 4.5:1 (checked by a test). Avoid grey as a main colour.

**Motion rules**

- Physics motion follows the model in real time (no easing), at the same speed on 60, 90 and 120 Hz screens (tested). If a motion is slowed, the scene says so (“× 0.5”).
- Playback runs by itself and holds for about 1.7 s at each key event with a caption. Tap the scene to pause; one small replay button; after playback, drag on the scene to scrub.
- One object in focus, drawn in real screen points (not a scaled-down picture), fixed world frame.
- Before Check the scene shows only the setup.
- Reduced motion: playback jumps from event to event instead of animating.

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

**Built after the pilot.** Each lesson produces 4–6 review items that come back after about 1, 3 and 7 days in a short Review session of 3–5 questions on the home screen.

- **Item sources:** the hook (re-asked with new numbers), the exam step, every step that ended `assisted` or `revealed`, and the transfer step.
- **Item format:** short — `predict`, `graph-pick`, `build-solution`; no long steps. Numbers and contexts vary from the lesson so it is retrieval, not recognition.
- **Scheduling:** correct first try → next interval (1 → 3 → 7 → 21 days); wrong → back to 1 day plus a link to the relevant lesson screen.
- **Session:** 3–5 items, about 2–3 minutes, mixed across learned topics only (interleaving after first learning, not during it).
- **Honesty:** progress shows “reviewed on time” counts, never an invented mastery percentage.

## 12. Misconception bank — Kinematics

Every lesson targets at least one id below; every distractor and wrong-answer feedback cites one.

| Id | Misconception | How it shows up | Scene that breaks it |
| --- | --- | --- | --- |
| K-GRAPH-PICTURE | Graph is a picture of the path | Draws a “hill” for a car going up a hill | Same motion in the scene view, then in the graph view: the shapes differ |
| K-SLOPE-HEIGHT | Confuses slope with height | Reads velocity off the height of an s–t graph | Tangent tool on the s–t view, then the v–t view |
| K-POINT-INTERVAL | Uses a single point instead of an interval | Average velocity from one reading | Two cursors marking the interval |
| K-AREA-SIGN | Area below the axis counted as positive | Displacement too large after reversing | Signed area with running total |
| K-DIST-DISP | Distance = displacement | 800 m path called 800 m displacement | Strobe trail on a round trip |
| K-SPEED-VEL | Speed and velocity interchangeable | Ignores direction/sign | Velocity arrow flipping direction |
| K-SIGN-CONV | Inconsistent sign convention | g taken positive while upwards is positive | Positive-direction arrow on the track; sign check card |
| K-TOP-ZERO-A | Acceleration is zero at the top | “a = 0 when v = 0” | v–t straight line crossing zero; a–t constant |
| K-ACC-DIR | Acceleration points the way of motion | Braking car given positive a | Arrows: v right, a left |
| K-SUVAT-ANY | SUVAT used when acceleration isn’t constant | Applies v = u + at to a curved v–t | Non-uniform v–t with a “constant a?” check |
| K-SUVAT-PICK | Picks an equation containing an unknown that isn’t needed | Uses equation with t when t isn’t given | `build-solution`: a relation with a variable that is neither known nor wanted cannot be solved |
| K-PROJ-HORIZ-A | Horizontal velocity changes in flight | Thinks the ball slows horizontally | Component shadows: x shadow moves evenly |
| K-PROJ-TIME | Horizontal speed changes fall time | “The launched ball lands later” | Dropped vs launched ball, same instant |
| K-PROJ-TOP-V | Velocity is zero at the top of a projectile | v = 0 at max height | Velocity arrow stays horizontal at the top |
| K-SCALAR-VEC | Treats vectors like scalars when adding | 3 + 4 = 7 for perpendicular displacements | Tip-to-tail drag with live resultant |
| K-RELEASE-REST | A released object starts from rest | Takes u = 0 for a package let go from a moving drone | Ghost dropped from rest next to the real flight |
| K-ROOT-PICK | Takes the wrong root of a quadratic | Keeps t < 0, or does not say why one root is rejected | The equation offered two times; the negative one is before the release |

Sources: [Beichner (1994), kinematics graphs](https://moodle2.units.it/pluginfile.php/732257/mod_resource/content/1/Testing%20student%20understanding%20kinematics%20graphs.pdf); [Planinic et al. (2012)](https://www.bib.irb.hr/452519).

## 13. Lesson spec template

Every lesson is written in this shape first (reviewable by Egor), then translated 1:1 into typed content in `src/content/`.

```yaml
lesson:
  id: kin-04-up-stop-down
  number: L4
  title: Up, stop, down                  # ≤ 6 words
  idea: "At the top v = 0 but a is still −g; one sign convention carries the whole motion."
  spec: [1, 2, 11]                       # spec statement numbers (section 9)
  misconceptions: [K-TOP-ZERO-A, K-SIGN-CONV]
  trapProblem: "…"                       # the exam-level problem, chosen by Egor
  youCanNow:
    - "Solve up-and-down motion with one sign convention"

sessions:
  - id: core                             # ~10 min, 6–8 steps
    steps:
      - id: hook
        type: predict
        condition: "…"                   # complete, ≤ 3 lines, givens with units
        question: "…"
        scene: { type: vertical, params: {...} }
        options:                         # distinguishable without calculating
          - { id: up, label: "…", correct: true, feedback: "…" }
          - { id: zero, label: "…", misconception: K-…, feedback: "…" }
        playback: from the model         # events, captions, where it stops
      - { id: build, type: build-solution, … , workedSolution: … }
      - { id: error, type: spot-error, … }
      - { id: exam, type: exam-card, marks: 3, … }
  - id: exam                             # ~10 min, 3–4 exam cards
    steps: [ exam-card, exam-card, exam-card ]
  - id: tricky                           # after the pilot
    steps: [ … ]

review:                                  # after the pilot; 4–6 items, varied numbers
  - { from: hook, vary: [numbers, context] }
```

Required per step: `id`, `type`, `condition`, `question`, the answer (computed from `src/physics/`, never typed), `feedback` per wrong option with a misconception id, scene config. For `build-solution`, `spot-error` and `numeric`: the two levels of help and a worked solution. Optional: `marks` (exam steps), `tolerance`.

## 14. Worked example — L2 “Read motion from a graph”

> **Outdated — do not copy.** This section predates the decisions in 1a. It still has two paths, three chapters in one 14-minute sitting, a track with linked graph panels on one screen, and answers that need mental arithmetic (A1: 72 / 96 / 0 / 48 m). The numbers themselves are verified. It will be rewritten when L2 is built; until then the reference is the first built lesson (L4) and the template in section 13.

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
- [ ] A trap problem at exam level, chosen by Egor, is the `build-solution` step
- [ ] Options can be told apart without calculating; no step needs mental arithmetic
- [ ] At least three step types per session; exam cards have command words, marks and units
- [ ] One exam card uses a context not seen in the Core session
- [ ] No text, numbers or diagrams copied from Pearson papers

**Build and physics**

- [ ] Every number in the text and every answer comes from `src/physics/`; a test checks each one
- [ ] Scene motion follows the model; arrows attached; nothing is revealed before Check or ahead of a later question
- [ ] Each step fits one screen at 375×667 without scrolling (screenshot)
- [ ] Pause, replay and reduced motion work; screen-reader description present
- [ ] Text within length limits; contrast ≥ 4.5:1; touch targets ≥ 44 pt
- [ ] Played end to end on a real phone; timing of one motion checked with a stopwatch

**Owner review (Egor)**

- [ ] Physics correct and at exam level
- [ ] At least one “oh, interesting” moment
- [ ] Animations feel smooth and meaningful, not decorative
- [ ] Each session fits in about 10 minutes

## Sources

- [Edexcel IAL Physics specification, Issue 3](https://insworld.edu.sg/wp-content/uploads/2024/02/IAL-Physics.pdf)
- [Worked-example effect and expertise reversal (overview)](https://en.wikipedia.org/wiki/Worked-example_effect)
- [Kalyuga et al. — worked example to problem-solving transition](https://www.skills.sh/garethmanning/claude-education-skills/worked-example-to-problem-solving-transition-designer)
- [Spacing, interleaving, retrieval: one size does not fit all](https://pmc.ncbi.nlm.nih.gov/articles/PMC10950551)
- [Interleaving complex physics (May 2026 digest)](https://carlhendrick.substack.com/p/the-monthly-dispatch-whats-new-in-3c4)
- [Mayer (2020), multimedia principles](https://ugc.futurelearn.com/uploads/files/7d/d6/7dd6188d-c343-4311-b064-ac98d2c95abc/Multimedia_Principles._R._E._Mayer__2020.pdf)
- [PhET simulation design](https://www.aapt.org/Conferences/newfaculty/upload/2018_06_PhET_NFW_presentation.pdf)
- [Beichner (1994), kinematics graphs](https://moodle2.units.it/pluginfile.php/732257/mod_resource/content/1/Testing%20student%20understanding%20kinematics%20graphs.pdf)
