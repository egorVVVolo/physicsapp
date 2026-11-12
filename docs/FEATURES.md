# Physicsapp — Feature List

Nov 4, 2026 · updated Nov 10, 2026 (pilot build first; mirrors `docs/PLAN.md` v1.2) · Egor · live version: https://claude.ai/artifact/RkbXTxbuZNJHZ7d4FfiiFd

The app has eight feature areas. A **pilot build** comes first: 3 Kinematics lessons, no accounts and no placement, shared as a web link. The full MVP then adds 2 more lessons, placement, accounts, Practice, Review and Progress; payments, notifications and new modules wait for the pilot’s results.

**Update 12 Nov:** the look, motion, sound and the new screens (Notebook, day streak, Level complete, Settings, dark theme) are specified in `docs/DESIGN.md` and built in its six design rounds, which run between lessons. Where a phase below disagrees with that document for one of those features (streak, sound and haptics toggles, dark theme), `docs/DESIGN.md` wins.

Phase labels used below: **Pilot** — in the first pilot build · **MVP** — full MVP, built after the pilot build · **Next** — after the MVP, once pilot data is in · **Later** — needs proven demand first. If this list and `docs/PLAN.md` disagree, the plan wins. Lesson internals (sessions, step types, visuals) are specified in `docs/LESSON_FRAMEWORK.md`; this list covers the whole app around them.

## App map

Pilot build: the first launch opens the first question of lesson 1; after that one Home screen (3 lessons, their sessions, Continue) leads into the session player. No tabs, no onboarding.

Full MVP:

```
First launch (~2 min):  Welcome → Goal → Placement → Your level map → Save progress
                                                                          │
        ┌──────────────── Learn ────────────┬──────── Practice ────────┬──────── Progress ─────────┐
        │ Continue card                     │ Practice sets            │ Streak + week heatmap     │
        │ Course path                       │ Worked solutions         │ Activity heatmap          │
        │ Lesson intro                      │ Practice summary         │ Outcomes and skills       │
        │ Lesson player  ◄── shared engine  │ Review session           │ Before → after map        │
        │ Lesson complete                   │ Spaced schedule          │ Settings                  │
        └───────────────────────────────────┴──────────────────────────┴───────────────────────────┘
        Underneath: physics engine · typed content · cloud sync · analytics · crash reports
```

In the full MVP onboarding runs once, then the app lives in three tabs; every session, practice set and review item plays in the same session player on top of one shared engine.

## 1. Onboarding and account

Not in the pilot build, where the first screen is the first question. In the full MVP a new user reaches their first interactive scene in under 30 seconds and finishes onboarding in about 2 minutes, with no sign-up wall.

| Feature | What it does | Phase |
| --- | --- | --- |
| Welcome screen | One-line value, a live looping motion scene, “Find my level”; link for existing accounts | MVP |
| Goal question | Edexcel IAL / Other A level / Just curious — sets wording and route | MVP |
| Placement test | 4–6 adaptive questions on interactive scenes, about 90 s, always skippable | MVP |
| Placement result | Topic map (strong / shaky / not yet) + recommended first lesson | MVP |
| Anonymous account | Created silently on first launch so progress is saved from second one | MVP |
| Sign in with Apple / Google | Offered after placement (“Save your progress”) and once after lesson 1; “Not now” always works | MVP |
| Link identity | Signing in keeps everything done anonymously | MVP |
| Sync across devices | Phone and web show the same progress | MVP |
| Sign out, delete account | In Settings; delete is required by the App Store | MVP |
| Retake placement | From Settings; old result kept for “before → after” | MVP |
| Email sign-in | Magic link for users without Apple/Google | Next |
| School code | Join a class by code for teacher-led pilots | Later |

## 2. Learn

Learn is the home screen: one big “Continue” and a clear list of lessons and sessions; any lesson is reachable in two taps.

| Feature | What it does | Phase |
| --- | --- | --- |
| Continue card | Next recommended lesson, steps done, minutes left | Pilot |
| Lesson list | Pilot: one Home screen with 3 lessons and their sessions (Core, Exam workout) with status. Full MVP: Kinematics path of 5 lessons with placement hints | Pilot |
| Lesson intro sheet | Goal (“You’ll be able to…”), prerequisites, ~10 min per session; Start / Resume / Replay | MVP |
| Session player | Full-screen, one screen without scrolling: condition, big scene or graph (one at a time), question, answers, one main button | Pilot |
| 6 step types | Predict, graph pick, build the solution, spot the error, numeric with calculator, exam card. Others are added when a lesson needs them | Pilot |
| One path, help on error | Exam level by default; a worked example appears only after a mistake. A separate novice path: Later | Pilot |
| Help and reveal | Two levels of help per step, then a worked solution | Pilot |
| Feedback per mistake | The wrong answer plays on the scene as a ghost beside the real motion; each wrong option explains its misconception | Pilot |
| Scenes | Pilot: vertical motion, horizontal track, graphs as a separate view. Full MVP: Projectile Lab | Pilot |
| Auto-playing scenes | Playback holds at key events with a caption; tap to pause, replay, drag to scrub; event-by-event for reduced motion | Pilot |
| Resume mid-lesson | Exit saves position; return to the exact screen | Pilot |
| Session complete | “You can now…”, honest outcome, two 1-tap questions (difficulty, would you use it before the exam), optional text | Pilot |
| Tricky cases session | Advanced session in every lesson: harder cases, no worked examples | MVP |
| Glossary pop-up | Tap a bold term to see its definition and symbol | Next |
| Formula sheet | The exam’s equations in one place, each linked to the lesson that explains it | Next |
| Bookmarks / notes | Save a screen for later revision | Later |

## 3. Practice and Review

Exam questions live in two places: the Exam workout session of each lesson (pilot) and the mixed Practice tab (full MVP). Review is short spaced recall that the app schedules for you.

| Feature | What it does | Phase |
| --- | --- | --- |
| Exam workout | A second session in each lesson: 3–4 original exam-style cards | Pilot |
| Practice tab | Mixed sets across finished lessons (12–15 questions in total, sets of 5); opens after lesson 2 | MVP |
| Exam formatting | Command word in bold, marks in brackets, units required | Pilot |
| Worked solution after answer | Step-by-step, animated on the scene where possible | Pilot |
| Practice summary | Score, which questions were independent / assisted, link to the lesson for each miss | MVP |
| Review session | 3–5 items on the home screen, about 2–3 minutes | MVP |
| Spaced scheduling | Correct → 1, 3, 7, 21 days; wrong → back to 1 day | MVP |
| Varied review items | Same idea, new numbers and context | MVP |
| “Practice weak spots” | One tap set built from your assisted/revealed steps | Next |
| Timed mini-paper | 10–15 minutes, exam timing, mark-scheme style summary | Later |
| Past-paper mapping | “This is like question type X in Unit 1” (no copied text) | Later |

## 4. Progress and motivation

Motivation comes from visible, honest progress — facts only, no invented mastery percentages and no guilt mechanics.

| Feature | What it does | Phase |
| --- | --- | --- |
| Streak | Days in a row with at least one lesson, review or practice set | MVP |
| Week heatmap | 7 cells next to the streak on Learn, today highlighted | MVP |
| Activity heatmap | Day grid on Progress (from the first week of use), colour by steps solved | MVP |
| Lesson outcomes | Done on your own / done with help, per lesson | Pilot |
| Skills by spec point | e.g. “Motion graphs: 3/4 independent” | MVP |
| Before → after | Placement map next to the current one | MVP |
| Answer reactions | Short confident motion + haptic on correct; stronger moment on exam and transfer steps | MVP |
| Streak freeze | One missed day forgiven per week | Next |
| Weekly summary | “This week: 3 lessons, 12 exam steps on your own” | Next |
| Exam countdown | Set exam date; plan adjusts the daily suggestion | Later |
| Shareable result card | Image of a finished module for Instagram stories | Later |

## 5. Settings, accessibility, offline

The app works without internet and is usable with VoiceOver/TalkBack, large text and reduced motion.

| Feature | What it does | Phase |
| --- | --- | --- |
| Settings screen | Account, study goal, retake placement, reset progress, send feedback, privacy policy, about | MVP |
| Reduced motion | Follows the system setting; manual switch; step-through scenes | Pilot |
| Sound and haptics toggles | Off switches for both | MVP |
| Dynamic text size | Layout survives the largest system text size | MVP |
| Screen-reader support | Labels on controls; one-sentence description per scene | Pilot |
| Colour-safe feedback | Correct/wrong also shown by icon and text | Pilot |
| Offline lessons | All content ships inside the app; progress syncs when back online | Pilot |
| Send feedback | Form link with app version and current screen attached | Pilot |
| Dark theme | Full dark palette for scenes and UI | Next |
| Language options | Interface in other languages | Later |

## 6. Behind the scenes

Users never see these, but they decide whether lessons are correct, fast to build and measurable.

| Feature | What it does | Phase |
| --- | --- | --- |
| Physics engine (`src/physics/`) | Functions for SUVAT, graph areas/slopes, projectiles; every answer and every scene frame comes from here | Pilot |
| Content as typed data | Lessons, steps, practice and review items in `src/content/`, validated by a schema | Pilot |
| Answer tests | Automated check that every answer in the content equals the physics engine’s result | Pilot |
| Scene components | Ruler, ground, body, vector arrows, equal-time dots, ghost, graph view — reused across lessons | Pilot |
| Design tokens | Colours, type, spacing, motion springs in one place | Pilot |
| Lesson preview mode | Jump to any step, replay — for reviewing lessons quickly | MVP |
| Cloud sync (Supabase) | Anonymous user, progress tables, row-level security | MVP |
| Pilot counters | Anonymous counts: session start/finish, step outcomes, where people quit, survey answers. Whether to collect them is an open owner decision (testers are minors) | Pilot (open) |
| Crash reporting | Know when the app breaks on someone’s phone | MVP |
| Remote content updates | Ship fixed lessons without a store release (over-the-air updates) | Next |
| Content admin | Edit lesson text without code | Later |

## 7. Web version and growth

The web version is the door from Instagram: tap a link, play a scene, start lesson 1 without installing.

| Feature | What it does | Phase |
| --- | --- | --- |
| Web app | Same code as the phone app, opened by link; full lessons | Pilot |
| Deep link to a lesson | Link from a post opens that lesson’s hook directly | MVP |
| Store builds | TestFlight (iOS) and Google internal testing | MVP |
| Scene clip export | Record a scene as a short vertical video for posts (internal tool) | Next |
| Landing page | One page: what it is, live scene, download links, privacy policy | Next |
| Public store release | App Store and Google Play listing with screenshots | Next |
| Invite a friend | Share link that opens lesson 1 | Later |

## 8. Later: money, reminders, more content

These wait for pilot evidence that students finish lessons and come back; building them earlier would spend the 2 hours a week on guesses.

| Feature | What it does | Phase |
| --- | --- | --- |
| Freemium | First lessons of each module free, rest with subscription | Later |
| Subscription and paywall | Monthly / exam-season plans via App Store and Google Play billing | Later |
| Push reminders | Daily review nudge at a chosen time; opt-in | Later |
| Module 2+ | Forces, Energy, Materials, then Unit 2 topics | Later |
| AP Physics 1 route | Same physics core, US exam format and question set | Later |
| Teacher view | Class progress for a teacher running a pilot | Later |
| Spaced review across modules | Review mixes all learned modules | Later |

## 9. Not doing, and why

| Feature | Why not |
| --- | --- |
| Mascots, leagues, leaderboards | Against the adult, precise tone; competition pressure doesn’t teach physics |
| Voice-over | Large production cost; short synced text is enough for the MVP |
| Free-text answers | Hard to mark reliably on a phone; replaced by ordering reasoning chains |
| AI chat tutor | Expensive and risky on accuracy; not the core value |
| Copied past-paper questions | Copyright; we write original questions in the same format |
| Learner does arithmetic by hand | The app computes once the physics is set up — we train choosing, not calculator use |
