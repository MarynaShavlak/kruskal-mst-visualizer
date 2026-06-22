# План рефакторингу №2: дедуплікація родин сортувань/пошуків/рядкових

> Контекст: попередній `docs/refactoring-plan.md` (фази A–G, ✅ усі виконані) уніфікував
> лише **графову трійку** (Краскал / Прим / Флойд–Воршал): спільний `algorithms/shared/`,
> `create-graph-store`, `PlayerShell`, `LearnView`, `graph-doc` codec, `use-graph-editor`.
> Відтоді на платформу додали ще **16 алгоритмів** (7 сортувань, 4 пошуки в масиві,
> 4 рядкові пошуки, рюкзак) — кожен «вертикальною копією». Та сама дедуплікація тепер
> потрібна **другим заходом** для цих родин, причому дублювання просочилося і в `lib/`,
> який план №1 свідомо не чіпав.
>
> Документ ведемо між сесіями: познач статус фаз у таблиці внизу.

## Діагноз

Архітектура здорова: ядро `lib/` чисте (без React), є робочі абстракції (`trace`-модель,
`Translate`-інжекція, `graphCore`, `PlayerShell`, `graph-doc`). Проблема не в дизайні, а в
**горизонтальному копіюванні** при додаванні кожного нового алгоритму родини. Шаблон
«додати алгоритм» наразі = скопіювати сусідній і замінити специфіку, тож спільний код
розповзся по 15–16 копіях.

### Мапа дублювання (цифри перевірені на коді)

| Шар | Файли | Що повторюється | Орієнтовний зайвий код |
|---|---|---|---|
| **Стори** | 15 (7 sort + 4 array-search + 4 string) | `clampValue`/`sanitize`/`addValue`/`updateValue`/`removeValue`/`setValues`/`loadDoc`/`toDoc` майже байт-у-байт; різняться лише пресети + `target`/`step`/`sortValues` | ~800 рр. |
| **Редактори** | 11 `ArrayEditor.tsx` + `EditorView.tsx` | `NumberField` (≈30 рр., 100% копія), сітка інпутів, тулбар пресетів/import/export/share | ~850 рр. |
| **Плеєри** | 14–16 `PlaybackView.tsx` | `Run`-тип (`empty`/`too-big`/`ok`), `ResultCard`-каркас, `StatsBar`/`Stat`, `ModeSwitch`, `PhaseBadge` | ~1300 рр. |
| **lib трасування** | ~14 `*Trace.ts` | `fmt = a => \`[${a.join(", ")}]\`` (×10), `push`-замикання з `i: frames.length`, `t: Translate = identityTranslate` (×22), однакові базові поля `Frame` | ~400–550 рр. |
| **lib приклади/пресети** | `example*.ts`, `*-presets.ts` | спільні типи `SearchCase`/`StringSearchCase` — **вже виділені** ✓; `mulberry32` PRNG дубльований у 4 рядкових пресетах | ~80 рр. |
| **Реєстр** | 20 `index.ts` | однакова обгортка `lazy(() => import(...).then(m => ({ default: m.View })))` × 3–4 на алгоритм | ~600 рр. (у `index.ts`, не в `registry.ts`) |

## Мета і не-цілі

**Мета:** поширити філософію `shared/` + фабрик з графової трійки на родини
сортувань/пошуків/рядкових; правка стору/редактора/плеєра має робитися в одному місці,
а новий алгоритм родини — додаватися тонкою конфігурацією, а не копією сусіда.

**Свідомі НЕ-цілі (щоб не переінженерити):**
- **НЕ** розбивати `i18n/messages.ts` на per-algorithm файли (Фаза O нижче — відкладено).
  Типізована UA/EN-парність уже ловить помилки; UA-рядки **асертяться байт-у-байт** у
  тестах → багато ризикованого механічного churn за малий структурний зиск.
- **НЕ** зводити всі `Frame` до одного типу. Набори полів родин (а часом і всередині родини)
  **принципово різні**; уніфікуємо лише боілерплейт-каркас (`i: frames.length`, снапшот,
  `fmt`, базові спільні поля), а не семантику Frame.
- **НЕ** зливати алгоритмо-специфічні візуальні панелі (бари / комірки / кошики / стрічка /
  дерево рекурсії / пряма-модель) — це справжня специфіка, лишається у слотах.
- **НЕ** чіпати `lib/`-алгоритми (чисті, тестовані) інакше, ніж винесенням спільних утиліт.
- **НЕ** чіпати деплой / `base-path` / wire-формат шаринг-URL.

## Принципи виконання

- Кожна фаза — окремий **атомарний коміт**; після неї `npm test` і `npm run typecheck`/`tsc -b`
  зелені. Це **behavior-preserving** рефакторинг — поведінка не змінюється.
- Запобіжники — наявні `*-store.test`, `presets.test`, `*Trace.test`, golden-кадри
  (кількість кадрів/порівнянь з еталонів). Поведінкою вважаємо і **байт-у-байт UA-нарацію**.
- Автор комітів — Maryna Shavlak, без Claude co-author.
- Тести запускати з **Node 22** (свіжа оболонка дефолтиться на 18).
- Порядок — за співвідношенням зиск/ризик; Tier 1 спершу.

---

## TIER 1 — високий зиск, низький ризик

### Фаза H — фабрики сторів (🟢) — ✅ ВИКОНАНО

Точна аналогія наявного `graphCore` (`store/create-graph-store.ts`): спільне ядро мутацій
повертає об'єкт, який спредиться у `create<S>()((set, get) => ({ ...core, ...пресет-лоадери }))`.
Пресет-лоадери лишаються **inline і тип-безпечні** в кожному сторі (без computed-ключів —
вони store-специфічні: `loadMain`/`loadIntro`/`loadDuplicates`/`loadRandom` тощо).

Три фабрики:
- `store/create-array-store.ts` → `arrayCore(cfg, set, get)` для **7 сортувань** (`{ values }`).
- `store/create-search-store.ts` → `searchCore(cfg, set, get)` для **4 пошуків у масиві**
  (`{ values, target }`).
- `store/create-string-store.ts` → `stringCore(cfg, set, get)` для **4 рядкових**
  (`{ text, pattern }`).

Що **інжектиться** конфігом (бо реально різниться):
- правило клампа (radix: `≥ 0`; решта: будь-яке ціле);
- `keepSorted` для `addValue` (binary / indexed / interpolation вставляють зі збереженням
  відсортованості; linear — ні);
- опційні `sortValues` (3 стори: binary / interpolation / indexed) і `step` + `setStep`
  (лише indexed-sequential).

Ескіз (масивне ядро):
```ts
export interface ArrayCoreCfg {
  clamp?: (v: number) => number          // дефолт: trunc; radix: max(0, trunc)
}
export function arrayCore(cfg, set, get) {
  const clamp = cfg.clamp ?? truncClamp
  return {
    addValue: () => set((s) => ({ values: [...s.values, nextSeeded(s.values.length)] })),
    updateValue: (i, v) => set((s) => /* guard + map */),
    removeValue: (i) => set((s) => /* guard + filter */),
    setValues: (vs) => set({ values: vs.map(clamp) }),
    clear: () => set({ values: [] }),
    loadDoc: (d) => set({ values: d.values.map(clamp) }),
    toDoc: () => ({ values: get().values }),
  }
}
```
Конкретний стор:
```ts
export const useBubbleSortStore = create<BubbleSortState>()((set, get) => ({
  ...bubbleIntroPreset(),
  ...arrayCore({}, set, get),
  loadIntro: () => set(bubbleIntroPreset()),
  loadBest:  () => set(bubbleBestPreset()),
  loadWorst: () => set(bubbleWorstPreset()),
  loadRandom: (seed) => set(bubbleRandomPreset(seed)),
}))
```

**Зиск:** 15 сторів (~800 рр. дубля) → 3 фабрики + тонкі обгортки (~73% менше).
**Верифікація:** наявні `*-store.test` / `presets.test` (публічний API `useXxxStore` без змін).
**Коміт:** `Рефакторинг: generic-фабрики сторів масиву/пошуку/рядка`

> **Підсумок виконання.** Створено `create-array-store.ts` (`arrayCore` + спільні
> `arrayValueActions`/`intClamp`/`nonNegIntClamp` для 7 сортувань), `create-search-store.ts`
> (`searchCore` для linear/binary/interpolation), `create-string-store.ts` (`stringCore` для
> 4 рядкових). 15 сторів переписано на тонкі обгортки (ядро + пресет-лоадери), повторюючи
> ідіому `graph-store` (`extends *Core`, Doc — аліас). Специфіка лишилась тонко поверх:
> `sortValues` інлайн у binary/interpolation; indexed-sequential через `arrayValueActions`
> напряму + ручний glue для `target`/`step` (його doc несе крок, несумісний із `SearchCore`).
> **Чисто −322 рр.** (15 сторів: 761 видалено / 211 додано = −550; фабрики +228), логіка
> мутацій тепер single-source. `tsc -b` чистий · `npm test` 1126/1126 · прод-білд ОК.

### Фаза I — спільний `ArrayEditor` + `NumberField` (🟢🟡) — ✅ ВИКОНАНО

`algorithms/shared/editor/ArrayEditor.tsx` + винесений `NumberField` (parse/commit логіка —
зараз 100% копія в 11 файлах). Generic за стор-хуками (`values`/`updateValue`/`removeValue`)
та i18n-префіксом; слот `renderExtra` для поля `target` (пошуки) і `step` (indexed).
Рядкові 4 — **не чіпаємо**: вони вже на спільному `TextPatternEditor` (зроблено).

**Зиск:** 11 копій `ArrayEditor` (~850 рр.) → 1 спільний + тонкі обгортки.
**Верифікація:** `tsc -b` + прод-білд + ручна перевірка редактора одного сортування й
одного пошуку (зокрема `target`/`step` і кнопка «Відсортувати»).
**Коміт:** `Рефакторинг: спільний ArrayEditor + NumberField`

> **Підсумок виконання.** Створено презентаційний `algorithms/shared/editor/ArrayEditor.tsx`
> (184 рр.) з єдиним `NumberField` (узагальнений із найповнішого — індексного: `tone`
> rose/violet, `min`-кламп, `className`-ширина). 11 редакторів (7 сортувань + 4 пошуки в
> масиві) → тонкі обгортки (стор + i18n-ключі через пропси). Пошуки додають верхній ряд
> `fields` (ціль 🌹; indexed — ще крок 🟣 ≥1). Рядкові 4 не чіпали (вже `TextPatternEditor`).
> Розмітку/класи/HTML-`min`/ширини (sorts `w-14`, radix+пошуки `w-16`) збережено байт-у-байт;
> єдина зміна DOM — одиночне поле пошуку дістало нешкідливий зовнішній flex-обгортковий div
> (візуально ідентично). **Чисто −495 рр.** (11 обгорток: 855 видалено / 176 додано = −679;
> спільний +184). `tsc -b` чистий · `npm test` 1126/1126 · прод-білд ОК. `EditorView` не
> чіпали (виклик `<ArrayEditor />` без пропсів незмінний).

### Фаза J — playback-«kit» (🟡; найбільший зиск) — ✅ ВИКОНАНО

Винести у `algorithms/shared/playback/` повторювані не-візуальні шматки плеєра (зараз
скопійовані у 14–16 `PlaybackView`):
- `ResultCard` — каркас Card+CardContent (поля-статистики лишаються у слоті);
- `StatsBar` + `Stat` (100% копії);
- `ModeSwitch` — приймає `options: { key, label }[]` (різняться лише i18n-ключі);
- `PhaseBadge` — приймає `Record<Phase, { text; cls }>` (різниться лише мапа кольорів);
- **хук `useAlgorithmRun(buildTrace, maxSize)`** — інкапсулює `Run`-тип
  (`empty`/`too-big`/`ok`) + fallback-UI для порожнього/завеликого входу (повторено 16×).

Алгоритмо-специфічна **візуальна панель** (бари/комірки/кошики/стрічка/дерево) лишається
у слоті — рівно як уже працює `PlayerShell` для графів.

**Зиск:** ~1300 рр. боілерплейту → спільні компоненти + хук.
**Верифікація:** патерн `PlayerShell.test`; ручна перевірка по одному плеєру з кожної
родини (сортування / пошук у масиві / рядковий), вкл. перемикач режимів і `too-big`.
**Коміт:** `Рефакторинг: спільний playback-kit (ResultCard/StatsBar/ModeSwitch/PhaseBadge + useAlgorithmRun)`

> **Підсумок виконання.** Створено `shared/playback/`: `Stats.tsx` (`StatsBar`+`Stat`,
> 100% копії), `ModeSwitch.tsx` (generic перемикач: опції/підпис через пропси, `wrapButtons`
> для довгих підписів — merge/quick/shell), `use-trace-run.tsx` (`TraceRun`-тип + `useTraceRun`
> мемо-trace + `TraceFallback` карта порожній/завеликий, слот `headerExtra` для перемикача).
> Мігровано всі 15 не-графових плеєрів (7 сортувань + 4 пошуки в масиві + 4 рядкові).
> **Свідоме звуження проти первісного опису:** `PhaseBadge` і `ResultCard` лишив локальними
> — їхня спільна частина мала (бейдж — 6-рядковий span), а вміст (мапа фаз, поля результату,
> розкладки) суто алгоритмо-специфічний; винесення дало б малий зиск за помітний churn на
> коді без юніт-тестів. **Виняток:** `rabin-karp` має 3-тю передумову (`too-long`), несумісну
> з `useTraceRun` → тримає власний `Run`/fallback, виніс лише `StatsBar`/`Stat`/`ModeSwitch`.
> Графові плеєри + knapsack (інша архітектура — SinglePlayer/CompareView) не чіпав.
> Розмітку/класи збережено. **Чисто −458 рр.** (15 плеєрів: 924 видалено / 332 додано = −592;
> kit +134). `tsc -b` чистий · `npm test` 1126/1126 · прод-білд ОК.
> ⚠️ Плеєри без юніт-тестів — варто колись очима глянути по одному з кожної родини.

### Фаза K — дрібні lib-утиліти (🟢; нульовий ризик, незалежна) — 🔲 НЕ ПОЧАТО

Можна робити будь-коли, не залежить від H–J:
- `lib/format.ts` → спільний `fmt(a) = \`[${a.join(", ")}]\`` (зараз ×10, подекуди як `fmtArray`).
- `lib/prng.ts` → спільний `mulberry32` (зараз дубльований у 4 рядкових пресетах).
- `lib/test/traceInvariants.ts` → `assertTraceInvariants(trace)`: послідовний `i`,
  перший кадр `init`, останній `done`, непорожній `caption`. Додає по 1 рядку в кожен
  `*Trace.test` замість ручного перебору кадрів.

**Верифікація:** `npm test` зелений (чисте винесення/додавання).
**Коміт:** `Рефакторинг: спільні lib-утиліти fmt/prng + assertTraceInvariants`

---

## TIER 2 — середній зиск/ризик (по готовності Tier 1)

### Фаза L — реєстр `figureForSrc` для навчальних фігур (🟡) — 🔲 НЕ ПОЧАТО

Механіка «`split('/').pop()` → зняти розширення → regex `^step_(\d+)$` → інакше switch за
ім'ям» **ідентична** у 14 не-графових `figure-widgets`. Винести єдиний
`figureForSrc(registry, stem, caption)` у `shared/learn/`; кожен алгоритм дає лише
`{ widgetsByName, exampleData }`. Багато рядків, але потребує ручної звірки кожної фігури
(тому Tier 2, а не 1).
**Верифікація:** ручний рендер навчальної вкладки + наявні learn-тести.
**Коміт:** `Рефакторинг: спільний реєстр figureForSrc для навчальних фігур`

### Фаза M — generic `SearchTraceBuilder` + базові `Frame`-інтерфейси (🟡; по-одному) — 🔲 НЕ ПОЧАТО

**Чесний обсяг:** виносимо лише боілерплейт-каркас, а **не** весь Frame (поля родин різні).
- `lib/searchTraceBuilder.ts` — крихітний білдер: централізує `i: frames.length` + снапшот
  входу (`array`/`target` або `text`/`pattern`), віддає `{ frames, result }`.
- Спільні базові інтерфейси: `ArraySearchFrameBase` / `StringSearchFrameBase` /
  (опц.) `SortFrameBase` з полями `i` · `array`|`text`+`pattern` · `target` · `lines` ·
  `contextLines` · `caption`. Конкретний Frame `extends` базу й додає своє.

Робити **по одному алгоритму** з golden-тестами (кількість кадрів/порівнянь з еталонів) як
запобіжником, бо зачіпає найгарячіший за коректністю код.
**Верифікація:** `*Trace.test` кожного мігрованого алгоритму без змін очікувань.
**Коміт (на алгоритм):** `Рефакторинг: <algo> trace на спільний SearchTraceBuilder/базу Frame`

### Фаза N — хелпер `createAlgorithm(...)` для `index.ts` (🟢) — 🔲 НЕ ПОЧАТО

Однакова lazy-обгортка views (`learn`/`editor`/`playback`/`benchmark`) повторюється у 20
`index.ts`. Хелпер `createAlgorithm({ id, name, shortName, tagline, category, status, icon,
defaultTab, tabKeys })` сам будує lazy-імпорти за списком вкладок (шлях виводиться з `id`).
Кожен `index.ts`: ~45 → ~8 рр. `registry.ts` (60 рр.) і `types.ts` лишаються як є.
**Верифікація:** `tsc -b` + smoke роуту (каталог → алгоритм → кожна вкладка вантажиться).
**Коміт:** `Рефакторинг: хелпер createAlgorithm для описів алгоритмів`

---

## TIER 3 — відкладено

### Фаза O — розбиття `i18n/messages.ts` (🔴) — ⏸️ СВІДОМО ВІДКЛАДЕНО

`messages.ts` — 3 833 рр., один плоский об'єкт (UA 1–1928, EN 1932–кінець; парність через
`Record<MessageKey, string>`). Спокуса розбити per-algorithm велика, але: типи вже ловлять
розсинхрон UA/EN, а **UA-рядки асертяться байт-у-байт** → high-churn / low-payoff і реальний
ризик регресій тестів. Чіпати лише коли файл почне реально заважати (напр. >30 алгоритмів),
і тоді — окремим планом із міграційним скриптом, що зберігає байти.

---

## Статус

| Фаза | Суть | Tier | Ризик | Статус |
|---|---|---|---|---|
| H | фабрики сторів (array/search/string) | 1 | 🟢 | ✅ ВИКОНАНО (−322 рр.) |
| I | спільний ArrayEditor + NumberField | 1 | 🟢🟡 | ✅ ВИКОНАНО (−495 рр.) |
| J | playback-kit (StatsBar/Stat/ModeSwitch + useTraceRun/TraceFallback) | 1 | 🟡 | ✅ ВИКОНАНО (−458 рр.) |
| K | lib-утиліти fmt/prng + assertTraceInvariants | 1 | 🟢 | 🔲 НЕ ПОЧАТО |
| L | реєстр figureForSrc | 2 | 🟡 | 🔲 НЕ ПОЧАТО |
| M | SearchTraceBuilder + базові Frame-інтерфейси | 2 | 🟡 | 🔲 НЕ ПОЧАТО |
| N | хелпер createAlgorithm | 2 | 🟢 | 🔲 НЕ ПОЧАТО |
| O | розбиття i18n | 3 | 🔴 | ⏸️ ВІДКЛАДЕНО |

### Орієнтовний сукупний зиск

~3 000–3 500 рр. дубльованого коду прибирається (стори ~800 · редактори ~850 ·
плеєри ~1300 · lib-каркас ~400 · реєстр ~600), при незмінній поведінці й тих самих тестах.
