# Контекст проекта — выжимка стартового обсуждения (1 ноября 2026)

Это итог разговора владельца с Claude перед стартом разработки. Детальный план — в `docs/PLAN.md`. Здесь — **почему** приняты решения и что важно владельцу.

## Кто владелец и чего он хочет
- Егор, ученик A level (Edexcel International A Level, сильная школа на Кипре), силён в физике (IYNT), разработчиком себя не считает.
- Работает один, **~2 часа в неделю**. Код пишет Claude Code; Егор принимает решения, проверяет физику, смотрит на телефоне, тестирует на одноклассниках.
- Цель на ближайшие месяцы — **сильный кейс для поступления** (реальные пользователи + данные). Потом — развивать как бизнес и монетизировать.
- Срок MVP — **2 месяца** (до 10 недель с резервом). Потом — продвижение через Instagram (условно бесплатный трафик, креативы из сцен приложения).
- Бюджет на MVP — $0; Apple Developer и Google Play оплатит, когда понадобится.
- Ориентир по ощущениям — **Brilliant** (анимации, интерактив) и **Duolingo** (короткие сессии, ясный следующий шаг). Главное для него — **реально классные анимации и дизайн** и **реально интересные, захватывающие уроки**.

## Как пришли к решениям
- **Широкая «платформа по физике для всех» отклонена:** у такой аудитории нет канала и нет срочной боли, за которую платят. Нужна узкая цель.
- **Первый экзамен — Edexcel IAL Unit 1 (WPH11), а не AP:** владелец сам его сдаёт, одноклассники — готовый пилот. AP Physics 1 (США, платёжеспособнее) — второй маршрут позже на том же ядре физики.
- **Почему есть шанс:** Brilliant даёт популярную физику, а не подготовку к экзамену; приложения для подготовки — скучные банки вопросов. Мы — «понимание как в Brilliant + честная подготовка к экзамену».
- **Expo / React Native**, а не PWA и не чистый веб: владелец хочет приложение в App Store / Google Play; Expo даёт iOS + Android + веб из одного кода.
- **Уровень — экзаменационный (Intermediate) по умолчанию + challenge-шаги во всех уроках:** владелец боится, что уроки будут слишком лёгкими для сильной школы.
- **Онбординг с адаптивной оценкой уровня + вход в аккаунт в конце** — идея владельца. Принято с условиями: тест на интерактивных сценах (это и есть первое «вау»), ≈ 90 секунд, `Skip` всегда; вход можно пропустить, прогресс хранится в анонимном аккаунте и не теряется.
- **Heatmap активности** — пожелание владельца (неделя на главном, полная сетка в Progress).
- Объём MVP владелец **резать не хочет** (5 уроков, 12–15 вопросов Practice, challenge везде). При отставании сначала тратим резерв недель.

## Старый проект — не переносим
- Предыдущая версия: `/Users/egor/Documents/Codex/newproject` (делалась с ChatGPT/Codex). **Владелец решил начать заново, ничего оттуда не жалко.** Не открывать без прямой просьбы.
- Уроки, которые стоит учесть, чтобы не повторить ошибки:
  - документации было в разы больше, чем продукта (огромные AGENTS.md / PLAN.md, галереи макетов, процессы для больших команд) → **держим документы короткими**;
  - три смены направления за месяц → **держимся плана**, меняем только по решению владельца;
  - в git не было ни одного коммита → **коммитим после каждого проверенного шага**;
  - дизайн выглядел шаблонно: блёклый зелёный, маленькая статичная схема в рамке, экран занят текстом → **сцена — главная на экране, насыщенные осмысленные акценты**;
  - владелец критиковал: «на такое даже пятиклассник ответит», «анимки кринжовые и цвета блеклые» → **без элементарщины и без бессмысленных анимаций**.
- Что владельцу нравилось: светлый чистый интерфейс, крупная типографика, точные связанные графики, задача про относительное движение (момент наибольшего сближения) как пример содержательного уровня.

## Как владелец любит работать
- Общение по-русски, коротко и по делу; интерфейс и контент — по-английски.
- Сначала план этапа, потом код. Если просит только обсудить — не реализовывать.
- Работать в рамках текущего этапа; не расширять scope молча.
- Показывать реальный результат (экран, телефон), а не «тесты прошли».
- Честно различать: идея / согласовано / сделано / проверено. Не выдумывать отзывы, метрики и интервью.
- Название «Physicsapp» — временное (придумал прежний ассистент); имя хранится в одной константе.

## Что дальше
1. Первый коммит и push в https://github.com/egorVVVolo/physicsapp.
2. M1 из `docs/PLAN.md`: Expo-проект, структура, дизайн-токены, 2–3 варианта визуала шага урока и направление движения — через плагин `frontend-design`, проверка на реальном телефоне.

## Решения после 1 ноября (lessons, animations)

### Lessons (decided 4 Nov)
- Lesson ≈ 15 minutes, one idea, three chapters: See it → Build it → Exam it.
- Target novice: comfortable with algebra, weak on physics formulas, little physics knowledge.
- Two paths inside each lesson: novice = worked example → faded → solo; intermediate = problem first,
  example only on error. Both meet at the same exam-style finish. Challenge step in every lesson.
- The app always does the arithmetic once the learner has chosen the relation and values.
- No voice-over. Short text synced with animation.
- Spaced Review (1 · 3 · 7 · 21 days) is in the MVP.
- Every lesson is written first as a spec (template in LESSON_FRAMEWORK.md, section 13),
  reviewed by Egor, then built. Lesson 2 is fully specified there as the reference lesson.
- Official source: Pearson Edexcel IAL Physics specification, Issue 3 (Unit 1 Mechanics statements 1–7, 11).

### Animations (4 Nov)
- Lesson scenes are code-driven: one physics model + one clock `t` drive the object, graphs and arrows
  (Reanimated + Gesture Handler + SVG; Skia only if fps is poor on Android).
- Brilliant uses Rive for characters/celebrations. Rive needs a development build and a designer;
  not in the MVP.
- Motion rules: direct manipulation, springs for UI, choreographed sequences, continuity, every motion
  explains physics, haptics on key moments.

### Open technical risk — check first in milestone 1
- Expo docs (July 2026) say the store version of Expo Go supports an older SDK than the latest.
  If true, "latest SDK + Expo Go" won't work and a development build is needed from milestone 1.

### Working style
- Egor wants Claude to research and look things up on its own, without asking first.
