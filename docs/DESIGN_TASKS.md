# Задачи дизайн-трека — пошагово

13 ноября 2026 · для исполнителя (Claude Code, в том числе модель попроще). Что и зачем — в `docs/DESIGN.md`; здесь — **как**, по одной небольшой задаче.

## Как работать с этим файлом

1. **Одна задача = одна сессия.** Владелец пишет «сделай задачу 1.1» (или «продолжаем» — тогда бери первую задачу без отметки ✅ в таблице ниже).
2. Читай **только файлы, перечисленные в задаче**, плюс раздел `docs/DESIGN.md`, на который она ссылается. `docs/PLAN.md` и `docs/LESSON_FRAMEWORK.md` для этих задач читать не нужно.
3. Номера строк в задачах — на 13 ноября; они могли сдвинуться. Ищи по тексту (`grep`), а не по номеру.
4. **Образец каждого эффекта уже написан** — в `scripts/demo-template.html`, функции `demos.<имя>`. Это обычный веб-код (CSS и WAAPI), его надо перенести на React Native + Reanimated, а не копировать. Времена, кривые и порядок бери оттуда.
5. Картинки в `src/art/` **не перерисовывай**. Если ассета не хватает — остановись и скажи владельцу.
6. Правила кода проекта:
   - включён React Compiler: у shared values Reanimated только `.get()` и `.set()`, никогда `.value`;
   - каждая анимация выключается при reduced motion (`useReducedMotionPref()` из `src/ui/motion.tsx`): элемент сразу в конечном состоянии;
   - интерфейс не пружинит (кривая `Easing.out(Easing.cubic)`), отскок только у нарисованных тел;
   - цвета и времена — из `src/theme/tokens.ts` (`motion`, `levelPalette`, `reward`), не числами в коде;
   - prettier не запускать.
7. **Готово, когда:** `npm run check` проходит; экран проверен в веб-версии шириной 375 (сервер `web` из `.claude/launch.json`, порт 8081) скриншотом; в консоли браузера нет ошибок. Панель браузера может давать 2–3 кадра в секунду — анимация там дёрганая, это не баг; проверяй конечное состояние.
8. После проверки: поставь ✅ в таблице ниже, обнови раздел «Статус» в `CLAUDE.md` (какая задача следующая), `git commit` (сообщение на английском, оно дано в задаче) и `git push origin main`. Папку `personal-project/` в коммит не добавлять.
9. В конце ответа владельцу: что сделано простыми словами, что он должен посмотреть сам (чаще всего — послушать или посмотреть на телефоне), строка «Дальше: задача N», и напомни ввести `/clear`.
10. Задача помечена **«сложная»** — перед началом скажи владельцу, что для неё лучше взять модель посильнее или режим плана, и дождись ответа.

## Список задач

| № | Задача | Статус |
|---|---|---|
| 1.1 | Шесть цветов уровней, цвет уровня внутри урока, жёлтые искры | ✅ |
| 1.2 | Свой значок у каждого урока на карте | ✅ |
| 1.3 | Иконка приложения и заставка | ✅ |
| 1.4 | Звук | |
| 2.1 | Заливка перед Skill check | |
| 2.2 | Качание неверной карточки и штамп на Lesson complete | |
| 2.3 | Фигуры рисуют себя (сложная) | |
| 2.4 | Общая фигура не уезжает между экранами (сложная, можно пропустить) | |
| 3.1 | Предметы в конце уровней и экран «всё пройдено» | |
| 3.2 | Шарик катится к следующему уроку | |
| 3.3 | Заставка по модели | |
| 4.1 | Блокнот: карточки формул | |
| 4.2 | Серия дней: волчок | |
| 4.3 | Карточка и волчок на Lesson complete | |
| 5.1 | Тёмная тема | |
| 5.2 | Экран Settings | |

---

## Заход 1. Цвет, значки, иконка, звук

### 1.1 Шесть цветов уровней, цвет уровня внутри урока, жёлтые искры

**Цель.** Карта окрашена по уровням. Внутри урока полоса прогресса, точки Skill check, шайбы и кнопка «Back to the map» берут цвет уровня этого урока. Силы на чертежах и выбранный ответ остаются синими. Искры верного ответа — жёлтые.

**Файлы:** `src/theme/tokens.ts`, `src/content/course.ts`, новый `src/theme/levelColor.ts`, `src/lesson/LessonPlayer.tsx`, `src/lesson/LessonComplete.tsx`, `src/lesson/screens/Simple.tsx`, `src/ui/parts.tsx`.

**Шаги.**

1. `src/theme/tokens.ts`. Удали старое определение `levelColors` (комментарий «Kept per level…» и `Object.fromEntries(...)`). Сразу после объявления `levelPalette` добавь:
   ```ts
   /** The colour of each level of the map (design system v1, switched on 13 Nov). */
   export const levelColors = levelPalette;
   ```
   В комментарии-шапке блока «Design system v1» замени «Everything below is PROPOSED…» на то, что `levelPalette` уже включена, а `darkPalette` ждёт задачи 5.1.
2. `src/content/course.ts`. В конец файла:
   ```ts
   /** The level a lesson belongs to ('motion', 'forces', …). */
   export function levelIdOf(lessonId: string): string {
     return course.levels.find((lv) => lv.lessons.some((x) => x.id === lessonId))?.id ?? course.levels[0].id;
   }
   ```
3. Новый файл `src/theme/levelColor.ts`:
   ```ts
   // The colour of a lesson is the colour of its level on the map.
   import { levelIdOf } from '@/content/course';
   import { courseBlue, levelColors, type LevelColor } from './tokens';

   export const colorOfLesson = (lessonId: string): LevelColor => levelColors[levelIdOf(lessonId)] ?? courseBlue;
   ```
4. `src/lesson/LessonPlayer.tsx`. В `LessonPlayer` посчитай `const c = colorOfLesson(lesson.id);`. Компонентам `ProgressFill` и `CheckDot` добавь проп `color: string` и используй его вместо `courseBlue.main`; передай `color={c.main}`. Импорт `courseBlue` убери. В `<CheckIntroView … />` добавь проп `color={c}`.
5. `src/lesson/screens/Simple.tsx`. `CheckIntroView` принимает `color: LevelColor`; в `<Puck … color={levelColors.forces} />` поставь `color={color}`. Убери импорт `levelColors`, если он больше не нужен.
6. `src/lesson/LessonComplete.tsx`. В начале компонента `const c = colorOfLesson(lesson.id);`. Замени на `c`: цвет кнопки «Back to the map» (`color={courseBlue}`), цвет шайбы (`levelColors.forces`), галочки списка «You can now» (`stroke={courseBlue.main}`), закрашенные точки Skill check (`backgroundColor: courseBlue.main`). **Стрелки во «взрыве» вокруг шайбы (`Burst`, строка с `i % 3 === 2 ? p.draw : courseBlue.main`) не трогай: это силы, они синие.** Вложенным компонентам, которым нужен цвет, передай его пропом.
7. `src/ui/parts.tsx`. В двух местах, где рисуется `<Sparks … />` (в значке верной карточки и в шторке вердикта), цвет искр — `reward.face` (импорт `reward` из `@/theme/tokens`). Зелёный цвет самой карточки и шторки не меняется.

**Проверка в вебе.** Карта: шайбы Motion синие, Forces фиолетовые, дальше пурпурный, оранжевый, бирюзовый, лаймовый; уроки без `ready` серые; закреплённая табличка меняет цвет при прокрутке (это уже работает через `levelColors[plateLevel.id]` в `src/app/index.tsx`). Урок «The push from the floor»: полоса и точки фиолетовые, стрелки сил W и N синие, выбранная карточка синяя, искры жёлтые. Экран Lesson complete: шайба и кнопка фиолетовые.

**Коммит:** `Design round 1.1: six level colours on the map and inside lessons, yellow sparks`

### 1.2 Свой значок у каждого урока на карте

**Цель.** Плитка над шайбой следующего урока показывает значок именно этого урока (из `src/art/lessonIcons.ts`), а не значок уровня.

**Файлы:** `src/figures/LessonIcon.tsx`, `src/map/PuckRow.tsx` (только посмотреть вызов).

**Шаги.** Замени содержимое `src/figures/LessonIcon.tsx` на:

```tsx
// The raised tile with a lesson's icon that hovers above the next lesson on the map.
// The drawing itself lives in src/art/lessonIcons.ts (one icon per lesson).
import { lessonTile } from '@/art/lessonIcons';
import type { LevelColor } from '@/theme/tokens';
import { Art } from '@/ui/Art';

export function LessonTile({ lessonId, levelId, color, size = 60 }: { lessonId: string; levelId: string; color: LevelColor; size?: number }) {
  return <Art xml={lessonTile(lessonId, levelId, color)} width={size} />;
}
```

Перед этим убедись (`grep -rn "iconFor" src`), что `iconFor` нигде больше не используется; если используется — оставь его экспорт.

**Проверка в вебе.** На карте над текущим уроком плитка со своим значком; размер и положение плитки не изменились; плитка по-прежнему покачивается. Страница `/gallery` открывается.

**Коммит:** `Design round 1.2: every lesson has its own icon on the map tile`

### 1.3 Иконка приложения и заставка

**Цель.** Вместо картинок Expo — наш знак: основная иконка на белом, тёмный вариант для тёмного оформления телефона.

**Файлы:** `app.config.ts`, `assets/images/`, `assets/brand/`.

**Шаги.**

1. Скопируй (с заменой):
   - `assets/brand/icon.png` → `assets/images/icon.png`
   - `assets/brand/icon-ink.png` → `assets/images/icon-dark.png`
   - `assets/brand/android-icon-foreground.png` → `assets/images/android-icon-foreground.png`
   - `assets/brand/android-icon-monochrome.png` → `assets/images/android-icon-monochrome.png`
   - `assets/brand/favicon.png` → `assets/images/favicon.png`
   - `assets/brand/splash-icon.png` → `assets/images/splash-icon.png`
2. `app.config.ts`:
   - `ios: { icon: { light: './assets/images/icon.png', dark: './assets/images/icon-dark.png' } }` (проверь по типу `ExpoConfig`, что `ios.icon` принимает объект; если тип не пускает — оставь строку `'./assets/images/icon.png'` и скажи об этом владельцу);
   - в `android.adaptiveIcon`: `backgroundColor: '#FFFFFF'`, строку `backgroundImage` убери;
   - в плагине `expo-splash-screen`: `imageWidth: 120`.
3. Удали то, что больше не используется: `git rm -r assets/expo.icon` и `git rm assets/images/android-icon-background.png`.
4. Проверь конфиг: `npx expo config --type public` печатает конфиг без ошибок.

**Проверка.** В вебе во вкладке браузера новый favicon. **Иконку и заставку в Expo Go увидеть нельзя** (там показывается иконка самого Expo Go) — так владельцу и скажи: они появятся в настоящей сборке.

**Коммит:** `Design round 1.3: app icon (white, dark twin) and splash mark replace the Expo defaults`

### 1.4 Звук

**Цель.** Десять звуков из `assets/sounds/` играют по таблице из `docs/DESIGN.md`, раздел 7. Одно место в коде отвечает и за звук, и за вибрацию.

**Файлы:** новый `src/ui/sound.ts`, новый `src/ui/feedback.ts`, `src/ui/haptics.ts`, `src/lesson/screens/QuestionView.tsx`, `src/lesson/screens/ExploreView.tsx`, `src/lesson/screens/Simple.tsx`, `src/lesson/LessonComplete.tsx`, `src/ui/parts.tsx`, `src/map/PuckRow.tsx` или `src/app/index.tsx` (где нажимается шайба).

**Шаги.**

1. Установи библиотеку: `npx expo install expo-audio` (она работает в Expo Go).
2. Открой типы установленной версии (`node_modules/expo-audio/build/index.d.ts` и соседние) и сверь имена: `createAudioPlayer`, `setAudioModeAsync`, у плеера `play()`, `seekTo()`, `volume`, `setPlaybackRate()`. Если в этой версии что-то называется иначе — используй то, что есть в типах.
3. `src/ui/sound.ts`:
   ```ts
   // Interface sounds (docs/DESIGN.md, 7). One player per sound, created the first time it is needed.
   // The phone's silent switch is respected. In a browser nothing plays before the first tap: that is the browser's rule.
   import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

   const files = {
     tap: require('../../assets/sounds/tap.wav'),
     tick: require('../../assets/sounds/tick.wav'),
     correct: require('../../assets/sounds/correct.wav'),
     wrong: require('../../assets/sounds/wrong.wav'),
     reveal: require('../../assets/sounds/reveal.wav'),
     flood: require('../../assets/sounds/flood.wav'),
     complete: require('../../assets/sounds/complete.wav'),
     stamp: require('../../assets/sounds/stamp.wav'),
     unlock: require('../../assets/sounds/unlock.wav'),
     spin: require('../../assets/sounds/spin.wav'),
   };
   export type SoundName = keyof typeof files;

   let enabled = true;
   let modeSet = false;
   const players: Partial<Record<SoundName, AudioPlayer>> = {};

   /** Turned off from Settings (task 5.2). */
   export const setSoundEnabled = (on: boolean) => {
     enabled = on;
   };

   export function play(name: SoundName, rate = 1) {
     if (!enabled) return;
     try {
       if (!modeSet) {
         modeSet = true;
         setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
       }
       const p = (players[name] ??= createAudioPlayer(files[name]));
       p.volume = 0.7;
       p.setPlaybackRate(rate);
       p.seekTo(0);
       p.play();
     } catch {
       // a device without audio simply stays silent
     }
   }
   ```
4. `src/ui/haptics.ts`: добавь два метода по образцу существующих — `medium` (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`) и `heavy` (`…Heavy`).
5. `src/ui/feedback.ts` — единственное, что вызывают экраны:
   ```ts
   // What the app does when something happens: a sound and, on a phone, a vibration (docs/DESIGN.md, 7).
   import { haptic } from './haptics';
   import { play } from './sound';

   export const feedback = {
     /** An answer card, a puck or a part of a figure was picked. */
     pick: () => { haptic.pick(); play('tap'); },
     /** One step of a slider; `k` is 0…1 along the slider, the pitch rises with it. */
     step: (k: number) => { haptic.pick(); play('tick', 0.8 + 0.6 * k); },
     right: () => { haptic.right(); play('correct'); },
     wrong: () => { haptic.wrong(); play('wrong'); },
     /** "Why?" opened, or the answer was shown. */
     reveal: () => play('reveal'),
     /** The Skill check begins. */
     flood: () => play('flood'),
     /** The puck landed: the lesson is complete. */
     complete: () => { haptic.medium(); play('complete'); },
     stamp: () => { haptic.heavy(); play('stamp'); },
     /** Something opened: the next lesson, a notebook card. */
     unlock: () => { haptic.pick(); play('unlock'); },
     /** The momentum top spins up. */
     spin: () => play('spin'),
   };
   ```
6. Замени вызовы. Найди все места: `grep -rn "haptic\." src`. Везде, кроме `feedback.ts`, `haptic.pick()` → `feedback.pick()`, `haptic.right()` → `feedback.right()`, `haptic.wrong()` → `feedback.wrong()`.
7. Новые вызовы:
   - **ползунок:** в `ExploreView.tsx` в `onChange` слайдера — `feedback.step((v - min) / (max - min))` (`min` и `max` из `screen.slider`);
   - **«Why?»:** там, где нажимается кнопка Why? (`grep -rn "Why" src/ui/parts.tsx src/lesson`) — `feedback.reveal()` при открытии;
   - **начало Skill check:** в `CheckIntroView` (`Simple.tsx`) — один раз при появлении, `useEffect(() => { feedback.flood(); }, [])`;
   - **урок пройден:** в `LessonComplete.tsx` — `feedback.complete()` в момент, когда шайба приземляется (посмотри длительность в компоненте `Drop`; при reduced motion — сразу при появлении);
   - **шайба на карте:** там, где обрабатывается нажатие на шайбу, — `feedback.pick()`.

**Проверка.** `npm run check`. В вебе: после первого клика слышны выбор, верно, неверно, шаг ползунка (тон растёт вправо), начало Skill check, урок пройден; в консоли нет ошибок. **Попроси владельца послушать на телефоне** и проверить, что в беззвучном режиме звука нет.

**Коммит:** `Design round 1.4: interface sounds with expo-audio, one feedback module for sound and haptics`

---

## Заход 2. Урок

### 2.1 Заливка перед Skill check

**Образец:** `demos.flood` в `scripts/demo-template.html`. Описание — `docs/DESIGN.md`, раздел 6, таблица переходов.

**Файлы:** `src/lesson/screens/Simple.tsx` (`CheckIntroView`), `src/lesson/LessonPlayer.tsx`, `src/ui/parts.tsx` (`MainButton`).

**Шаги.**

1. `MainButton`: добавь тон `'white'` — белая кнопка, текст цветом `color.text`, губа `rgba(0,0,0,0.22)`.
2. `CheckIntroView` становится экраном на всю высоту плеера, поверх верхней полосы. В `LessonPlayer`, когда `item.kind === 'checkIntro'`, рисуй его как `StyleSheet.absoluteFill` последним ребёнком корневого `View` (а не внутри `ScreenEnter`), и передай ему `onClose={askToLeave}`.
3. Внутри `CheckIntroView`:
   - круг цвета `color.main`: `View` шириной и высотой `2 * R`, `borderRadius: R`, где `R = 1.2 × высота окна` (`useWindowDimensions`), центр круга — центр кнопки внизу экрана; анимируй `transform: [{ scale }]` от 0 до 1 за `motion.scene` (600 мс), кривая `Easing.inOut(Easing.cubic)`; корневой `View` с `overflow: 'hidden'`;
   - после заливки по очереди поднимаются (`Rise`): заголовок «Skill check» (белый, Space Grotesk 30), строка `${count} questions. One try each.` (белая, 16), ряд из `count` белых колец 16 pt (каждое падает сверху на 16 pt за 180 мс, с шагом 180 мс; на каждое — `feedback.step(i / count)`), внизу белая кнопка «Start» (`tone="white"`);
   - слева сверху белый × (44 × 44, `accessibilityLabel="Close the lesson"`), вызывает `onClose`;
   - `feedback.flood()` в начале заливки (если звук уже добавлен в задаче 1.4 в `useEffect` — оставь один вызов);
   - reduced motion: круг сразу в полном размере, всё содержимое сразу видно.
4. Шайбу 150 pt, которая сейчас стоит на этом экране, убери.

**Проверка в вебе.** После последнего экрана истории экран заливается цветом уровня снизу, текст белый и читается, × работает (спрашивает «Leave the lesson?»), Start ведёт к первому вопросу, тест `src/session/logic.test.ts` не менялся и проходит.

**Коммит:** `Design round 2.1: the Skill check opens with a flood of the level's colour`

### 2.2 Качание неверной карточки и штамп на Lesson complete

**Образец:** `demos.answer` (качание) и `demos.complete` (штамп).

**Файлы:** `src/ui/motion.tsx`, `src/ui/parts.tsx`, `src/lesson/LessonComplete.tsx`, `src/art/brand.ts` (только читать: функция `stamp`).

**Шаги.**

1. `motion.tsx`: компонент `Shake` по образцу `Pop` — когда `trigger` становится `true`, `translateX` проходит 0 → −7 → 6 → −4 → 0 за 380 мс (`withSequence` из четырёх `withTiming`). В `OptionCard` (`parts.tsx`) оберни карточку в `<Shake trigger={state === 'wrong'}>` рядом с существующим `Pop`.
2. `LessonComplete.tsx`: штамп поверх шайбы.
   - какой: `const gold = lesson.skillCheck.every((q) => state.outcomes[q.id] === 'independent');` → `stamp(gold ? 'independent' : 'assisted', c, reward, soonGrey)`, рисуется через `<Art xml={…} width={84} />`;
   - где: в блоке `styles.hero`, абсолютно, правее и ниже центра шайбы (в образце: шайба 110 по центру, штамп 84 со сдвигом +73 по x и +96 по y от верха шайбы), наклон −9°;
   - как появляется: через ~420 мс после приземления шайбы; `opacity 0 → 1`, `scale 2.3 → 1`, `rotate −22° → −9°` за 200 мс, кривая `Easing.in(Easing.cubic)` (ускоряется к удару); в момент окончания — `feedback.stamp()`, весь экран сдвигается вниз на 4 pt и обратно за 160 мс, жёлтое кольцо (`borderColor: reward.face`, 3 pt) расходится от штампа: `scale 0.7 → 1.5`, `opacity 0.9 → 0` за 480 мс;
   - подпись под заголовком настоящим текстом: «On your own» для золотого, «With some help» для второго. Строку честного счёта, которая уже есть на экране, не менять;
   - `accessibilityLabel` штампа — та же подпись; reduced motion: штамп сразу на месте, без сдвига экрана и кольца, звук остаётся.

**Проверка в вебе.** Неверный ответ: карточка качается и возвращается на место, шторка «Not quite» выезжает как раньше. Lesson complete с четырьмя верными с первой попытки — золотой штамп; с одной ошибкой в Skill check — штамп цвета уровня. Штамп не закрывает заголовок.

**Коммит:** `Design round 2.2: a wrong card shakes its head, Lesson complete gets a stamp`

### 2.3 Фигуры рисуют себя — сложная

**Образец:** `demos.pen`. Порядок: линии чертежа по очереди → заливки проявляются → метка центра тяжести → силы вырастают из точек приложения (рост сил уже сделан, см. `src/figures/anim.ts`).

**Файлы:** `src/figures/draw.tsx`, `src/figures/anim.ts`, `src/figures/Sheet.tsx`, затем по одной фигуре: `ScalesFigure.tsx` → `LiftFigure.tsx` → `PairsFigure.tsx`.

**Подход.**

1. В `src/figures/anim.ts` — хук `useDrawIn(active: boolean)`: shared value `t` от 0 до 1 за `motion.scene × 2` (1200 мс), `Easing.inOut(Easing.cubic)`; при reduced motion или `active === false` сразу 1.
2. В `src/figures/draw.tsx` — компонент `DrawnPath`: `Animated.createAnimatedComponent(Path)` с пропами `d`, `len` (длина пути в единицах viewBox — оценка сверху, считается руками и пишется рядом с `d`), `from`, `to` (доли 0…1 общего времени). Через `useAnimatedProps` выставляет `strokeDasharray={[len, len]}` и `strokeDashoffset = len × (1 − k)`, где `k` — доля `t` в отрезке `[from, to]`, зажатая в 0…1. Атрибут `pathLength` в react-native-svg не использовать.
3. Заливки тел: `fillOpacity` от 0 до 1 в отрезке 0.6…0.8; подписи и метка FIG не анимируются.
4. «Первое появление»: `Sheet` получает проп `drawIn?: boolean`. В `LessonPlayer` держи `useRef(new Set<string>())` с ключами фигур, которые уже показывались (ключ — `JSON.stringify(screen.fig)` без полей, меняющихся от экрана к экрану, или `fig.kind`); экран рисует фигуру с `drawIn`, только если такой ещё не было.
5. Сначала сделай **одну** фигуру (`ScalesFigure`, она самая короткая), покажи владельцу, и только после его «ок» переноси на остальные.

**Нельзя:** менять геометрию фигур; запускать прорисовку заново при движении ползунка; показывать до Check то, что вопрос скрывает (например показание весов с `reading: 'afterCheck'`).

**Проверка.** Каждая фигура урока в вебе: при первом показе чертится за ~1.2 с, при повторном показе появляется сразу; пауза и ползунок работают как раньше; reduced motion — без прорисовки.

**Коммит:** `Design round 2.3: figures draw themselves the first time they appear`

### 2.4 Общая фигура не уезжает между экранами — сложная, можно пропустить

Сейчас `ScreenEnter` сдвигает весь экран. Нужно: если у соседних экранов фигура одного вида (`fig.kind`), лист чертежа остаётся на месте, а въезжает только текст. Это требует вынести `Sheet` из экранов в `LessonPlayer`. Перед началом — режим плана и согласие владельца. Если задача затягивается дольше одной сессии — отложить: остальные задачи от неё не зависят.

---

## Заход 3. Карта

Перед любой задачей захода прочитай `src/app/index.tsx`, `src/map/PuckRow.tsx`, `src/map/layout.ts` целиком: раскладку карты считает `layout.ts`, и у неё есть тест `layout.test.ts`.

### 3.1 Предметы в конце уровней и экран «всё пройдено»

- После последней шайбы каждого уровня — предмет уровня: `object(levelObject[level.id], color, reward)` из `src/art/objects.ts`, ширина 132, по центру. Пока в уровне не пройдены все уроки с `ready: true` (или таких уроков нет) — предмет серый: вместо цвета уровня передай `soonGrey`, а вместо `reward` — серую замену `{ face: soonGrey.inner, side: soonGrey.side, lip: soonGrey.lip, pale: '#D7DBE0', soft: soonGrey.soft }`.
- Высоту секции уровня увеличь на высоту предмета в `src/map/layout.ts`; поправь `layout.test.ts`, если он проверяет высоты.
- `accessibilityLabel` предмета: `Level reward: locked` / `Level reward: earned`.
- Если пройдены все уроки с `ready: true` во всём курсе — в нижней карточке (`src/map/Dock.tsx`) вместо кнопки Start: иллюстрация `illustration('allDone', courseBlue, reward)` шириной 220 и текст «More lessons are on the way».

**Коммит:** `Design round 3.1: each level ends with its object, all-done state on the map`

### 3.2 Шарик катится к следующему уроку

**Образец:** `demos.unlock`.

- Когда пользователь возвращается с экрана Lesson complete на карту и урок только что стал `done` (сравни статус до и после; раньше он не был `done`): шайба получает галочку с `Pop`, через 260 мс жёлтый шарик (18 pt, `reward.face`, нижняя грань `reward.side`) катится от центра этой шайбы к верхней грани следующей по дуге (квадратичная кривая Безье, контрольная точка на 20 pt выше середины отрезка).
- Движение по модели: `u = t / T`, `T = 0.9 с`; путь `s = 2u²` при `u < 0.5`, иначе `s = 1 − 2(1 − u)²` (постоянное ускорение до середины, такое же замедление после). Считай в `useFrameCallback`, позицию на кривой — по формуле Безье от `s`.
- По прибытии: `feedback.unlock()`, следующая шайба меняет состояние на `current`, плитка со значком опускается над ней (уже существующая анимация).
- Если следующая шайба за пределами экрана — сначала прокрути к ней (эта логика в `index.tsx` уже есть для кнопки «к следующему уроку»).
- Reduced motion: шарика нет, состояния меняются сразу.

**Коммит:** `Design round 3.2: a ball rolls to the next lesson when one is finished`

### 3.3 Заставка по модели

**Образец:** `demos.launch` и функция `drop` там же.

- Новый компонент `src/map/Launch.tsx`, показывается поверх карты один раз за запуск приложения (не при возврате из урока): белый экран, короткая штриховка пола по центру, знак `mark(courseBlue)` шириной 120 падает сверху.
- Модель: `g = 2600 pt/с²`, коэффициент восстановления `e = 0.42`, шаг интегрирования 4 мс внутри `useFrameCallback` (несколько шагов за кадр), остановка, когда скорость после удара меньше 110 pt/с. На первые удары — `play('tap')` с убывающей громкостью (см. образец).
- После остановки: пол гаснет (200 мс), знак за 520 мс (`Easing.inOut`) переезжает на место первой шайбы уровня Motion и уменьшается до её размера, затем заставка исчезает (220 мс). Положение первой шайбы возьми из раскладки карты.
- Reduced motion: заставка не показывается.
- Общее время не больше 2.5 с; нажатие в любом месте пропускает заставку.

**Коммит:** `Design round 3.3: the launch animation drops the mark by the model`

---

## Заход 4. Блокнот и серия

### 4.1 Блокнот: карточки формул

**Образец:** `demos.notebook`. Описание экрана — `docs/DESIGN.md`, раздел 9.

1. `src/content/types.ts`: в `Lesson` добавь `card: { formula: string; idea: string }`. `src/content/rules.test.ts`: `idea` не длиннее 110 символов, `formula` не длиннее 24.
2. `src/content/normal-reaction.ts`: `card: { formula: 'N = m(g + a)', idea: 'The scales read the push of the floor, not your weight. Speed up upwards and the push grows.' }`. Формулу и текст для любого другого урока согласуй с владельцем: он проверяет физику.
3. Карточка открыта, если урок завершён (`state.finished` в сохранённом прогрессе, `src/session/storage.ts`). Отдельного хранилища не нужно.
4. Новый экран `src/app/notebook.tsx` (маршрут `/notebook`, въезжает справа): заголовок «Notebook», счётчик «N of M» моноширинным (M — число уроков курса), карточки в порядке курса. Лицо: полоска цвета уровня 8 pt, плитка урока 56 (`lessonTile`), формула (Space Grotesk 21), название урока. Нажатие переворачивает карточку (`rotateY` 0 → 180° за 500 мс, `Easing.inOut`; лицо и оборот — два `View` с `backfaceVisibility: 'hidden'`): на обороте `idea` на фоне `color.soft` и текстовая кнопка «Replay lesson». После открытых карточек — одна закрытая: пунктирная рамка, `object('lock', soonGrey, reward)` шириной 44 и «Finish **<название следующего урока>** to add its card.»
5. Пустое состояние: `illustration('notebookEmpty', courseBlue, reward)` шириной 260, «Finish a lesson to get its card.», главная кнопка «Go to the map».
6. Вход: в шапке карты (`src/app/index.tsx`) кнопка-иконка `uiIcon('notebook')`, 44 × 44, `accessibilityLabel="Notebook"`.
7. Карточка — кнопка: `accessibilityRole="button"`, `accessibilityLabel` = формула и название; оборот читается после переворота.

**Коммит:** `Design round 4.1: the notebook collects one formula card per finished lesson`

### 4.2 Серия дней: волчок

1. Чистая логика, новый файл `src/session/streak.ts`, без React и без хранилища:
   ```ts
   /** Days with at least one finished lesson, as local dates 'YYYY-MM-DD', oldest first, no repeats. */
   export type Streak = { days: string[] };
   export const emptyStreak: Streak = { days: [] };
   export function dayKey(d: Date): string; // local date, not UTC
   export function addDay(s: Streak, today: string): Streak; // adds today once, keeps the last 400 days
   /** count: days in a row ending today or yesterday (0 if the last day is older). spinning: today is in. */
   export function currentRun(s: Streak, today: string): { count: number; spinning: boolean };
   export function longestRun(s: Streak): number;
   export function parseStreak(json: string | null): Streak; // broken data → emptyStreak
   ```
2. Тесты `src/session/streak.test.ts` (сначала тесты, потом код): первый день → 1; два дня подряд → 2; тот же день дважды → не растёт; пропуск дня → `count` 0, `longestRun` помнит рекорд; вчера был, сегодня ещё нет → `count` прежний, `spinning: false`; переход через конец месяца и года; `dayKey` использует местную дату.
3. Хранение — в `src/session/storage.ts` (единственный файл, который трогает хранилище): `loadStreak()` и `saveStreak()` под ключом `streak/v1`.
4. День добавляется в момент, когда урок завершён (там же, где сохраняется `finished`; найди в `src/app/lesson/[id].tsx`).
5. Чип в шапке карты: `object('top', courseBlue, reward)` шириной 28 и число дней; если `count === 0` и история не пуста — `object('topResting', …)` без числа. `accessibilityLabel`: `${count} days of momentum` / `Momentum paused`.
6. По нажатию — шторка снизу (по образцу `src/lesson/LeaveSheet.tsx`): волчок 96, «N days of momentum», подпись «It stays up while it spins.» или «Paused. Finish a lesson to spin it up again.», ряд из 7 кружков последней недели (закрашен `reward.face` — день был; кольцо `palette.line` — не было; сегодня обведён `palette.ink`), «Longest: N days».
7. Никаких очков, «заморозок» и слов «lost» или «broken».

**Коммит:** `Design round 4.2: a day streak shown as a spinning top, kept on the device`

### 4.3 Карточка и волчок на Lesson complete

**Образец:** вторая половина `demos.complete`.

После строки честного счёта на `LessonComplete`:
1. карточка «NEW IN YOUR NOTEBOOK» (метка моноширинным 11) с плиткой урока 64 и `lesson.card.formula`; появляется наклоном (`rotateX −70° → 0`, 460 мс) со звуком `feedback.unlock()`; показывается, только если урок завершён впервые;
2. строка серии: волчок 54 и «N days of momentum»; если сегодня первый урок за день — волчок качается (`rotate −9° → 7° → −4° → 2° → 0` за 900 мс), `feedback.spin()`, число меняется с N−1 на N с лёгким увеличением;
3. главная кнопка: «Next lesson», если следующий урок с `ready: true` есть; иначе «Back to the map».

Reduced motion: всё сразу на месте.

**Коммит:** `Design round 4.3: Lesson complete adds the notebook card and the momentum top`

---

## Заход 5. Тёмная тема и настройки

### 5.1 Тёмная тема

1. `src/theme/ThemeContext.tsx`: настоящий контекст. `mode: 'light' | 'dark' | 'system'` (по умолчанию `'system'`, читается `useColorScheme()`), хранится в `storage.ts` под ключом `prefs/v1`. `useTheme()` возвращает `{ palette, dark, mode, setMode }`, где `palette` — `palette` или `darkPalette`.
2. `app.config.ts`: `userInterfaceStyle: 'automatic'`. `StatusBar` в `_layout.tsx`: `style={dark ? 'light' : 'dark'}`; фон `Stack` — `palette.page` из темы.
3. Найди все прямые импорты цветов мимо темы: `grep -rn "import.*palette.*from '@/theme/tokens'" src` и `grep -rnE "#[0-9A-Fa-f]{6}" src --include=*.tsx`. Каждый цвет интерфейса должен приходить из `useTheme()`. Исключения: `levelColors`, `reward`, белый на цветных кнопках.
4. Иллюстрациям в тёмной теме передавай `darkNeutral` (`src/art/illustrations.ts`), а в `Tone.soft` — `darkPalette.selectBg`.
5. Пройди **каждый** экран в обеих темах (карта, все экраны урока, шторки, Lesson complete, блокнот, шторка серии) со скриншотом; силы на тёмной бумаге — `darkPalette.force`.

**Коммит:** `Design round 5.1: dark theme across every screen`

### 5.2 Экран Settings

Маршрут `/settings`, вход — иконка `uiIcon('settings')` в шапке карты. Строки: Sound (переключатель → `setSoundEnabled`), Haptics (переключатель; добавь такой же флаг в `haptics.ts`), Appearance (System / Light / Dark), Reduced motion (читается из системы, показывается как факт: «Follows your phone's setting»), Reset progress (спрашивает подтверждение шторкой, главная кнопка «Keep my progress», тихая «Reset»), Send feedback (пока скрыта: адреса формы нет). Всё хранится в `prefs/v1`. Переключатель: бегунок едет 160 мс без отскока, `accessibilityRole="switch"`.

**Коммит:** `Design round 5.2: settings for sound, haptics and appearance`

---

## Заход 6. Приветствие

Делается вместе с онбордингом полного MVP (`docs/PLAN.md`, раздел 2.1). Образец — `demos.spring`: шайба на пружине, `a = −(k/m)·x − (c/m)·v`, `k/m = 150 с⁻²`, `c/m = 5.2 с⁻¹`, шаг 4 мс, перетаскивание через Gesture Handler. Задача будет расписана, когда дойдёт очередь.
