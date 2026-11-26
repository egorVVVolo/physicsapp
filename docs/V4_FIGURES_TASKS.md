# Все фигуры в стиле №3 «как Brilliant» — этапы

Владелец одобрил стиль на лифте и дорожке и попросил перевести всё (26 нояб.). Правила стиля — `docs/DESIGN.md`, раздел 13. Один этап = один коммит. «продолжаем» → первый этап без ✅ (можно несколько подряд).

## Как делать этап
1. Добавь виды фигур этапа в `CLEAN` (`src/figures/Sheet.tsx`). Это сразу даёт белый лист с сеткой, крупные подписи шрифтом приложения, больший размер и мягкие цвета материалов (`softMaterial` через `CleanTheme`).
2. В файле каждой фигуры:
   - тела крупнее: рисунок занимает не меньше 70 % ширины и высоты viewBox (можно менять `*_VB`);
   - убрать декор: `Hatch` → простая чернильная линия пола 1.8; фонари, поручни, лишние полоски — убрать;
   - главные тела (о которых вопрос) — заливка `soft.A/B/metal.fill` и край того же тона `soft.*.edge`, 1.8; остальная конструкция — чернильные линии 1.8;
   - заглавные подписи (`FORCES ON YOU`) — обычным регистром;
   - синий только сила; физику, тексты уроков и цифры не менять.
3. Проверка: `npm run check`; в вебе `/gallery/figs` на 375, обе темы — все фигуры этапа глазами (наложения подписей, выход за край, тела не прижаты к краю); `docs/scripts/label-overlap.js`; один урок этапа на 375×667.
4. ✅ здесь, строка в «Статус» `CLAUDE.md`, коммит `Figure style 3: <уровень>`, push.

## Этапы

| № | Виды фигур | Статус |
|---|---|---|
| 0 | lift, track (пилот) | ✅ |
| 1 | Урок «The push from the floor»: scales, pairs, liftPair, vt | ✅ |
| 2 | Motion: graph, equations, brakeVt, throwVt, fallGraph, plot | ✅ |
| 3 | Motion: road, chase, throw, bench, kick | ✅ |
| 4 | Motion: vectors, resolve, sledge, hill | |
| 5 | Forces: crate, ladder, particle, pulley, fall, fallVt | |
| 6 | Momentum and moments: wall, bodies, collide | |
| 7 | Momentum and moments: spanner, pole, bar, beam, broom | |
| 8 | Energy: platform, ramp, kinetic, height | |
| 9 | Energy: cliff, slide, ride, winch (велосипедистка и ребёнок — пиктограммы; `Mitten` — простая скруглённая кисть того же тона) | |
| 10 | Fluids: tank, dunk, tube, flow | |
| 11 | Materials: spring, wire, material, launcher | |
| 12 | Уборка: `STYLE_2`, `classic`/`pick`, `/gallery/style` удалить; когда `CLEAN` — все виды, убрать набор. Картинки курса и предметов уровней (`src/art/`) не трогать. Стоп: владелец | |
