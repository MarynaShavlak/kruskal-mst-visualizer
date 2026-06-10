# План рефакторингу: усунення форку Kruskal ↔ Floyd-Warshall

> Контекст: екрани `algorithms/floyd-warshall/{editor,learn,playback}` були зроблені
> копіюванням із `kruskal/`. Платформа (`registry`/`types`/`use-route`/`features/shell`)
> і ядро `lib/` — чисті й добре абстраговані; дублювання зосереджене в UI-шарі та сторах.
> Цей документ ведемо між сесіями: позначай статус фаз тут.

## Мета і не-цілі

**Мета:** винести ідентичні/майже-копії та спільні каркаси у `src/algorithms/shared/`,
щоб правка плеєра/навчання/стору робилася в одному місці, а 3-й алгоритм додавався
тонкою конфігурацією.

**Свідомі НЕ-цілі (щоб не переінженерити):**
- НЕ уніфікувати `trace.ts` і `floydWarshallTrace.ts` — форми `Frame`/`Sub` принципово різні,
  спільне лише проставляння `i`. Лишаємо дві моделі.
- НЕ зливати `GraphView`/`highlight` (справжня специфіка алгоритму).
- НЕ чіпати `lib/` (ядро чисте, без React) і деплой/`base-path`.

## Цільова структура

```
src/algorithms/shared/
  playback/  player.ts · use-player.ts · PlayerControls.tsx · Panel.tsx ·
             CodePanel.tsx · use-shiki-lines.ts · PlayerShell.tsx (нове)
  learn/     use-scroll-spy.ts · use-shiki-html.ts · MarkdownCode.tsx ·
             TableOfContents.tsx · learn-content.ts (factory) · LearnView.tsx (нове)
src/store/   create-graph-store.ts (factory)
```

Рішення: спільне живе в `algorithms/shared/` (паралельні import-шляхи; інваріант «`lib/` без React» не порушується).

## Принципи виконання
- Кожна фаза — окремий атомарний коміт; після неї `npm test` і `npm run typecheck` зелені.
  Це behavior-preserving рефакторинг — поведінка не змінюється.
- Автор комітів — Maryna Shavlak, без Claude co-author.
- Тести запускати з Node 22 (свіжа оболонка дефолтиться на 18).
- Порядок — за зростанням ризику.

---

## Фаза A — переноси «копія-в-копію» (🟢 ризик мінімальний) — ✅ ВИКОНАНО

Файли, що відрізняються лише import-шляхом або 0-diff, переїжджають у `shared/` дослівно.

Переносяться: `playback/{player, use-player, PlayerControls, Panel, use-shiki-lines}`,
`learn/{use-scroll-spy, use-shiki-html, MarkdownCode}`.

> Примітка: `learn/TableOfContents` перенесено у Фазу B — воно імпортує тип `TocEntry`
> з `learn-content`, який стає спільним лише у Фазі B.

**Верифікація:** `tsc -b` + `npm test` (`player`, `highlight`, `learn-content`).
**Коміт:** `Рефакторинг: спільний шар algorithms/shared — перенос ідентичних плеєр/навчання модулів`

## Фаза B — злиття «надмножина / factory» (🟢 низький) — ✅ ВИКОНАНО
- `CodePanel.tsx` → версія Флойда (надмножина: опційні `contextLines` + проп `title`) у `shared/playback/`.
- `learn-content.ts` → у `shared/learn/`: `parseToc`, типи `Lang`/`TocEntry`, фабрика `makeLearnContent(uaRaw, enRaw)`.
  У кожного алгоритму лишається 3-рядковий модуль зі своїм raw-markdown.
- `TableOfContents.tsx` → `shared/learn/` (тепер `TocEntry` спільний).

**Коміт:** `Рефакторинг: спільні CodePanel і фабрика learn-content`

## Фаза C — спільний `LearnView` (🟡 низько-середній) — ✅ ВИКОНАНО
`shared/learn/LearnView.tsx` з пропсами `{ content: {ua,en}, figureForSrc }`. README-href уніфікувати
(`README.ua.md | README.md` → UA, `README.en.md` → EN). Кожен алгоритм — тонка обгортка, що інжектить свій `figureForSrc`.

**Коміт:** `Рефакторинг: спільний LearnView з інжекцією figureForSrc`

## Фаза D — спільний каркас плеєра `PlayerShell` (🟡 середній; найбільший зиск) — ✅ ВИКОНАНО
`shared/playback/PlayerShell.tsx`, generic за `F extends { caption: string }`. Володіє лише
`usePlayer` + `PlayerControls` + рядком-нарацією; решта — слоти:
```
{ frames, resetKey, headerExtra?, captionBadge?, panels(f,player), secondRow?(f,player) }
```
`SinglePlayer` (Краскал) і тіло FW-`PlaybackView` стають тонкими обгортками. `ResultCard`,
`DecisionTable`/`RelaxationLog`, статистики лишаються по-алгоритмними у слотах.

**Верифікація:** smoke-тест рендера `PlayerShell` + ручна перевірка обох плеєрів (вкл. режим «Порівняння»).
**Коміт:** `Рефакторинг: спільний PlayerShell для обох плеєрів`

## Фаза E — фабрика стору (🟡 середній) — ✅ ВИКОНАНО
`store/create-graph-store.ts`: інжектиться graph-модель, `isValidWeight` (Краскал: ціле >0; FW: будь-яке ціле),
`initialPreset`, `presets`. Публічний API `useGraphStore`/`useDirectedGraphStore` не змінюється.
Запобіжник — наявні `graph-store.test`, `presets.test`.

**Коміт:** `Рефакторинг: generic-фабрика стору графа`

## Фаза F — редактор (🟠 вищий ризик; останнім, можна відкласти) — ✅ ВИКОНАНО
Виносимо лише невізуальне. Рендерери вузлів/ребер, бокові панелі й пресети — по-алгоритмні.

- **Підкрок 1 — `graph-doc` codec ✅ ВИКОНАНО.** `shared/editor/graph-doc.ts` —
  спільний `createGraphDocCodec(model)` (JSON import/export + base64url-шаринг через
  URL-хеш `?g=`). Wire-формат збережено дослівно (шаринг-URL сумісні); graph-модель
  (як читати ребра / перебудовувати граф) інжектиться. Покрито `graph-doc.test` обох.
- **Підкрок 2 — хук-контролер синку store↔React-Flow ✅ ВИКОНАНО.**
  `shared/editor/use-graph-editor.ts` — `useGraphEditor({store-ядро, codec,
  promptWeight, exportFilename, routePath})`. Бере на себе всю ідентичну механіку:
  стан/синк вузлів, одноразове завантаження `?g=`, drag/delete/редагування ваги,
  add-vertex, import/export/share. Алгоритмо-специфічне лишилось у view: рендер ребер
  (через повернутий `setRfEdges`), `onConnect` (правила з'єднання), тулбар/панелі/пресети.
  `EditorView` обох: 310/361 → 179/225 рр. Пура-функція `readGraphParam` покрита тестом
  (решта хука потребує React-Flow-контексту). Запобіжник — typecheck + прод-білд.

**Коміти:** `Рефакторинг: спільна серіалізація графа в редакторі (graph-doc codec)` ·
`Рефакторинг: спільний хук-контролер редактора (store↔React Flow)`

## Фаза G — прибирання (🟢) — ✅ ВИКОНАНО
- Видалити застарілий стаб `store/index.ts` або зробити barrel.
- Оновити секцію «Архітектура» в `CLAUDE.md` (задокументувати `algorithms/shared/`).

**Коміт:** `Прибирання: barrel стору + опис shared-шару в CLAUDE.md`

---

## Статус

| Фаза | Суть | Ризик | Статус |
|---|---|---|---|
| A | переноси копій | 🟢 | ✅ ВИКОНАНО |
| B | CodePanel + learn-content factory + TableOfContents | 🟢 | ✅ ВИКОНАНО |
| C | спільний LearnView | 🟡 | ✅ ВИКОНАНО |
| D | PlayerShell | 🟡 | ✅ ВИКОНАНО |
| E | фабрика стору | 🟡 | ✅ ВИКОНАНО |
| F | редактор: graph-doc codec + хук-контролер useGraphEditor | 🟠 | ✅ ВИКОНАНО |
| G | прибирання | 🟢 | ✅ ВИКОНАНО |
