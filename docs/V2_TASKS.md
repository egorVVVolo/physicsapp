# Версия 2 — задачи пошагово

22 ноября 2026 · для исполнителя (Claude Code, модель Sonnet 5.5). **Что и зачем** — в `docs/V2_PLAN.md` (раздел указан в задаче). Здесь — **как**, по одной задаче на сессию.

## Как работать с этим файлом

1. **Одна задача = одна сессия.** Владелец пишет «сделай задачу A1» или «продолжаем» — тогда бери первую задачу без ✅ в таблице ниже. Порядок в таблице обязателен, кроме случаев, оговорённых в задаче.
2. Читай **только файлы из строки «Читать»** и раздел `docs/V2_PLAN.md`, на который ссылается задача. `docs/PLAN.md`, `docs/DESIGN_TASKS.md`, весь `LESSON_FRAMEWORK.md` не читать (кроме задач, где он назван).
3. Номера строк могли сдвинуться — ищи по тексту (`grep`).
4. Правила кода проекта:
   - React Compiler включён: у shared values Reanimated только `.get()` / `.set()`, никогда `.value`;
   - каждая анимация при reduced motion (`useReducedMotionPref()` из `src/ui/motion.tsx`) сразу в конечном состоянии;
   - интерфейс не пружинит (`Easing.out(Easing.cubic)`); пружинят только нарисованные тела, по модели;
   - цвета — только через `useTheme()` (`palette`, `level(c)`), времена — `motion` из `src/theme/tokens.ts`;
   - звук и вибрация — только через `feedback` (`src/ui/feedback.ts`);
   - хранение — только в `src/session/storage.ts`;
   - любое число в контенте — из функции `src/physics/`, а в тесте урока сверяется с моделью;
   - интерфейс, контент, код, коммиты — по-английски; ответы владельцу — по-русски;
   - prettier не запускать. Папку `personal-project/` в коммит не добавлять.
5. **Проверка в браузере** (сервер `web` из `.claude/launch.json`, порт 8081, ширина 375). Панель браузера часто скрыта — тогда после каждой загрузки страницы выполни JS:
   ```js
   window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
   setInterval(() => document.querySelectorAll('*').forEach((el) => {
     const h = el.__reactLayoutHandler; if (!h) return;
     const r = el.getBoundingClientRect();
     try { h({ nativeEvent: { layout: { x: r.x, y: r.y, width: r.width, height: r.height } } }); } catch {}
   }), 150);
   ```
   Кнопки нажимать из JS: `pointerdown, mousedown, pointerup, mouseup, click` по элементу `[role=button]` / `[role=radio]` с нужным текстом. Перейти на экран N урока: `localStorage.setItem('progress/v2/<id>', JSON.stringify({ v: 2, lessonId: '<id>', state: { index: N, outcomes: {}, picks: {}, finished: false }, updatedAt: Date.now() }))`, потом `navigate` на `/lesson/<id>` и снова JS выше. Анимация в скрытой панели дёрганая — это не баг, проверяй конечное состояние. Светлая/тёмная тема: `resize_window` с `colorScheme`.
6. **Готово, когда:** `npm run check` проходит; экран проверен скриншотом в вебе 375 в светлой и тёмной теме; в консоли нет ошибок (кроме возможной ошибки от самого JS-костыля выше).
7. После проверки: ✅ в таблице, обнови «Статус» в `CLAUDE.md` (одна строка: что сделано, какая задача следующая), `git commit` (сообщение дано в задаче) и `git push origin main`.
8. Ответ владельцу: что сделано простыми словами, что ему посмотреть, строка «Дальше: задача N», напомни ввести `/clear`.
9. Задача помечена **«сложная»** — перед началом скажи владельцу, что лучше Opus или режим плана, и дождись ответа.
10. Задача помечена **«стоп: владелец»** — после неё не начинай следующую, пока владелец не одобрит (покажи скриншоты).

## Список задач

| № | Задача | Статус |
|---|---|---|
| A1 | Перемешивание вариантов ответа | ✅ |
| A2 | Запись прохождения урока | ✅ |
| A3 | Главы: поле в уроке, сегменты полосы, плашка главы | ✅ |
| A4 | Текстовые экраны: фигура рядом, абзацы по одному, карточка-определение | |
| A5 | Обложка урока | |
| B1 | Задание build «Собери решение» (сложная) | |
| B2 | Задание order «По порядку» | |
| B3 | Задание spotError «Найди ошибку» | |
| B4 | Задание sort «Разложи» | |
| B5 | Задание estimate «На глаз» | |
| B6 | Задание worked «Разбор» | |
| B7 | Задание graphPick «Какой график» | |
| B8 | Задание examCard «Экзаменационная задача» (сложная) | |
| B9 | Правила урока v3 в тесте и в LESSON_FRAMEWORK; страница-образец (стоп: владелец) | |
| C1 | Общий набор деталей фигур (без изменений вида) | |
| C2 | Пилот стиля: материалы, толщины, подписи (сложная, стоп: владелец) | |
| C3 | Стиль: фигуры уровня Motion | |
| C4 | Стиль: фигуры уровня Forces | |
| C5 | Стиль: фигуры уровня Momentum and moments | |
| C6 | Стиль: фигуры уровня Energy | |
| C7 | Стиль: фигуры уровня Fluids | |
| C8 | Стиль: фигуры уровня Materials | |
| C9 | Движение для статичных фигур | |
| C10 | Кнопка повтора на листе | |
| C11 | Скорость: циклы стоят, когда не видны (сложная) | |
| D1 | Пилотный урок «Which way is positive?» по правилам v3 (стоп: владелец) | |
| D2 | Уроки «Reading motion graphs» и «Picking the equation» | |
| D3 | Уроки «Up, stop, down» и «Splitting a vector» | |
| D4 | Уроки «Two motions at once» и «Drawing the forces» | |
| D5 | Уроки «Force and acceleration» и «The push from the floor» | |
| D6 | Уроки «Falling through air» и «Momentum» | |
| D7 | Уроки «Collisions» и «Turning forces» | |
| D8 | Уроки «Keeping balance» и «Work done» | |
| D9 | Уроки «Kinetic and potential energy» и «Where the energy goes» | |
| D10 | Уроки «Power and efficiency» и «Density and upthrust» | |
| D11 | Уроки «Viscous drag» и «Hooke's law» | |
| D12 | Уроки «Stress, strain, Young modulus» и «Reading material graphs» | |
| D13 | Урок «Elastic strain energy»; правила v3 включены для всех | |
| E1 | Конец урока: праздник + экран разбора | |
| E2 | «Ага»-момент при решённой загадке | |
| E3 | Экран Level complete | |
| F1 | Вкладки Home · Learn · Revise · Me (сложная) | |
| F2 | Экран Home (стоп: владелец) | |
| F3 | Повторение по интервалам и общий проигрыватель практики (сложная) | |
| F4 | Вкладка Revise | |
| F5 | Вкладка Me: серия, штампы, спецификация | |
| F6 | Онбординг: Welcome, дата экзамена, первый урок | |
| F7 | Пустые состояния и проход по всем вкладкам (стоп: владелец) | |
| G1 | Полная проверка: все экраны, обе темы, доступность | |
| G2 | Список проверки на телефоне для владельца | |

---

## Этап A. Фундамент урока

### A1 Перемешивание вариантов ответа

**Цель.** Правильный ответ больше не стоит всегда на одном месте. Порядок вариантов детерминированный (один и тот же при каждом показе экрана), «I'm not sure» всегда последний. План: V2_PLAN 2.2.

**Читать:** `src/lesson/screens/QuestionView.tsx`, `src/lesson/screens/Simple.tsx` (PredictView), `src/lesson/screens/ExploreView.tsx`, `src/content/types.ts` (Option, Screen), `src/content/lessons.ts`.

**Шаги.**
1. Новый файл `src/session/shuffle.ts` (без React):
   ```ts
   // Deterministic order of answer options: the same every time a screen is shown, different between screens.
   export const SALT = 'v1';
   export function hash(s: string): number { /* FNV-1a 32-bit */ }
   function rng(seed: number): () => number { /* mulberry32 */ }
   /** Options in display order. `salt` changes the order (review uses the date). 'unsure' always stays last. */
   export function shuffled<T extends { id: string }>(items: readonly T[], key: string, salt = SALT): T[]
   ```
   Fisher–Yates с `rng(hash(key + '|' + salt))`; элемент с `id === 'unsure'` вынимается и ставится в конец.
2. В `QuestionView` (только `kind: 'choice'`), `PredictView` и вопросе в `ExploreView` рисуй `useMemo(() => shuffled(screen.options, screen.id), [screen])` вместо `screen.options`. У `tapFig` порядок не трогать (варианты — места на фигуре).
3. Тест `src/session/shuffle.test.ts`:
   - один и тот же ключ → один и тот же порядок; разные ключи → хотя бы иногда разный;
   - `unsure` последний;
   - **по всему курсу** (все уроки из `lessons.ts`, история + Skill check, `kind: 'choice'` с ровно 4 вариантами без `unsure`) доля каждой позиции правильного ответа от 12 % до 40 %. Если тест не проходит — поменяй `SALT` на `'v2'`, `'v3'`… до прохождения (запиши в комментарий, почему такое значение).

**Готово, когда:** тест зелёный; в уроке «Splitting a vector», экран Skill check 1, правильный ответ не первый (скриншот).

**Коммит:** `Shuffle answer options deterministically per screen; 'I'm not sure' stays last`

### A2 Запись прохождения урока

**Цель.** Урок запоминает, какие неверные варианты выбраны, сколько длился и угадан ли прогноз. После урока прохождение сохраняется отдельно (для разбора E1 и повторения F3). План: V2_PLAN 4.4, 5.4.

**Читать:** `src/session/logic.ts`, `src/session/logic.test.ts`, `src/session/storage.ts`, `src/app/lesson/[id].tsx`, `src/lesson/LessonPlayer.tsx`, `src/lesson/screens/QuestionView.tsx`, `src/content/types.ts` (Option, PredictScreen).

**Шаги.**
1. `types.ts`: в комментарии у `PredictScreen.options` напиши, что у верного варианта прогноза стоит `correct: true` (поле в `Option` уже есть).
2. Во всех 24 уроках `src/content/*.ts` поставь `correct: true` верному варианту predict. Какой верный — смотри ответ загадки в спеке урока `docs/lessons/<file>.md` (раздел про загадку) или в `recap.text` урока. В `src/content/rules.test.ts` добавь проверку: у каждого predict ровно один `correct`.
3. `logic.ts`, тип `LessonState` — новые поля:
   ```ts
   wrong: Record<string, string[]>; // question id → option ids picked wrongly, in order
   activeMs: number;                 // time on screens, each gap capped at 3 minutes
   lastAt: number | null;            // when the last screen was opened
   ```
   `startState` — `wrong: {}, activeMs: 0, lastAt: null`. `parseProgress` должен принимать старые сохранения без этих полей (подставить значения по умолчанию) — добавь тест.
   Новые чистые функции: `recordWrong(s, qid, optionId)`, `tick(s, now)` (прибавляет `min(now - lastAt, 180_000)` к `activeMs`, ставит `lastAt = now`). `next(s, lesson, now = Date.now())` вызывает `tick`.
4. `QuestionView`: новый проп `onWrong(optionId: string)`; вызывай при каждом неверном Check. В `LessonPlayer` передай `(o) => onChange(recordWrong(state, s.id, o))`.
5. `storage.ts`:
   ```ts
   export type Run = { at: number; ms: number; outcomes: Record<string, Outcome>; wrong: Record<string, string[]>;
     prediction: { id: string; pick: string; right: boolean } | null; feel: 'easy' | 'right' | 'hard' | null };
   export async function saveRun(lessonId: string, run: Run): Promise<void>   // key runs/v1/<id>, keep the last 5
   export async function loadRuns(lessonId: string): Promise<Run[]>           // newest last
   export async function setLastRunFeel(lessonId: string, feel: Run['feel']): Promise<void>
   ```
   `resetProgress` удаляет и `runs/v1/*`.
6. В `logic.ts` чистая функция `runOf(lesson, state, now): Run` (prediction — первый predict урока: выбранный вариант и его `correct`). В `[id].tsx`, там где урок становится `finished`, вызови `saveRun(lesson.id, runOf(...))`.
7. Тесты в `logic.test.ts`: `recordWrong`, `tick` с паузой больше 3 мин, `runOf`.

**Готово, когда:** `npm run check`; пройди урок в вебе до конца, в `localStorage` есть `runs/v1/<id>` с `wrong` и `ms > 0`.

**Коммит:** `Record each lesson run: wrong picks, active time, prediction; mark the right prediction in every lesson`

### A3 Главы: поле в уроке, сегменты полосы, плашка главы

**Цель.** Урок делится на 3 главы. Полоса прогресса — 3 сегмента. При входе в главу под полосой на 1.4 с выезжает плашка «2 · Build the idea». План: V2_PLAN 4.2.

**Читать:** `src/content/types.ts` (Lesson), `src/session/logic.ts` (progressOf), `src/lesson/LessonPlayer.tsx`, `src/content/rules.test.ts`, `src/content/normal-reaction.ts` (как пример).

**Шаги.**
1. `types.ts`, `Lesson`: `chapters?: { title: string; from: string }[]` — `from` = id первого экрана главы; у первой главы `from` = id intro. Позже (D13) поле станет обязательным.
2. `logic.ts`: `chapterOf(lesson, index): number | null` (номер главы 0..n-1 для экрана истории, `null` для Skill check), и `progressOf` возвращает ещё `chapters: { share: number }[]` — заполненность каждой главы 0..1. Тесты.
3. `LessonPlayer`: если у урока есть `chapters`, вместо одной полосы — n сегментов с промежутком 4 pt (каждый — свой `ProgressFill`). Без `chapters` — как сейчас.
4. Компонент `ChapterBanner` в `src/lesson/ChapterBanner.tsx`: плашка под верхней строкой, по центру, `paper`-фон, губа 4 pt цвета уровня, текст моноширинным 12 caps `2 · BUILD THE IDEA`. Въезжает сверху за `motion.base`, стоит 1.4 с, уезжает вверх. Показывается, когда `chapterOf` изменился при переходе вперёд (не при возобновлении и не для главы 1). Reduced motion: появляется и исчезает без движения. `accessibilityLiveRegion="polite"`.
5. Проверка `rules.test.ts`: если `chapters` есть — их 3, `from` указывают на существующие экраны по порядку, первая начинается с intro, название ≤ 24 символов.
6. Добавь `chapters` в `normal-reaction.ts` (названия: `The puzzle`, `Weight and the push`, `Back to the lift`) — образец.

**Готово, когда:** в уроке «The push from the floor» видны 3 сегмента, при переходе во вторую главу выезжает плашка (скриншот в момент показа: подмени таймер, если надо).

**Коммит:** `Lesson chapters: segmented progress bar and a chapter banner`

### A4 Текстовые экраны: фигура рядом, абзацы по одному, карточка-определение

**Цель.** Текстовый экран больше не пустой: показывает фигуру предыдущего экрана в компактном виде, абзацы появляются по одному, определение выглядит как выноска чертежа. План: V2_PLAN 2.3.

**Читать:** `src/lesson/screens/Simple.tsx` (TextView), `src/lesson/Frame.tsx`, `src/lesson/text.tsx` (TermCard), `src/lesson/LessonPlayer.tsx`, `src/figures/Sheet.tsx` (пропсы и MAX_H), `src/session/logic.ts` (figOf).

**Шаги.**
1. `logic.ts`: `carriedFig(lesson, index): Fig | undefined` — для `text` без `fig` возвращает фигуру ближайшего предыдущего экрана истории с фигурой, в её конечном состоянии после Check (используй ту же логику раскрытия, что `revealed()` в `QuestionView.tsx`: вынеси её в `src/session/reveal.ts` как чистую функцию и переиспользуй в обоих местах). Тест.
2. `Sheet`: новый проп `compact?: boolean` — максимальная высота 60 % от `MAX_H`, без кнопки паузы, без анимации и рисования (`playing=false`, draw-in выключен), без касаний.
3. `TextView`: если у экрана нет `fig`, а `carriedFig` есть — сверху компактный лист (номер FIG тот же, что у исходного экрана). Лист не «рисует себя» и не съезжает (он уже был виден).
4. Абзацы по одному: если `body.length === 2` — сначала виден первый абзац (и карточка, если она относится к первому… проще: карточка всегда после последнего абзаца), кнопка `Continue`; первое нажатие показывает второй абзац (`Rise`), второе — переход дальше. `feedback.step()` на раскрытии.
5. `TermCard` → выноска: фон `paper`, слева полоса 3 pt цвета `palette.draw`, сверху метка моноширинным 11 caps `DEFINITION`, `term` — Space Grotesk 700 20, `text` — Plex Sans 15. Если в `text` есть знак `=` и формула ≤ 24 символов в начале (до запятой) — формулу вынеси строкой Space Grotesk 22 над словами (функция `splitFormula(text)` в `src/lesson/text.tsx`, с тестом).

**Готово, когда:** экран «Work done is energy transferred…» (урок `work`, index 7) показывает лист сверху и сначала один абзац (скриншоты до и после первого нажатия), обе темы.

**Коммит:** `Text screens carry the last figure, reveal paragraphs one by one, definition as a drawing callout`

### A5 Обложка урока

**Цель.** Перед первым экраном — обложка урока. План: V2_PLAN 4.1.

**Читать:** `src/app/lesson/[id].tsx`, `src/content/course.ts`, `src/art/lessonIcons.ts` (как получить плитку: см. `src/figures/LessonIcon.tsx`), `src/theme/levelColor.ts`, `src/ui/parts.tsx`, `src/lesson/Frame.tsx`.

**Шаги.**
1. Новый `src/lesson/LessonCover.tsx`. Сверху × (закрыть). Плитка урока 72 pt (как над шайбой на карте). Метка `LEVEL 2 · FORCES` (моноширинный, цвет уровня, текстовый вариант). Название — Space Grotesk 700 30. Строка `~11 min · 3 chapters` (`muted`). Список глав: номер в кружке цвета уровня + название (если у урока нет `chapters` — блок не показывать). Заголовок `You'll be able to` и пункты `youCanNow` (точка цвета уровня). Внизу — одна главная кнопка цвета уровня: `Start`, или `Continue · chapter 2` при сохранённом прогрессе `index > 0`.
2. Появление: блоки поднимаются по очереди (`Rise`, задержка `motion.stagger`). Без лишних эффектов.
3. `[id].tsx`: показывать обложку, если прогресс не `finished` и пользователь ещё не нажал Start в этом заходе (локальное состояние `started`). Кнопка ведёт в плеер. Если `index > 0`, кнопка — Continue.
4. Доступность: заголовок — `accessibilityRole="header"`.

**Готово, когда:** вход в урок показывает обложку (скриншот, обе темы), Start открывает первый экран, повторный вход в начатый урок — кнопка `Continue · chapter N`.

**Коммит:** `Lesson cover: level, title, time, chapters, what you will be able to do`

---

## Этап B. Новые задания

Общее для B1–B8:
- Новый `kind` добавляется в `src/content/types.ts` (тип + в union `Screen`; если оценивается — в `Question` и `isQuestion`).
- Экран — `src/lesson/screens/<Name>View.tsx`, оформлен как `QuestionView`: `Frame` (фигура сверху, если есть), `Prompt`, `Instruction` (называет жест: «Tap…»), блок задания, кнопка Check, `VerdictSheet` с Why?, Try again (история: 2 попытки, Skill check: 1), исход через `outcomeOf`, `onOutcome`, `onWrong` (A2) — с id неверного элемента.
- Подключение в `LessonPlayer` рядом с `QuestionView`.
- Каждый новый вид появляется на скрытой странице-образце `src/app/gallery/steps.tsx` (создаётся в B1): заголовок вида и живой экран с образцовым контентом из `src/content/samples.ts` (образцы — по уроку `work`, числа из `src/physics/work.ts`).
- Карточки, чипы, строки — минимум 44 pt по высоте, выбранное — синяя рамка `select` + фон `selectBg` (как `OptionCard`), верное/неверное — только после Check, со значком и словом.
- Тест `src/content/rules.test.ts` получает проверку структуры нового вида (поля, лимиты длины).

### B1 Задание build «Собери решение» — сложная

**Цель.** Ученик выбирает формулу (по желанию) и ставит значения в клетки; приложение считает и показывает ответ. План: V2_PLAN 2.1.

**Читать:** `src/lesson/screens/QuestionView.tsx`, `src/ui/parts.tsx`, `src/ui/motion.tsx`, `src/physics/format.ts`, `src/content/types.ts`, `src/lesson/LessonPlayer.tsx`. Для идей (не копировать): старый автомат `git show 5c4b9cd^:src/session/build.ts`.

**Тип.**
```ts
/** A value to place into the equation. Wrong chips carry the mistake they stand for. */
export type Chip = { id: string; label: string; hint?: string };
/**
 * Build the solution: (optionally) pick the equation, then fill its boxes with chips; the app does the arithmetic.
 * `equation` is written with boxes in braces: "W = {F} × {s} × cos {θ}". Each box name is a key of `boxes`.
 */
export type BuildScreen = Base & {
  kind: 'build';
  prompt: string;
  fig?: Fig;
  choose?: { prompt: string; options: Option[] };   // equations as text; one correct; wrong ones have a hint
  equation: string;
  boxes: Record<string, string>;                      // box name → id of the right chip
  chips: Chip[];                                      // the right values, plus 1–3 distractors (wrong sign, wrong unit, wrong quantity)
  result: { symbol: string; value: number; unit: string; sf?: number }; // value from src/physics; shown with sig(value, sf ?? 3)
  why: string;
};
```

**Шаги.**
1. Чистая логика `src/session/build.ts` (с тестом): `parseEquation(eq)` → массив кусков `{ text } | { box: name }`; `fillBox(state, box, chipId)`; `checkBuild(screen, filled)` → `{ ok: boolean; wrongBoxes: string[] }`; `firstHint(screen, filled)` → подсказка первого неверного чипа.
2. `BuildView.tsx`, стадии:
   - `choose` (если есть) — как обычный выбор с перемешиванием (A1), Check; неверно — подсказка, ещё попытка (Skill check: одна; при ошибке верная формула ставится сама, исход уже `revealed`);
   - `fill` — формула крупно (Space Grotesk 700 24), клетки — пунктирные рамки 44×44 pt минимум, растут по содержимому. Под формулой — чипы (как `OptionCard compact`, в ряд с переносом). Жест: нажать чип → он встаёт в первую пустую клетку (или в выбранную, если клетку нажали раньше; выбранная клетка — синяя рамка). Нажатие на заполненную клетку возвращает чип. Check активна, когда все клетки заняты;
   - Check: неверные клетки трясутся (`Shake`) и красятся `bad`, подсказка первого неверного чипа в шторке, Try again очищает только неверные клетки;
   - верно: строка результата `W = 600 J` появляется под формулой, число досчитывает от 0 до значения за `motion.celebrate` (reduced motion — сразу), Space Grotesk 700 28. Затем обычная зелёная шторка с Why?.
3. Число в результате — `sig(result.value, result.sf ?? 3)` + `' ' + unit`, единицы не разрываются (`keepUnitsIn` уже применяется в `lessons.ts` к текстам; для `result.unit` используй неразрывный пробел).
4. Подключи в `LessonPlayer`, добавь в `Question`/`isQuestion`.
5. `rules.test.ts`: каждое имя клетки из `equation` есть в `boxes`, каждый id из `boxes` есть в `chips`, у каждого неверного чипа есть `hint`, чипов 3–7.
6. Создай `src/app/gallery/steps.tsx` и `src/content/samples.ts`; образец: работа Омара, `W = {F} × {s} × cos {θ}`, чипы `40 N`, `30 m`, `60°`, `147 N` (вес чемодана — неверно: «That is Nadia's suitcase's weight…»), `30°`; `result.value = workDone(40, 30, 60)` (имя функции смотри в `src/physics/work.ts`).

**Готово, когда:** на `/gallery/steps` образец проходится: неверный чип трясётся с подсказкой, верный ответ досчитывается до `600 J` (скриншоты), тесты зелёные.

**Коммит:** `New step: build the solution — pick the equation, place the values, the app does the arithmetic`

### B2 Задание order «По порядку»

**Тип.**
```ts
export type OrderScreen = Base & {
  kind: 'order';
  prompt: string;
  fig?: Fig;
  steps: { id: string; text: string }[]; // in the RIGHT order; shown shuffled (A1, key = screen id)
  hint: string;                          // shown after a wrong try
  why: string;
};
```
**Читать:** как в B1 плюс `src/session/shuffle.ts`.

**Шаги.**
1. Сверху — пустые пронумерованные строки (1…n, пунктир), под ними — карточки утверждений в перемешанном порядке. Нажатие карточки ставит её в первую пустую строку (карточка «уезжает» вверх за `motion.base`), нажатие на занятую строку возвращает её вниз.
2. Check — когда все строки заняты. Неверно: первая неверная позиция и все после неё красятся `bad` и трясутся, шторка с `hint`; Try again возвращает вниз только неверные. Верно — строки зеленеют сверху вниз по одной (`motion.stagger`).
3. Тексты ≤ 90 символов, 3–5 шагов (тест).
4. Образец в `samples.ts`: «Why does Nadia do no work on the suitcase?» — 4 шага (сила вверх → движение по горизонтали → угол 90° → cos 90° = 0, работа ноль).

**Готово, когда:** образец на `/gallery/steps` проходится, скриншоты неверного и верного состояния.

**Коммит:** `New step: order — tap statements into the right sequence`

### B3 Задание spotError «Найди ошибку»

**Тип.**
```ts
export type SpotErrorScreen = Base & {
  kind: 'spotError';
  prompt: string;            // "Sam's working has one mistake. Tap the wrong line."
  fig?: Fig;
  lines: { id: string; text: string; wrong?: true; fix?: string; hint?: string }[]; // exactly one wrong (with fix); right lines picked by mistake have a hint
  why: string;
};
```
**Шаги.**
1. Решение — как лист тетради: строки с номерами слева (моноширинный `faint`), текст Plex Sans 16, математика как есть. Каждая строка — нажимаемая (radio), выбранная — синяя рамка.
2. Check. Верно: строка зачёркивается `bad`, под ней въезжает `fix` зелёным со значком ✓ и словом «Fixed». Неверно: шторка с `hint` выбранной строки.
3. Тест: ровно одна `wrong`, у неё `fix`; 3–5 строк, ≤ 70 символов.
4. Образец: работа на пандусе, ошибка — «W = F × h» вместо пути вдоль пандуса.

**Коммит:** `New step: spot the error in a worked solution`

### B4 Задание sort «Разложи»

**Тип.**
```ts
export type SortScreen = Base & {
  kind: 'sort';
  prompt: string;
  fig?: Fig;
  bins: { id: string; label: string }[];                       // 2–3
  items: { id: string; label: string; bin: string; hint?: string }[]; // 4–6
  why: string;
};
```
**Шаги.**
1. Корзины — колонки во всю ширину (2 или 3), заголовок моноширинным caps, пунктирная рамка, высота растёт. Чипы — внизу, перемешаны (A1).
2. Жест: нажать чип (выделяется синим) → нажать корзину. Нажатие на чип в корзине возвращает его вниз. Check — когда все разложены.
3. Неверно: неверные чипы трясутся и возвращаются вниз, шторка с `hint` первого неверного. Верно — корзины по очереди отмечаются ✓.
4. Тест: каждый `bin` элемента существует; в каждой корзине ≥ 1 элемент.
5. Образец: «Does the force do work on the suitcase?» — Does work / No work: «Omar's pull», «Nadia's upward push», «friction on the wheels», «the suitcase's weight on the flat platform».

**Коммит:** `New step: sort items into bins`

### B5 Задание estimate «На глаз»

**Тип.**
```ts
export type EstimateScreen = Base & {
  kind: 'estimate';
  prompt: string;
  fig: Fig;           // shows the set-up only: it must not give the answer away
  after: Fig;         // the same figure once checked (for example with play: true): the truth plays
  scale: { min: number; max: number; step: number; tick: number; unit: string; symbol: string; dp: number };
  answer: number;     // from src/physics
  tolerance: number;  // in the scale's units: within it counts as right
  why: string;
};
```
**Читать:** `src/ui/Slider.tsx`, `src/lesson/screens/ExploreView.tsx`, `src/figures/Sheet.tsx`.

**Шаги.**
1. Под фигурой — линейка `Slider` (та же, что в explore) с меткой-флажком; пузырь `x = 12.5 m`. Фигура **не** реагирует на ползунок (`live` не передавать).
2. Check: фигура меняется на `after`; на линейке падает вторая метка — правда (цвет `ok`), между метками — полоса допуска. Попал → «Correct!» и шторка `Close: you said 13 m, it is 12.0 m`; не попал → одна попытка, сразу показ правды, исход `revealed` в Skill check / `assisted` если промах меньше двух допусков в истории, иначе `revealed`. (Запиши правило функцией `estimateOutcome(guess, answer, tol, phase)` в `src/session/logic.ts` с тестом.)
3. Тест: `answer` внутри шкалы, `tolerance > 0` и ≤ 15 % шкалы.
4. Образец: «How much work does it take to push the box up the ramp?» — шкала 0–1000 J, ответ из модели (`src/physics/work.ts`), допуск 50 J, фигура `ramp`.

**Коммит:** `New step: estimate on a scale, then the figure plays the truth`

### B6 Задание worked «Разбор»

**Тип.**
```ts
export type WorkedScreen = Base & {
  kind: 'worked';
  title: string;                      // "Worked example"
  fig?: Fig;
  steps: { text: string; math?: string }[]; // 3–5, revealed one by one
  last?: { prompt: string; options: Option[] }; // optional: choose the final line yourself (not counted)
};
```
**Шаги.**
1. Шаги появляются по нажатию на главную кнопку `Next step` (каждый — `Rise`), уже открытые шаги остаются; `math` — Space Grotesk 600 20 отдельной строкой. После последнего шага кнопка — `Continue`.
2. Если есть `last` — после шагов вопрос с вариантами (как predict: без оценки, после выбора показывается верный, кнопка `Continue`).
3. Не оценивается (не входит в `Question`).
4. Тест: 3–5 шагов, текст ≤ 120.
5. Образец: работа на пандусе в три шага.

**Коммит:** `New step: worked example revealed step by step`

### B7 Задание graphPick «Какой график»

**Тип.**
```ts
export type GraphPickScreen = Base & {
  kind: 'graphPick';
  prompt: string;
  scene?: Fig;                                     // optional figure of the motion, shown small above
  graphs: { id: 'A' | 'B' | 'C'; fig: Fig; correct?: true; hint?: string }[]; // 3 graph figures (graph, throwVt, brakeVt, material…)
  why: string;
};
```
**Шаги.**
1. Один график на весь лист (правило: никогда несколько маленьких). Над листом — сегменты `A · B · C` (радиокнопки 44 pt), листание и свайпом влево/вправо по листу (Gesture Handler `Pan`, порог 40 pt). Выбранный сегмент = выбранный ответ.
2. Check: как в `QuestionView`; после ответа лист показывает верный график, у неверного — подсказка.
3. Если есть `scene` — над сегментами компактный лист (A4, `compact`).
4. Тест: ровно 3 графика, один `correct`, у неверных `hint`.
5. Образец (сюжет из урока `motion-graphs`): «Which v–t graph matches car B?» — три фигуры `graph`, числа из `Trip` (`src/physics/kinematics.ts`).

**Коммит:** `New step: pick the matching graph, one full-width graph at a time`

### B8 Задание examCard «Экзаменационная задача» — сложная

**Тип.**
```ts
export type ExamPart =
  | { id: string; command: Command; text: string; marks: number; kind: 'choice'; options: Option[]; why: string }
  | { id: string; command: Command; text: string; marks: number; kind: 'build'; build: Omit<BuildScreen, 'id' | 'kind' | 'prompt' | 'fig' | 'why'>; why: string }
  | { id: string; command: Command; text: string; marks: number; kind: 'order'; steps: { id: string; text: string }[]; why: string };
export type Command = 'State' | 'Calculate' | 'Explain' | 'Show that' | 'Describe' | 'Determine';
export type ExamCardScreen = Base & { kind: 'examCard'; context: string; fig?: Fig; parts: ExamPart[] }; // 2–3 parts
```
**Шаги.**
1. Вид «листа экзамена»: сверху метка `EXAM-STYLE` моноширинным, `context` (Plex Sans 16), фигура. Части идут одна под другой: `(a)` жирным, **command word жирным**, текст, справа `[2]`. Видна только текущая часть и уже решённые (свёрнуты в одну строку с баллами `2/2`).
2. Каждая часть переиспользует логику B1/B2/choice как компонент (вынеси «тело» из `BuildView`, `OrderView`, `QuestionView` в переиспользуемые компоненты без кнопок — если ещё не вынесено). Одна попытка на часть. Ошибка: часть показывает верный ответ, баллы 0 из `marks` (для build — `marks - число неверных клеток`, не меньше 0), дальше следующая часть.
3. Исходы: каждая часть — отдельный вопрос с id `${screen.id}.${part.id}` в `outcomes` (в `progressOf` экзаменационная задача — одна точка Skill check, она заполняется, когда решены все части). Баллы `marks` сохраняются в прохождении (`Run` получает `marks: Record<string, [got: number, of: number]>`).
4. В Skill check examCard только последним (тест). В истории — нельзя.
5. Образец: Омар (a) State why the weight does no work [1] (choice), (b) Calculate the work done by the pull [2] (build).

**Готово, когда:** образец проходится с одной ошибкой в (b), видно `1/2`, затем дальше.

**Коммит:** `New step: exam-style card with parts, command words and marks`

### B9 Правила урока v3 в тесте и в LESSON_FRAMEWORK; страница-образец — стоп: владелец

**Цель.** Правила из V2_PLAN 2.2 проверяются тестом; документ уроков обновлён; владелец видит все новые виды на одной странице.

**Читать:** `src/content/rules.test.ts`, `docs/LESSON_FRAMEWORK.md` (только раздел 1b и 5), `docs/V2_PLAN.md` раздел 2.

**Шаги.**
1. В `rules.test.ts` — набор `REVISED = new Set<string>([])` (id уроков, переделанных по v3). Для уроков из набора — все проверки V2_PLAN 2.2 (5 разных интерактивных видов, choice ≤ 35 %, не больше 2 одинаковых подряд, ≤ 3 текста без фигуры, состав Skill check, ≤ 1 choice с одними числами, `unsure` в predict, ровно 3 главы, имена героев не повторяются с другими уроками из набора — список имён в уроке: новое поле `cast: string[]`).
2. Тест сам себя проверяет: создай в тесте маленький синтетический урок, нарушающий каждое правило, и убедись, что проверка его ловит.
3. `LESSON_FRAMEWORK.md`: новый раздел `1c. Lesson format v3 (22 Nov 2026)` — правила из V2_PLAN 2.2 по-английски, таблица новых видов (из V2_PLAN 2.1), строка «supersedes 1b where it conflicts». В разделе 5 отметь, что `build` теперь в `src/session/build.ts` (новый), `numeric` отменён решением владельца.
4. `/gallery/steps` — все 8 видов по порядку, сверху оглавление-ссылки.

**Готово, когда:** скриншоты каждого вида на `/gallery/steps` показаны владельцу. **Стоп: дождаться одобрения.**

**Коммит:** `Lesson format v3: rules checked by tests, framework updated, gallery of all step kinds`

---

## Этап C. Фигуры 2.0

### C1 Общий набор деталей фигур (без изменений вида)

**Цель.** Убрать дубли, чтобы стиль менялся в одном месте. Внешний вид не меняется (сравни скриншоты до/после).

**Читать:** `src/figures/draw.tsx`, `src/figures/turning.tsx`, `src/figures/RoadFigure.tsx` (Tag, Car, Ruler, Dim, VelocityArrow), `src/figures/ThrowFigure.tsx` (Tag, Ruler, Ball), `src/figures/TankFigure.tsx` (Ruler), `src/figures/BodiesFigure.tsx` и `TubeFigure.tsx` (Ball), `src/figures/ResolveFigure.tsx` и `WallFigure.tsx` (HollowArrow, Trolley), `src/figures/SledgeFigure.tsx` (TapBoxes, Mitten), `src/figures/BeamFigure.tsx` (dim), `src/figures/VtFigure.tsx` и `GraphFigure.tsx` (оси).

**Шаги.**
1. Папка `src/figures/kit/`: `stage.ts` (общий `stage(clock, from, to)` вместо 37 локальных копий — найди `grep -n "const stage\|function stage\|const late" src/figures`), `Tag.tsx`, `Ruler.tsx`, `Ball.tsx`, `HollowArrow.tsx` (одна сигнатура, покрывающая оба случая), `Dim.tsx` (горизонтальный/вертикальный/под углом — объедини `Dim`, `AlignedDim`, локальный `dim`), `Axes.tsx` (оси графика: стрелки, деления, подписи), `TapBoxes.tsx`, `Car.tsx`, `Trolley.tsx`, `index.ts`.
2. Переведи фигуры на набор по одной, после каждой — `npm run typecheck`.
3. До начала сделай скриншоты 6 экранов (по одному из каждого уровня), после — те же экраны; должны совпасть.

**Готово, когда:** `grep` не находит локальных копий; скриншоты совпадают.

**Коммит:** `Figure kit: shared Tag, Ruler, Ball, arrows, dimensions, axes, tap boxes, stage helper`

### C2 Пилот стиля: материалы, толщины, подписи — сложная, стоп: владелец

**Цель.** Новый вид на 4 фигурах и страница «было / стало». План: V2_PLAN 3.1.

**Читать:** `src/theme/tokens.ts`, `src/theme/ThemeContext.tsx`, `src/theme/tokens.test.ts`, `src/figures/people.tsx`, `src/figures/draw.tsx`, `src/figures/Sheet.tsx`, `src/figures/LiftFigure.tsx`, `src/figures/CrateFigure.tsx`, `src/figures/kit/Trolley.tsx`, `src/figures/kit/Car.tsx`, `src/app/gallery.tsx`.

**Шаги.**
1. `tokens.ts` — новые объекты `material` и `darkMaterial` (одинаковые ключи):
   | ключ | светлая | тёмная |
   |---|---|---|
   | wood / woodSide | `#D9A86C` / `#B98648` | `#9C7445` / `#7A5833` |
   | metal / metalSide | `#B3BDC9` / `#8D99A8` | `#6B7685` / `#525C69` |
   | rubber | `#2F343C` | `#0E1115` |
   | water / waterLine | `#CFE8EF` / `#8CC7D6` | `#1D3D47` / `#3E7A8A` |
   | plastic / plasticSide | `#EADCC6` / `#CDB998` | `#5A5243` / `#463F33` |
   | floor | `#E6E1D8` | `#262C34` |
   | skinA / skinB | `#EBC8AA` / `#A8754F` | `#C9A285` / `#8A5F40` |
   | hairA / hairB | `#3B4049` / `#6B4A2E` | `#14171C` / `#4A321E` |
   | clothA / clothB | `#8C6A9F` / `#5E8C87` | `#735885` / `#4C736F` |
   | trousers | `#4A5468` | `#2E3544` |
   | carA / carB | `#8C6A9F` / `#CDB48E` | `#735885` / `#9C8868` |
   | ball | `#F2EEE6` | `#D9D4CA` |
   Добавь `material` в `useTheme()` (как `palette`).
2. Тест в `tokens.test.ts`: для каждого цвета `material` расстояние оттенка (HSL hue) от `force`, `ok`, `bad`, `reward` больше 25° **или** насыщенность < 0.35; контраст обводки `palette.draw` к заливке ≥ 1.5 (видно край).
3. `stroke` в `tokens.ts`: `{ thin: 1.2, body: 1.8, force: 2.6 }`. В четырёх пилотных фигурах замени числа толщин на токены.
4. Подписи: `Sheet` кладёт масштаб листа (ширина на экране ÷ ширина viewBox) в контекст `SheetScale`; `MonoLabel` и `ForceLetter` берут `fontSize = max(size, 10.5 / scale)` для моно и `max(size, 13 / scale)` для букв сил.
5. `people.tsx`: `Person` получает проп `who: 'A' | 'B'` (кожа, волосы, одежда из `material`), брюки `trousers`. Обводка `stroke.body`.
6. Пилот: `LiftFigure` (человек, весы — `metal`, кабина — `plastic`), `CrateFigure` (ящик `wood`/`woodSide`, пол `floor`, верёвка `rubber`), `Trolley` (`plastic`, колёса `rubber`), `Car` (`carA`/`carB`, колёса `rubber`). Силы — без изменений (`force`).
7. Страница `src/app/gallery/style.tsx`: по 4 фигуры «было» (старые цвета: временно оставь флаг `classic` в контексте темы, только для этой страницы) и «стало», светлая и тёмная.

**Готово, когда:** скриншоты `/gallery/style` (обе темы) и одного экрана урока «The push from the floor» показаны владельцу. **Стоп: дождаться одобрения;** правки владельца — в этой же задаче.

**Коммит:** `Figure style 2.0 pilot: flat material fills, three stroke weights, readable labels`

### C3–C8 Стиль по уровням

Одна задача — один уровень. Фигуры уровня (по урокам из `src/content/course.ts`; какие фигуры в каком уроке — `grep -n "kind: '" src/content/<file>.ts`):
- **C3 Motion:** Track, Graph, Equations, Road, Chase, BrakeGraph, Throw, ThrowGraphs, Sledge (+Hill), Resolve, Vectors, Bench, Kick.
- **C4 Forces:** Crate (остаток), Ladder, Particle, Pulley, Lift/LiftPair/Scales/Pairs (остаток), Vt, Fall.
- **C5 Momentum and moments:** Wall, Bodies, Collide, Spanner, Pole, Bar, Beam, Broom.
- **C6 Energy:** Platform, Ramp, Energy (Kinetic, Height), Cliff, Slide, Ride, Winch.
- **C7 Fluids:** Tank, Dunk, Tube, Flow.
- **C8 Materials:** Spring, Wire, Material, Launcher.

**Читать:** файлы фигур уровня, `src/figures/kit/*`, `src/figures/people.tsx`, строки `material` и `stroke` в `src/theme/tokens.ts`, V2_PLAN 3.1.

**Шаги (для каждой фигуры).**
1. Серые заливки тел (`drawFill`, `drawFillDark`) → подходящий материал: дерево, металл, пластик, вода, пол. Люди — `Person who="A"` для первого героя, `"B"` для второго (по порядку появления в уроке). Две машины / два тела — `carA`/`carB` или `clothA`/`clothB`.
2. Толщины — только `stroke.*`. Подписи — через `MonoLabel` (масштаб уже учтён).
3. Ничего не двигать и не менять геометрию; силы не трогать. Графики: линии данных — `palette.draw`, заливки площадей — без изменений.
4. Проверь каждый экран урока с этой фигурой в обеих темах (хотя бы по одному скриншоту на фигуру).

**Коммиты:** `Figure style 2.0: Motion figures` (и так далее по уровням).

### C9 Движение для статичных фигур

**Цель.** Фигуры, которые учат движением, двигаются по модели. План: V2_PLAN 3.2.

**Читать:** `src/figures/anim.ts`, `src/figures/SpannerFigure.tsx`, `BarFigure.tsx`, `BroomFigure.tsx`, `VectorsFigure.tsx`, `ResolveFigure.tsx`, `LauncherFigure.tsx`, `MaterialFigure.tsx`, `src/physics/moments.ts`, `src/physics/elastic.ts`, соответствующие типы в `src/content/types.ts`.

**Шаги.** Для каждой — новое необязательное поле `play?: true | 'afterCheck'` в типе фигуры (как у `ThrowFig`), кнопка паузы появляется в `Sheet` (обнови условие).
1. **Spanner:** при `play` ключ с гайкой поворачивается на 30° за 1.2 с с угловой скоростью ∝ моменту (у большего момента быстрее), пауза 0.6 с, возврат — цикл (`useLoopTime`).
2. **Bar:** при `play` и ненулевом результирующем моменте рычаг наклоняется к стороне с большим моментом с угловым ускорением ∝ моменту (простая модель I·α = M, упор в землю), держится, возвращается.
3. **Broom:** после Check — две части висят на двух динамометрах, стрелки показаний вырастают до 6.0 N и 2.0 N.
4. **Vectors / Resolve:** при `play` — сначала первый вектор рисуется, потом второй от его головы, потом равнодействующая; у Resolve — составляющие «выезжают» из конца вектора по осям.
5. **Launcher:** при `play` — пружина разжимается за 0.15 с, шарик вылетает со скоростью из `src/physics/elastic.ts` (масштаб времени ×0.25, сказано на листе `¼ speed`).
6. **Material (loop):** при `play` — точка нагрузки идёт по кривой до заданной деформации и обратно по линии разгрузки, след остаётся.
7. Включи `play` на подходящих экранах соответствующих уроков (обычно `'afterCheck'`, чтобы не раскрыть ответ).

**Коммит:** `Static figures move by the model: spanner, lever, broom, vectors, launcher, material loop`

### C10 Кнопка повтора на листе

**Читать:** `src/figures/Sheet.tsx`, `src/figures/anim.ts`, `src/art/uiIcons.ts`.

**Шаги.** Рядом с паузой — кнопка 44 pt с иконкой `replay` (`accessibilityLabel="Replay"`), у фигур с клипом (`useLoopTime`, `useOnceTime`). Нажатие сбрасывает время клипа в 0 и запускает. Реализуй через ключ-счётчик в контексте `SheetReplay`, который читают хуки времени. Для бесконечных циклов без начала (Flow) кнопки нет.

**Коммит:** `Replay button on moving figures`

### C11 Скорость: циклы стоят, когда не видны — сложная

**Читать:** `src/figures/anim.ts`, `src/figures/FlowFigure.tsx`, `src/figures/CrateFigure.tsx`, `src/lesson/Frame.tsx`, `src/ui/parts.tsx` (VerdictSheet).

**Шаги.**
1. Контекст `SheetVisible` (true/false): `Frame` ставит false, когда лист прокручен за верх экрана больше чем на 70 % высоты, `Sheet compact` — всегда false для анимации, приложение в фоне (`AppState`) — false. Хуки `useLoopTime`, `useWave`, `useTween` не тикают при false.
2. Шесть фигур со своим `requestAnimationFrame` (Energy, Ride, Tube, Winch, Crate, Spring) переведи на хуки из `anim.ts`.
3. `Flow`: статичные линии тока — `useMemo`; каждый кадр пересчитываются только смещения штрихов.
4. `Crate`: девять `useTween` → один общий `useTween` по прогрессу 0..1 с интерполяцией всех стрелок.
5. Проверь на телефоне (Expo Go) уроки `viscosity` (Flow) и `free-body` (Crate): плавно. Если телефона нет — попроси владельца и запиши результат в Статус.

**Коммит:** `Figures pause when hidden; fewer animation loops`

---

## Этап D. Уроки 2.0

Общее для D1–D13 (читать в каждой задаче):
- `docs/V2_PLAN.md` раздел 2; `docs/LESSON_FRAMEWORK.md` раздел 1c (из B9) и банк ошибок нужного уровня (12, 12b–12f); спек урока `docs/lessons/<file>.md`; контент `src/content/<file>.ts` и его тест; `src/content/samples.ts` (как писать новые виды); физика урока `src/physics/<module>.ts`.
- **Загадка, её ответ и recap не меняются.** Меняются 3–5 экранов истории и Skill check.
- Каждое новое число — из функции `src/physics/` (если функции нет — добавь с тестом). Тест урока сверяет числа новых экранов (`result.value`, `answer`, значения чипов).
- Данные в новых заданиях — «красивые» (V2_PLAN 2.2).
- Добавь `chapters` (3 главы, названия ≤ 24 символов), `cast` (имена героев), «I'm not sure» в predict (если нет), возврат к загадке начинается одинаково: `Back to <short name of the puzzle>.`
- Добавь id урока в `REVISED` в `rules.test.ts` — правила v3 должны пройти.
- В спеке урока допиши раздел `## v3 changes (22 Nov)` — что заменено на что.
- Проверка: весь урок пройден в вебе 375 (каждый новый экран — скриншот), обе темы на двух экранах.
- Коммит: `Lesson <title>: format v3 — <что добавлено коротко>`.

Ниже по каждому уроку — **что заменить**. «Заменить экран X» значит: найти экран по описанию, удалить или переписать его, сохраняя длину истории 12–16.

### D1 Пилотный урок «Which way is positive?» (`vectors-signs`) — стоп: владелец
- **sort** вместо текстового экрана про скаляры и векторы: Scalar / Vector — distance, displacement, speed, velocity, time, acceleration.
- **estimate** перед забегом: «Drag to where runner A finishes» — линейка −400…+400 m, ответ −200 m (из `tripDisplacement`), допуск 20 m, `after` = дорожка с `play: true`.
- **build** вместо выбора числа средней скорости: `v = {s} ÷ {t}`, чипы `−200 m`, `200 s`, `800 m` (путь — неверно: «That is the distance A ran, not the displacement»), `+200 m` (знак — неверно), результат −1.0 m s⁻¹.
- **spotError** в главе 2: решение, где средняя скорость A посчитана по пути (800 ÷ 200 = 4.0).
- **Skill check:** choice (знак ускорения при торможении на запад, варианты по смыслу), build (турист 3 + 4 km: `R = √({a}² + {b}²)`), sort или graphPick (на выбор по смыслу урока), **examCard**: (a) State the difference between distance and displacement [1] (choice), (b) Calculate the average velocity of … [2] (build).
- Удалить 2 текстовых экрана и 1–2 выбора числа, чтобы история осталась 14–16.
- **Стоп:** владелец проходит урок (в вебе или на телефоне). Его правки к формату — в этой же задаче, затем перенести в правила B9/V2_PLAN, если они общие.

### D2 «Reading motion graphs» (`motion-graphs`) и «Picking the equation» (`suvat`)
- motion-graphs: **graphPick** (какой v–t график у машины B), **estimate** (когда машины поравняются — время на линейке, ответ 8.0 s), **build** (площадь трапеции `s = ½ × ({u} + {v}) × {t}`), **order** (почему пересечение линий не встреча: 4 шага). Skill check: graphPick, build, choice (уклон vs площадь, без счёта), examCard (a) Describe… [1] choice, (b) Calculate displacement [2] build.
- suvat: **build с choose** — главный экран урока: выбрать одно из 4 уравнений (`choose`), заполнить; **spotError** (отрицательный корень оставлен / забыт путь за время реакции); **estimate** (где остановится машина на удвоенной скорости — до раскрытия загадки допуск 3 m). Skill check: build (choose + fill), spotError, choice, examCard (a) thinking distance [1] build, (b) braking distance [2] build.

### D3 «Up, stop, down» (`up-stop-down`) и «Splitting a vector» (`resolving`)
- up-stop-down: **estimate** (максимальная высота мяча), **build** (`v² = u² + 2as` для высоты, чипы со знаками a = −9.81 / +9.81), **order** (мяч в верхней точке: v = 0 → a всё ещё g вниз → … ), **graphPick** (CP1: h от t² — прямая). Skill check: examCard CP1 (a) State what the gradient represents [1] choice, (b) Determine g from the gradient [2] build; build; spotError (знак g); choice.
- resolving: **build** (составляющие `{F} × cos {θ}`), **sort** (какая составляющая тянет вперёд / поднимает), **estimate** (при каком угле вперёд 50 N — ответ 60°), **spotError** (sin вместо cos). Skill check: build, spotError, choice, examCard (склон: составляющие веса).

### D4 «Two motions at once» (`projectiles`) и «Drawing the forces» (`free-body`)
- projectiles: **estimate** (где приземлится шарик B — на полу-линейке, ответ из `src/physics/projectile.ts`), **build** ×1 (время падения `h = ½ × {g} × {t}²` → app считает t), **order** (почему горизонтальная скорость не меняется), **graphPick** (вертикальная скорость от времени). Skill check: examCard (a) time of flight [2] build, (b) range [2] build; graphPick; choice; build.
- free-body: **sort** (силы НА ящик / силы ОТ ящика), **spotError** (в списке сил «force of motion»), **build** (`N = {W} − {T} × sin {θ}`), tapFig оставить. Skill check: sort, build, choice, examCard (лестница: (a) State the direction of the wall's push [1], (b) Calculate friction [2]).

### D5 «Force and acceleration» (`f-ma`) и «The push from the floor» (`normal-reaction`)
- f-ma: **build** (`a = ({F} − {f}) ÷ {m}`), **estimate** (ускорение при удвоенной тяге, допуск 0.3), **graphPick** (a от F с трением — прямая не через ноль), **order** (тележка после падения груза: первый закон). Skill check: build, graphPick, choice, examCard (блок: (a) a [2] build, (b) Explain why T < weight of the hanging mass [2] order).
- normal-reaction (эталон): **build** (`N = {m} × ({g} + {a})`), **sort** (пары третьего закона / уравновешенные силы), **estimate** (показания весов в kg, ответ 69.2, допуск 1.5). Skill check: build, sort, choice, examCard.

### D6 «Falling through air» (`terminal-velocity`) и «Momentum» (`momentum`)
- terminal-velocity: **graphPick** (v–t парашютистки с раскрытием), **order** (скорость ↑ → сопротивление ↑ → равнодействующая ↓ → ускорение ↓ → предельная скорость), **estimate** (предельная скорость 4 формочек), **build** (`v = √({m} × {g} ÷ {k})`). Skill check: examCard Explain [3] order + Calculate [2] build, graphPick, build, choice.
- momentum: **build** (`Δp = {m} × ({v} − {u})` со знаками: отскок −1.0, удар +1.5), **spotError** (забыт знак скорости отскока → Δp = −0.40), **estimate** (Δp на линии импульса). Skill check: build, spotError, choice, examCard.

### D7 «Collisions» (`collisions`) и «Turning forces» (`moments`)
- collisions: **build** (`v = ({m₁}{u₁} + {m₂}{u₂}) ÷ ({m₁} + {m₂})` — клетки в одной формуле), **estimate** (скорость после слипания на линейке), **order** (отдача: почему разъезжаются), **graphPick** (импульс двух тележек от времени). Skill check: build, examCard (разлёт пружиной), choice, spotError.
- moments: **переименуй Mia/Leo** (они уже в projectiles) — например Priya и Tom (обнови тексты, `cast`, подписи панелей `SpannerPull.who`, тип расширь); **build** (`M = {F} × {d}`, где чипы: 30 cm — неверно, «not the perpendicular distance», 15 cm — верно), **spotError** (взят r вместо перпендикуляра), tapFig оставить; включи движение ключа (C9) после Check. Skill check: build, spotError, choice, examCard.

### D8 «Keeping balance» (`balance`) и «Work done» (`work`)
- balance: **estimate** (где сесть Бену — ответ 1.2 m; ползунок explore превращается в оценку), **build** (принцип моментов: `{W₁} × {d₁} = {W₂} × {d}`), **sort** (по часовой / против часовой). Skill check: build, sort, choice, examCard (доска на двух козлах: (a) [2] build, (b) [2] build).
- work: **build** (Омар, как образец из samples), **sort** (совершает работу / нет), **spotError** (на пандусе взята высота вместо пути вдоль пандуса… или наоборот, по смыслу урока). Skill check: build, sort, choice, examCard.

### D9 «Kinetic and potential energy» (`ke-gpe`) и «Where the energy goes» (`conservation`)
- ke-gpe: **order** (вывод ½mv²: W = FΔs → F = ma → v² = 2aΔs → W = ½mv²), **build** (`ΔEp = {m} × {g} × {Δh}`), **estimate** (во сколько раз больше работы 10→20, чем 0→10: шкала 1–5, ответ 3), **graphPick** (Ek от v — парабола). Skill check: build, order, choice, examCard.
- conservation: **build** (`v = √({u}² + 2 × {g} × {h})`), **sort** (запасы энергии: kinetic / gravitational / thermal — что растёт на горке), **estimate** (скорость камня у воды, ответ 23.2), **spotError** (забыта начальная Ek). Skill check: build, spotError, choice, examCard (горка с трением).

### D10 «Power and efficiency» (`power`) и «Density and upthrust» (`density-upthrust`)
- power: **build** (`P = {F} × {v}`), **order** (почему P ∝ v³ при D ∝ v²), **estimate** (мощность на 12 m s⁻¹, шкала 0–600 W, ответ 432), **graphPick** (P от v). Skill check: build, order, choice, examCard (лебёдка: (a) useful power [2] build, (b) efficiency [1] build).
- density-upthrust: **build** (`U = {ρ} × {V} × {g}`), **sort** (тонет / плавает по плотности), **estimate** (на сколько упадёт уровень, ответ 1.36 cm), **order** (рассуждение Архимеда для лодки с бруском). Skill check: build, sort, choice, examCard.

### D11 «Viscous drag» (`viscosity`) и «Hooke's law» (`hooke`)
- viscosity: **build** (`F = 6π × {η} × {r} × {v}`), **sort** (ламинарное / турбулентное: примеры), **order** (шарик выходит на постоянную скорость: W = U + F), **graphPick** (v–t шарика в глицерине). Skill check: examCard (метод падающего шарика: (a) Explain why the timing starts lower down [2] order, (b) Calculate η [2] build), build, sort, choice.
- hooke: **build** (`k = {ΔF} ÷ {Δx}`, чип `16.0 cm` — неверно: «that is the length, not the extension»), **graphPick** (F–Δx целой пружины и половинки), **estimate** (растяжение половинки, ответ 3.0 cm), **spotError** (длина вместо растяжения). Skill check: build, spotError, graphPick, examCard.

### D12 «Stress, strain, Young modulus» (`young`) и «Reading material graphs» (`material-graphs`)
- young: **order** (порядок опыта CP2: измерить L → измерить d в нескольких местах → нагружать с шагом → записывать Δx → график F–Δx), **build** (`σ = {F} ÷ {A}` с A = π d² ÷ 4; чип радиус вместо диаметра — неверно), **spotError** (диаметр в формуле πr²). Skill check: order (CP2), build, choice, examCard.
- material-graphs: **sort** (упругая / пластичная деформация: описания), **graphPick** (какая кривая хрупкого материала), tapFig оставить, **estimate** (остаточная деформация после разгрузки, ответ 3.0 × 10⁻³). Skill check: graphPick, sort, choice, examCard.

### D13 «Elastic strain energy» (`strain-energy`); правила v3 для всех
- strain-energy: **build** (`E = ½ × {F} × {Δx}`), **estimate** (во сколько раз больше энергии при удвоенном сжатии, ответ 4), **spotError** (забыт ½), **order** (цепочка: запас упругой энергии → кинетическая шарика). Skill check: build, spotError, choice, examCard.
- В `types.ts` сделай `chapters` и `cast` обязательными; в `rules.test.ts` убери набор `REVISED` — правила для всех уроков.
- Обнови «Статус» в `CLAUDE.md`: все уроки в формате v3.

---

## Этап E. Конец урока

### E1 Конец урока: праздник + экран разбора

**Цель.** После Skill check — короткий праздник, потом экран разбора. План: V2_PLAN 4.4.

**Читать:** `src/lesson/LessonComplete.tsx`, `src/app/lesson/[id].tsx`, `src/session/logic.ts`, `src/session/storage.ts` (Run), `src/content/types.ts`, `src/ui/parts.tsx`, `src/ui/motion.tsx`, `src/art/brand.ts` (stamp).

**Шаги.**
1. `LessonComplete`: убрать блок честного счёта и «You can now» (переезжают в разбор). Порядок: шайба → штамп → «Lesson complete» + название → решённая загадка → карточка блокнота (если новая) → серия → главная кнопка `Continue`. Штамп `revealed` (серый) использовать, когда больше половины вопросов Skill check показаны (сейчас не используется).
2. Новый `src/lesson/Breakdown.tsx`, экран в той же ленте (после Continue, без возврата назад):
   - заголовок `Your breakdown`, название урока;
   - **таблица из трёх чисел** — одна строка с тремя колонками, разделёнными тонкими линиями (стиль чертежа, фон `paper`, метки моноширинным caps): `ON YOUR OWN 9/12`, `TIME 11 MIN` (из `activeMs`, округлить), `PREDICTION ✗ → ✓` (или `✓`);
   - **лента вопросов**: квадратик 18 pt на каждый оцениваемый вопрос (история + части examCard), разделители глав и `SKILL CHECK`. Сам — заливка `reward`; с подсказкой — контур цвета уровня 2 pt; ответ показан — заливка `disabled`. Под лентой легенда словами. `accessibilityLabel` у ленты: «9 on your own, 2 after a hint, 1 shown»;
   - **What tripped you up** — для каждого вопроса не с первого раза: строка вопроса (prompt, обрезать до 80 символов), «You picked: …» (первый неверный вариант из `wrong`), подсказка этого варианта (`hint`) или `why`. Если таких нет — одна строка «Nothing — every answer right first time.»;
   - **Your prediction** — «You said: … It was: …» (из `picks` и верного варианта predict);
   - **Coming back in review** — «These N questions come back tomorrow.» (пока только текст; очередь добавит F3);
   - **How was it?** — три пилюли `Too easy · Just right · Too hard`; нажатие → `setLastRunFeel`, выбранная — синяя;
   - кнопки: главная `Next lesson` (цвет уровня) или `Back to Home`, тихая текстовая `Play the lesson again`.
3. Если урок — последний пройденный в своём уровне (все уроки уровня в `finished/v1`), главная кнопка ведёт на Level complete (E3); до E3 — как обычно.
4. Функции подсчёта для разбора — чистые в `src/session/breakdown.ts` с тестами (лента, список ошибок, тексты).

**Готово, когда:** урок пройден с 2 ошибками; скриншоты праздника и разбора, обе темы.

**Коммит:** `Lesson end: shorter celebration, then a breakdown — question ribbon, what tripped you up, prediction, how was it`

### E2 «Ага»-момент при решённой загадке

**Читать:** `src/lesson/screens/QuestionView.tsx`, `src/figures/Sheet.tsx`, `src/ui/motion.tsx`.

**Шаги.** Когда вопрос с `revisitOf` решён верно: рамка листа один раз вспыхивает цветом уровня (толщина 2 → 3 → 2 pt, цвет `c.main`, `motion.celebrate`), над листом появляется чип `PUZZLE SOLVED` (моноширинный caps, фон цвета уровня, белый текст), фигура показывает раскрытое состояние (уже есть). Звук `feedback.reveal()` вместо обычного `right`. Reduced motion — только чип. Не чаще одного раза за урок.

**Коммит:** `Puzzle solved moment on the revisit question`

### E3 Экран Level complete

**Читать:** `src/lesson/Breakdown.tsx`, `src/art/objects.ts` (`levelObject`), `src/art/brand.ts` (stamp `level`), `src/content/course.ts`, `src/session/storage.ts`, `src/ui/parts.tsx`.

**Шаги.** Новый `src/lesson/LevelComplete.tsx`, полноэкранный, фон — `level(c).soft`: метка `LEVEL 2`, название уровня Space Grotesk 700 32; предмет уровня (`Art`, 180 pt) опускается сверху и встаёт (падение по модели g с одним отскоком — это нарисованное тело, ему можно), затем штамп `level` ложится на угол; строка «4 lessons · 3 on your own» (по последним прохождениям: штамп independent); главная кнопка `Start <next level>` (открывает обложку первого урока следующего уровня) или `Back to Home`, если уровень последний. Звук `unlock`, вибрация medium. Запоминай показ (`levels-done/v1` в storage), чтобы не показывать повторно при переигровке.

**Коммит:** `Level complete screen`

---

## Этап F. Приложение

### F1 Вкладки Home · Learn · Revise · Me — сложная

**Цель.** Таб-бар из 4 вкладок; урок и прочие полноэкранные экраны — поверх. План: V2_PLAN 5.2.

**Читать:** `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/notebook.tsx`, `src/app/settings.tsx`, `src/art/uiIcons.ts`, `src/ui/Art.tsx`, `src/theme/levelColor.ts`.

**Шаги.**
1. Структура expo-router:
   ```
   src/app/_layout.tsx            Stack (как сейчас)
   src/app/(tabs)/_layout.tsx     Tabs: index (Home), learn, revise, me
   src/app/(tabs)/index.tsx       Home (заглушка до F2: заголовок «Home»)
   src/app/(tabs)/learn.tsx       карта — содержимое нынешнего src/app/index.tsx
   src/app/(tabs)/revise.tsx      заглушка до F4 (ссылка на блокнот)
   src/app/(tabs)/me.tsx          заглушка до F5 (ссылка на настройки)
   src/app/lesson/[id].tsx, notebook.tsx, settings.tsx, gallery*   — остаются в Stack
   ```
   Удали старый `src/app/index.tsx` после переноса. Все `router.replace('/')` для «на карту» → `'/learn'`, «домой» → `'/'`.
2. Иконки: в `src/art/uiIcons.ts` добавь `home` (линии 2.4 в 24×24, как остальные: `<path d="M4,11 L12,4 L20,11 M6.5,9.5 V20 H17.5 V9.5"/>`). Learn — `learn`, Revise — `practice`, Me — `user`.
3. Свой таб-бар (`tabBar` проп у `Tabs`): фон `page`, сверху линия `line`, высота 56 + нижний safe area; 4 кнопки поровну, иконка 24 + подпись Space Grotesk 600 12; активная — `ink` и точка 5 pt цвета текущего уровня (уровень следующего урока) под подписью; неактивные — `muted`. Без анимации подпрыгивания; смена — мгновенная. `accessibilityRole="tab"`, `accessibilityState={{ selected }}`.
4. Карта: из шапки убрать кнопки блокнота и настроек (они в Revise и Me); `Dock` → Start открывает урок (обложка A5).
5. Веб: проверь, что `display: none` для карты во время урока (Статус в CLAUDE.md) всё ещё работает с вкладками.

**Готово, когда:** 4 вкладки переключаются, урок открывается поверх без таб-бара, × возвращает на ту вкладку, откуда открыт; скриншоты.

**Коммит:** `Four tabs: Home, Learn, Revise, Me; the map moves to Learn`

### F2 Экран Home — стоп: владелец

**Читать:** `src/app/(tabs)/index.tsx`, `src/map/Momentum.tsx` (чип и неделя серии), `src/map/Dock.tsx`, `src/figures/Sheet.tsx`, `src/figures/LessonIcon.tsx`, `src/notebook/NoteCard.tsx`, `src/session/storage.ts`, `src/content/course.ts`, `src/content/lessons.ts`, V2_PLAN 5.2 «Home».

**Шаги.**
1. `src/home/` — компоненты: `Greeting`, `ExamStrip`, `ContinueCard`, `ReviewCard`, `WeekRow`, `CourseBars`, `NotebookPick`. Экран — `ScrollView`, поля 20, промежутки 24.
2. **Greeting:** «Good morning / afternoon / evening» (5–12 / 12–18 / иначе) Space Grotesk 700 26, под ним дата `Sunday, 22 November` (`muted` 14). Справа — `MomentumChip` (переиспользовать).
3. **ExamStrip** (если в `profile/v1` есть `exam`): строка моноширинным 11 caps `EXAM · JUNE 2027 · 196 DAYS` (дни до 1-го числа месяца сессии), фон `paper`, радиус 10.
4. **ContinueCard:** карточка с губой цвета уровня; сверху лист-полоса высотой 120 с intro-фигурой следующего урока (`Sheet compact`; рисует себя только при первом показе за запуск); ниже плитка урока 44 pt, метка уровня, название Space Grotesk 700 20, строка `Chapter 2 of 3 · ~6 min left` (по сохранённому `index` и `chapters`; минуты = `minutes × (1 − доля пройденного)`) или `Up next · ~11 min`; главная кнопка цвета уровня `Continue` / `Start`. Если всё пройдено — иллюстрация `allDone` и «Every lesson done. Keep them fresh in Revise.»
5. **ReviewCard:** заголовок `Today's review`, `5 questions · ~3 min`, ряд 5 маленьких шайб (из `Puck.tsx`, размер 22), вторичная кнопка (обводка `ink`, без заливки) `Start review`. До F3 — пустое состояние: «Finish a lesson and its questions come back here to keep them fresh.» (иллюстрации не нужно).
6. **WeekRow:** 7 шайб дней недели (как в шторке серии), подписи M T W T F S S.
7. **CourseBars:** 6 строк: точка цвета уровня, название, справа `3 of 6`, под ним тонкая полоса 6 pt; нажатие — вкладка Learn и прокрутка к уровню (параметр `?level=forces`, карта его читает).
8. **NotebookPick:** если в блокноте ≥ 1 карточки — случайная (по дню) `NoteCard`, заголовок `From your notebook`.
9. Появление блоков — `Rise` по очереди, один раз за запуск.

**Готово, когда:** скриншоты Home: новый пользователь, середина курса, всё пройдено; обе темы. **Стоп: показать владельцу.**

**Коммит:** `Home: greeting, exam countdown, continue card with the lesson's figure, review, week, course bars, notebook card`

### F3 Повторение по интервалам и общий проигрыватель практики — сложная

**Цель.** Банк вопросов из пройденных уроков, очередь повторения, общий проигрыватель для повторения, практики уровня, ошибок и mock. План: V2_PLAN 5.3.

**Читать:** `src/session/logic.ts`, `src/session/storage.ts`, `src/session/shuffle.ts`, `src/lesson/LessonPlayer.tsx`, `src/lesson/screens/*View.tsx` (только пропсы), `src/content/lessons.ts`, `src/app/lesson/[id].tsx`.

**Шаги.**
1. `src/practice/bank.ts` (чистый, с тестом): `bankOf(lessonIds): Item[]`, `Item = { key: 'lessonId/screenId'; lessonId; screen: Question | BuildScreen | …; phase: 'check' }` — все оцениваемые экраны истории и Skill check, кроме экранов с `revisitOf` (без истории непонятны) и examCard (только в mock).
2. `src/practice/review.ts` (чистый, с тестом): `Box = 0..4`, интервалы `[1, 3, 7, 21]` дней; `schedule(entry, outcome, today)`: independent → box+1 (максимум 4, после 4 — через 21 день снова), иначе box = 0 и через 1 день; `due(queue, today)`; `pickReview(queue, bank, today, n = 5)` — сначала просроченные, потом новые из последних пройденных уроков; разные уроки подряд.
3. `storage.ts`: `review/v1` — `loadReview`, `saveReview`; при сохранении прохождения урока (A2) все вопросы урока попадают в очередь: не с первого раза — box 0 due завтра, сами — box 1 due через 3 дня. В разборе (E1) строка «Coming back in review» теперь считает настоящие.
4. `src/practice/PracticePlayer.tsx`: проигрывает список `Item` — верхняя строка: × и счётчик `3 of 5` + сегменты; экраны вопросов те же, что в уроке (`QuestionView`, `BuildView`, …), `phase: 'check'` (одна попытка), варианты перемешиваются с солью = дата (`shuffled(options, key, today)`). Без глав, обложки и праздника.
5. В конце — `PracticeSummary`: «4 of 5 right first time», лента квадратиков (как в разборе), «Next review: in 3 days» (ближайшая дата очереди), кнопка `Done`. Обновить очередь, засчитать день в серию (`recordFinishedDay`).
6. Маршрут `src/app/practice/[mode].tsx`, `mode`: `review` | `level-<levelId>` (6 случайных вопросов уровня) | `mistakes` (вопросы, последний исход которых не independent, до 8) | `mock` (10 вопросов из пройденных уроков, по одному examCard в конце, если есть; баллы в итоге).
7. Home `ReviewCard` (F2) начинает работать: число due, кнопка ведёт на `/practice/review`.

**Готово, когда:** пройти 2 урока, на Home видно `5 questions`, повторение проходится, итог показан, очередь сдвинулась (тест + скриншоты).

**Коммит:** `Spaced review and a shared practice player: review, level practice, mistakes, mock set`

### F4 Вкладка Revise

**Читать:** `src/app/(tabs)/revise.tsx`, `src/practice/*`, `src/home/ReviewCard.tsx`, `src/art/objects.ts`, `src/ui/Art.tsx`, `src/content/course.ts`, V2_PLAN 5.2 «Revise».

**Шаги.**
1. Заголовок `Revise` Space Grotesk 700 30.
2. `ReviewCard` (расширенный: `5 due today`, `Next: tomorrow, 3 questions`).
3. Блок `Practise a level`: 6 строк 64 pt — предмет уровня `Art` 40 pt слева (серый `soonReward`, если в уровне нет пройденного урока), название, `6 questions · 2 lessons done`, шеврон; закрытая — замок и `Finish a lesson in Motion first`.
4. Строка `Your mistakes · 4` (иконка `why`), ведёт на `/practice/mistakes`; если 0 — «No mistakes to fix right now» без нажатия.
5. Строка `Mock set · 10 questions` (иконка `practice`), доступна после 3 пройденных уроков.
6. Строка `Notebook · 7 of 24` (иконка `notebook`) → `/notebook`.
Строки — разные по высоте и оформлению (не одинаковая сетка): уровни — список с предметами, остальное — строки с иконками.

**Коммит:** `Revise tab: review, level practice, mistakes, mock set, notebook`

### F5 Вкладка Me: серия, штампы, спецификация

**Читать:** `src/app/(tabs)/me.tsx`, `src/map/Momentum.tsx`, `src/session/streak.ts`, `src/session/storage.ts`, `src/content/course.ts`, `src/content/course.test.ts`, `src/figures/Puck.tsx`, `src/art/brand.ts`, V2_PLAN 5.2 «Me».

**Шаги.**
1. `src/content/spec.ts`: 32 пункта WPH11 — номер и **своё короткое название** (пересказ, не текст Pearson; ≤ 40 символов: `1 · suvat equations`, `2 · Motion graphs`…). Тест: 32 пункта, номера 1–32, совпадают с теми, что используются в `course.ts`.
2. Шапка: волчок (крутится/лежит, как в шторке серии), `12 days of momentum`, `Longest: 15 days`.
3. **12 недель**: сетка 7 × 12 точек 10 pt (столбец — неделя), день с уроком или повторением — `reward`, иначе `disabled`; подпись месяцев сверху моноширинным.
4. **Lessons**: по уровням — название уровня и ряд маленьких шайб (24 pt), шайба окрашена по штампу последнего прохождения: independent — золотая, assisted — цвет уровня, revealed — серая, не пройден — контур.
5. **Specification**: 32 строки по уровням, справа статус словами — `Not started` (`muted`), `Learning` (цвет уровня, текстовый вариант), `Secure` (значок ✓ `ok` + слово). Правило (функция `specStatus` в `src/session/progress.ts` с тестом): Secure — все уроки с этим пунктом пройдены, в последнем прохождении Skill check сам (`independent` у всех вопросов Skill check), и последнее повторение каждого его вопроса (если было) верно; Learning — хотя бы один урок начат или пройден; иначе Not started.
6. Строки внизу: `Settings` → `/settings`, `About` (APP_NAME, версия из `expo-constants`, «Not affiliated with Pearson Edexcel.»).
7. Пусто (нет ни одного урока): иллюстрация `emptyProgress` и «Finish your first lesson to see progress here».

**Коммит:** `Me tab: momentum, 12-week activity, lesson stamps, honest specification status`

### F6 Онбординг: Welcome, дата экзамена, первый урок

**Читать:** `src/app/_layout.tsx`, `src/map/Launch.tsx` (заставка по модели — как образец физики), `src/art/illustrations.ts` (`welcome`), `src/session/storage.ts`, `src/config.ts` (APP_NAME), DESIGN.md раздел 6 п. 10 и раздел 9 «Welcome».

**Шаги.**
1. `storage.ts`: `profile/v1` — `{ onboarded: boolean; exam: string | null }`, `loadProfile`, `saveProfile`. `resetProgress` профиль не трогает.
2. `src/app/welcome.tsx`: сверху знак приложения и `APP_NAME`; в центре **шайба на пружине** (react-native-svg + Gesture Handler `Pan`): шайбу можно оттянуть вниз до 120 pt, отпустить — колеблется по модели затухающих колебаний (`src/physics/springs.ts`, подбери k и затухание: 3–4 видимых колебания), пружина рисуется зигзагом между потолком и шайбой; подсказка `Pull the puck` (иконка `drag`), исчезает после первого рывка. Заголовок `Physics you can move.` Space Grotesk 700 32, строка `Edexcel IAL Unit 1 in 24 short lessons.`, главная кнопка `Start`.
3. `src/app/onboarding/exam.tsx`: `When is your Unit 1 exam?` — карточки трёх ближайших сессий от сегодняшней даты (январь, май–июнь, октябрь; функция `nextSessions(today)` в `src/session/exam.ts` с тестом) и `Not sure yet`; кнопка `Continue`.
4. После — `router.replace('/lesson/<первый урок курса>')` (обложка). `onboarded = true` ставится при выборе экзамена.
5. `_layout.tsx`: при запуске, если `onboarded` не true — открыть `/welcome` (заставку `Launch` в этот раз не показывать).
6. В Settings — строка `Exam date` (тот же выбор), `Reset progress` онбординг не повторяет.

**Готово, когда:** чистый `localStorage` → Welcome (скриншот, шайба оттянута и отпущена) → экзамен → обложка урока 1; после — Home с полоской экзамена.

**Коммит:** `Onboarding: welcome with a spring puck, exam date, straight into the first lesson`

### F7 Пустые состояния и проход по всем вкладкам — стоп: владелец

**Шаги.**
1. Пройди сценарии: новый пользователь; 1 урок; 7 уроков с ошибками; все 24 урока (подставь `finished/v1`, `runs/v1/*`, `review/v1`, `streak/v1` в `localStorage`). Для каждого — скриншоты Home, Learn, Revise, Me в обеих темах.
2. Исправь найденное: обрезанный текст, наложения, пустые блоки без пояснения, кнопки < 44 pt, контраст.
3. Покажи владельцу 8 главных скриншотов. **Стоп.**

**Коммит:** `Empty states and a pass over every tab`

---

## Этап G. Проверка

### G1 Полная проверка: все экраны, обе темы, доступность
1. Каждый урок: обложка, по одному экрану каждого вида, Skill check, праздник, разбор — в обеих темах (скриншоты в `docs/qa/` не сохранять, только смотреть).
2. Доступность: у каждой иконки-кнопки есть `accessibilityLabel`; смысл не только цветом (верно/неверно — значок и слово; лента разбора — легенда словами; статусы спецификации — словами); `tokens.test.ts` проходит; reduced motion: включи в настройках системы/эмуляции и проверь урок — ничего не движется, всё в конечном состоянии.
3. Список найденного и исправленного — в коммит-сообщение.

**Коммит:** `QA pass: every screen in both themes, accessibility fixes`

### G2 Список проверки на телефоне для владельца
Напиши владельцу пошаговую инструкцию (по-русски): как открыть в Expo Go (`npx expo start`, «Enter URL manually» → `exp://<IP>:8081`, IP — `ipconfig getifaddr en0`, та же Wi-Fi) и **что проверить** галочками: онбординг и пружина, вкладки, Home, один урок целиком (новые виды заданий, главы, «ага», праздник, разбор), повторение, Revise, Me, тёмная тема, звук и вибрация, беззвучный режим, плавность фигур (Flow, Crate, лифт). Обнови «Статус» в `CLAUDE.md`: версия 2 построена, ждём проход владельца и его правки, потом — ссылка для пилота.
