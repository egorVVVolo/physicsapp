# The push from the floor (`normal-reaction`)

The reference lesson of the project: the scales in a lift say 60.0 kg at home and 69.2 kg when the lift starts up (N = m(g + a), the scales show N ÷ g). WPH11 points 8, 9, 10, 12 (and 3 in the Skill check). Its content is in `src/content/normal-reaction.ts` and its test next to it; the rules it follows are in `docs/LESSON_FRAMEWORK.md`.

## v3 changes (24 Nov)

Task D5. The puzzle and its recap are unchanged. 15 screens + 4 Skill check; chapters *The puzzle* → *Weight and the push* → *Back to the lift*; cast: Imran.

| Was | Now |
|---|---|
| text "the scales push back up: N" | folded into the prompt of `at-rest` (the lesson had three text screens in a row) |
| choice "steady speed" | removed (the slider and the slowing-lift tap carry it) |
| choice "N for the 80 kg friend" | **build** `N = m × (g + a)`; the sign of a is a chip (`+1.2` right, `−1.2` wrong), 881 N |
| — | **estimate** `reading`: the number the scales show as the lift starts up (69.2 kg, tolerance 1.5 kg; scale 40–90 so the slider does not start near the answer) |
| choice "what number do the scales show now" | choice **by idea**: why the scales show more (the floor pushes harder, not more mass or stronger gravity) |
| tapFig "third-law partner of N" | **sort** `pair-sort`: third-law pair / balanced forces (five pairs) |

Skill check: **build** (the person going down and slowing, `+2.0 m s⁻²`, 886 N), **sort** (forces on the person / on the scales), **choice** (free fall: 0 N, kept), **exam card** on a passenger in a lift starting down at 1.0 m s⁻²: (a) State the direction of the resultant force [1] (down), (b) Calculate the normal reaction [2] (485 N). The trip graph and the book questions were dropped.
