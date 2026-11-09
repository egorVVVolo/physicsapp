# Physicsapp — Feature List

Nov 4, 2026 · Egor · live version: https://claude.ai/artifact/RkbXTxbuZNJHZ7d4FfiiFd

The app has eight feature areas; the MVP (about 8–10 weeks) ships 5 Kinematics lessons, placement, accounts, Practice, Review and Progress, while payments, notifications and new modules wait for the pilot’s results.

Phase labels used below: **MVP** — in the first pilot build · **After pilot** — next, once pilot data is in · **Later** — needs proven demand first. Lesson internals (step types, paths, visuals) are specified in `docs/LESSON_FRAMEWORK.md`; this list covers the whole app around them.

## App map

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

Onboarding runs once, then the app lives in three tabs; every lesson, practice set and review item plays in the same lesson player on top of one shared engine.

## 1. Onboarding and account

A new user reaches their first interactive scene in under 30 seconds and finishes onboarding in about 2 minutes, with no sign-up wall.

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
| Email sign-in | Magic link for users without Apple/Google | After pilot |
| School code | Join a class by code for teacher-led pilots | Later |

## 2. Learn

Learn is the home tab: one big “Continue” and a clear course path; any lesson is reachable in two taps.

| Feature | What it does | Phase |
| --- | --- | --- |
| Continue card | Next recommended lesson, steps done, minutes left | MVP |
| Course path | Kinematics: 5 lessons with level, status (new / in progress / done on your own / done with help) and placement hints (“You’re strong here — optional”) | MVP |
| Lesson intro sheet | Goal (“You’ll be able to…”), level, prerequisites, ~15 min; Start / Resume / Replay | MVP |
| Lesson player | Full-screen, three chapters (See it · Build it · Exam it), scene-first layout, one main button | MVP |
| 12 step types | Predict, explore, target, graph pick/sketch, identify knowns, choose relation, build equation, numeric + units, order reasoning, spot the error, exam card | MVP |
| Two paths in a lesson | Novice (example first) and intermediate (problem first); one automatic switch | MVP |
| Hints and reveal | Two hints per step, then an animated worked solution | MVP |
| Feedback per mistake | Each wrong option explains its specific misconception, scene highlights the spot | MVP |
| Interactive scenes | Motion Lab (track + linked graphs) and Projectile Lab | MVP |
| Pause, replay, step-through | On every animation; step-through for reduced motion | MVP |
| Resume mid-lesson | Exit saves position; return to the exact screen | MVP |
| Lesson complete | “You can now…”, honest outcome, streak +1, 1-tap difficulty rating | MVP |
| Challenge chapter | Optional Advanced step at the end of every lesson | MVP |
| Glossary pop-up | Tap a bold term to see its definition and symbol | After pilot |
| Formula sheet | The exam’s equations in one place, each linked to the lesson that explains it | After pilot |
| Bookmarks / notes | Save a screen for later revision | Later |

## 3. Practice and Review

Practice is exam questions on demand; Review is short spaced recall that the app schedules for you.

| Feature | What it does | Phase |
| --- | --- | --- |
| Practice sets | 12–15 original exam-style questions grouped as Graphs, SUVAT, Projectiles, Mixed; played in sets of 5 | MVP |
| Unlock rule | Practice opens after lesson 2, Mixed after all lessons (no mixing during first learning) | MVP |
| Exam formatting | Command word in bold, marks in brackets, units required | MVP |
| Worked solution after answer | Step-by-step, animated on the scene where possible | MVP |
| Practice summary | Score, which questions were independent / assisted, link to the lesson for each miss | MVP |
| Review session | 3–5 items on the home screen, about 2–3 minutes | MVP |
| Spaced scheduling | Correct → 1, 3, 7, 21 days; wrong → back to 1 day | MVP |
| Varied review items | Same idea, new numbers and context | MVP |
| “Practice weak spots” | One tap set built from your assisted/revealed steps | After pilot |
| Timed mini-paper | 10–15 minutes, exam timing, mark-scheme style summary | Later |
| Past-paper mapping | “This is like question type X in Unit 1” (no copied text) | Later |

## 4. Progress and motivation

Motivation comes from visible, honest progress — facts only, no invented mastery percentages and no guilt mechanics.

| Feature | What it does | Phase |
| --- | --- | --- |
| Streak | Days in a row with at least one lesson, review or practice set | MVP |
| Week heatmap | 7 cells next to the streak on Learn, today highlighted | MVP |
| Activity heatmap | Day grid on Progress (from the first week of use), colour by steps solved | MVP |
| Lesson outcomes | Done on your own / done with help, per lesson | MVP |
| Skills by spec point | e.g. “Motion graphs: 3/4 independent” | MVP |
| Before → after | Placement map next to the current one | MVP |
| Answer reactions | Short confident motion + haptic on correct; stronger moment on exam and transfer steps | MVP |
| Streak freeze | One missed day forgiven per week | After pilot |
| Weekly summary | “This week: 3 lessons, 12 exam steps on your own” | After pilot |
| Exam countdown | Set exam date; plan adjusts the daily suggestion | Later |
| Shareable result card | Image of a finished module for Instagram stories | Later |

## 5. Settings, accessibility, offline

The app works without internet and is usable with VoiceOver/TalkBack, large text and reduced motion.

| Feature | What it does | Phase |
| --- | --- | --- |
| Settings screen | Account, study goal, retake placement, reset progress, send feedback, privacy policy, about | MVP |
| Reduced motion | Follows the system setting; manual switch; step-through scenes | MVP |
| Sound and haptics toggles | Off switches for both | MVP |
| Dynamic text size | Layout survives the largest system text size | MVP |
| Screen-reader support | Labels on controls; one-sentence description per scene | MVP |
| Colour-safe feedback | Correct/wrong also shown by icon and text | MVP |
| Offline lessons | All content ships inside the app; progress syncs when back online | MVP |
| Send feedback | Form link with app version and current screen attached | MVP |
| Dark theme | Full dark palette for scenes and UI | After pilot |
| Language options | Interface in other languages | Later |

## 6. Behind the scenes

Users never see these, but they decide whether lessons are correct, fast to build and measurable.

| Feature | What it does | Phase |
| --- | --- | --- |
| Physics engine (`src/physics/`) | Functions for SUVAT, graph areas/slopes, projectiles; every answer and every scene frame comes from here | MVP |
| Content as typed data | Lessons, steps, practice and review items in `src/content/`, validated by a schema | MVP |
| Answer tests | Automated check that every answer in the content equals the physics engine’s result | MVP |
| Scene components | Track, strobe trail, graph panels, vectors, signed area, tangent tool, component shadows — reused across lessons | MVP |
| Design tokens | Colours, type, spacing, motion springs in one place | MVP |
| Lesson preview mode | Jump to any step, switch path, replay — for reviewing lessons quickly | MVP |
| Cloud sync (Supabase) | Anonymous user, progress tables, row-level security | MVP |
| Pilot analytics | Events: onboarding done, lesson start/finish, step outcomes, review done, sign-in, difficulty rating | MVP |
| Crash reporting | Know when the app breaks on someone’s phone | MVP |
| Remote content updates | Ship fixed lessons without a store release (over-the-air updates) | After pilot |
| Content admin | Edit lesson text without code | Later |

## 7. Web version and growth

The web version is the door from Instagram: tap a link, play a scene, start lesson 1 without installing.

| Feature | What it does | Phase |
| --- | --- | --- |
| Web app | Same code as the phone app, opened by link; full lessons | MVP |
| Deep link to a lesson | Link from a post opens that lesson’s hook directly | MVP |
| Store builds for the pilot | TestFlight (iOS) and Google internal testing | MVP |
| Scene clip export | Record a scene as a short vertical video for posts (internal tool) | After pilot |
| Landing page | One page: what it is, live scene, download links, privacy policy | After pilot |
| Public store release | App Store and Google Play listing with screenshots | After pilot |
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
