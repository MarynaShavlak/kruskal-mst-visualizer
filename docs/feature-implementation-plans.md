# Плани реалізації відкритих фіч

**Дата:** 2026-06-25
**Платформа:** Kruskal MST Visualizer — 24 алгоритми, повністю двомовна (UA/EN), 25 навчальних вкладок (по одній на алгоритм, kruskal має ще й benchmark).

Рекомендація **#1 (матриця складності `#compare`)** уже **✅ реалізована** (PAGE_IDS-реєстр службових сторінок у роутері). Цей документ поглиблює решту відкритих пунктів у дієві плани, **закорінені в реальному коді** — кожен план пройшов adversarial-верифікацію: усі шляхи файлів, типи, хуки й експорти підтверджені проти кодової бази, виправлення верифікатора вкладені в текст нижче.

> Позначення: ✅ підтверджено верифікатором · ⬜ під питанням/потребує рішення людини · ⚠️ виправлення верифікатора (планер помилявся або був неточний).

Секції впорядковані за **рекомендованою послідовністю впровадження**: дешеве + незалежне першим; фічі, що залежать від спільного хука, — після нього.

---

## 1. Контрактні smoke-тести вкладок (параметризований Vitest+RTL із registry)

**Feasibility:** straightforward · **Effort:** S · **Value:** 4/5
*(планер і верифікатор згодні; верифікатор підтвердив емпірично — відтворив probe)*

QA-запобіжник, що закриває реальну прогалину: зараз домінують lib-тести, тож регресія у спільному `PlayerShell`/learn/editor-kit мовчки ламає кожен екран. Тест ітерує `ALGORITHMS[*].tabs` (єдине джерело правди) і монтує **кожен** lazy-View — авто-покриття всіх майбутніх алгоритмів без правок тесту.

**Підтверджені файли/факти (✅):**
- `src/algorithms/registry.ts` — `ALGORITHMS: readonly Algorithm[]`; 24 алгоритми × 3 вкладки + kruskal×4 = **73 вкладки** (підтверджено: бере й bfs/dfs/dijkstra/heap-sort).
- `src/algorithms/types.ts` — `Algorithm.tabs: readonly AlgoTab[]`, `AlgoTab = { key, View: lazy }`. **Зміни НЕ потрібні.**
- `src/algorithms/create-algorithm.ts:54` — кожен `View` через `React.lazy()` → тест мусить рендерити під `<Suspense>` і **чекати** чанк.
- `src/features/shell/AlgorithmShell.tsx:56-60` — вкладки обгорнуті в `<ErrorBoundary>`, що **проковтнув би** краш у fallback → монтувати `tb.View` **напряму**, не через shell.
- Усі 24 стори ініціалізуються непорожнім пресетом → playback рендерить контент **без сидингу**.
- `src/test/setup.ts` — поряд із наявними Pointer-Capture/scrollIntoView шимами.

**Кроки:**
1. Додати no-op `ResizeObserver`-шим у `src/test/setup.ts`: `globalThis.ResizeObserver ??= class { observe(){} unobserve(){} disconnect(){} } as unknown as typeof ResizeObserver`. ⚠️ Під TS-strict потрібен каст `as unknown as typeof ResizeObserver` (інакше type-error).
2. Створити `src/algorithms/registry-tabs.smoke.test.tsx`; `beforeEach`: `window.location.hash=''` + `setLang('ua')` (дзеркало App.test).
3. `const cases = ALGORITHMS.flatMap(a => a.tabs.map(t => ({ id:a.id, key:t.key, View:t.View })))`; `it.each(cases)`.
4. У кожному кейсі: рендер `<Suspense fallback><View/></Suspense>`; `await waitFor(() => queryByTestId('tab-fallback') not in document, {timeout:5000})`; `expect(container.textContent).not.toHaveLength(0)`.
5. (Опц. посилення) console.error-spy із фільтром `Warning:` — підтверджено зеленим для всіх 73.
6. (Опц.) окремий `it()` на структуру registry: кожен алгоритм має `learn`-вкладку і `defaultTab ∈ tabs.keys`.

**i18n + тести:** жодних нових ключів, жодних змін у `messages.ts`/lib. Тест асертить **структуру** (непорожній DOM + no console.error), не локалізований текст, тож стабільний до еволюції рядків.

**Ризики:**
- ⚠️ **Без шиму валиться 7 кейсів** (не 6): 6 граф-редакторів на `@xyflow/react` кидають `ResizeObserver is not defined` (`index.mjs:1272`) + 1 knock-on. З шимом усі 73 зелені.
- ⚠️ **Тривалість ~26с на теплому кеші** (не «кілька секунд»); найдорожчі — 24 LearnView (Shiki+KaTeX), **не** benchmark. Cold-CI може бути повільніше — закласти бюджет.
- ⚠️ Шим у `setup.ts` змінює середовище для **всіх 152 тест-файлів** — перевірено, повний сьют (1199 тестів) зелений, але майбутній тест, що покладається на відсутність `ResizeObserver`, мовчки змінить поведінку.
- console.error-spy крихкий до version-bump React (новий dev-error без `Warning:` завалить усе одразу) — тримати як opt-in, дефолт = «непорожній DOM».
- Web Worker у benchmark зараз стартує по дії, не на mount → мок не потрібен; майбутній refactor «worker на mount» завалить тест (бажаний сигнал).

**Залежності:** немає. **Синергія:** авто-покриє нові вкладки від інших рекомендацій. Опц. винести `describeTabSmoke` за зразком `describeArrayCore`/`describeStringCore` — для v1 надлишково.

**Питання користувачу (⬜):** строгість асерту (тільки DOM vs +console.error spy); чи прийнятний глобальний шим як політика тестів; cold-CI бюджет на 73 чанки.

---

## 2. Гарячі клавіші плеєра (`usePlayerHotkeys`)

**Feasibility:** straightforward · **Effort:** S · **Value:** 4/5 *(згода)*

Один невеликий хук поверх наявних reducer-екшенів. **Ключова архітектурна знахідка (✅ підтверджено grep):** `PlayerControls` рендериться рівно у **двох** місцях — `PlayerShell.tsx:39` (усі ~24 плеєри + kruskal dsu/hasPath) і `CompareView.tsx:42` (kruskal «порівняння», що йде **в обхід** `PlayerShell`). Тому хук вставляється у **`PlayerControls`**, а НЕ у `PlayerShell` (інакше compare-вкладка лишиться без клавіш). `MiniPlayerShell` (learn-віджети) `PlayerControls` не використовує → learn коректно лишається без глобальних клавіш.

**Підтверджені файли (✅):**
- `src/algorithms/shared/playback/PlayerControls.tsx` — `SPEEDS` на рядках 6-10, деструктуризація player на рядку 13, range-слайдер на рядку 53.
- `src/algorithms/shared/playback/player.ts` — екшени `toggle/next/prev/reset/seek/setSpeed` усі присутні; `seek` клампить і ставить `isPlaying:false`.
- Нові: `use-player-hotkeys.ts` + `use-player-hotkeys.test.tsx`.

**Кроки:**
1. Створити `use-player-hotkeys.ts`: `usePlayerHotkeys(player): void`; `useEffect` навішує `window.addEventListener('keydown')`, cleanup знімає. **Залежності ефекту — `[player.dispatch, player.frameCount]`** (⚠. не `[player]`: `usePlayer` повертає свіжий об'єкт щорендеру → `[player]` переписує підписку щоразу; `dispatch` з `useReducer` стабільний).
2. Хендлер: guard `isEditableTarget(e.target)` (INPUT/TEXTAREA/SELECT/`isContentEditable`/`role=textbox`) → return; інакше switch за `e.code`: Space→toggle, ArrowRight→next, ArrowLeft→prev, Home→reset, End→seek(frameCount−1), Digit1/2/3→setSpeed(SPEEDS[n].ms). `preventDefault` **лише після guard**.
3. ⚠️ Винесення `SPEEDS` у окремий `speeds.ts` — це **охайність, не вимога**: import-cycle тут benign (SPEEDS читається в обробнику, не на module-eval). Можна імпортувати `const SPEEDS` напряму без рантайм-помилки.
4. Підключити `usePlayerHotkeys(player)` у `PlayerControls`.
5. (Опц.) title-підказки `(Space)` на кнопках → лише тоді додавати `play.hk*` ключі.

**i18n + тести:** базова (хук-only) реалізація **не потребує ключів** — нічого не рендерить. RTL-smoke: `fakePlayer` з `vi.fn()` dispatch (⚠️ наявний `fakePlayer` у PlayerShell.test використовує `dispatch: () => {}` — апгрейд до `vi.fn()` валідний; `vi` доступний глобально), `fireEvent.keyDown(window, {code:...})` → перевірка екшенів; окремий guard-кейс із фокусом в `<input>`. Reducer уже покритий `player.test.ts`.

**Ризики:** обов'язковий guard (поряд range-слайдер + ArrayEditor/TextPatternEditor); `e.code` для цифр (UA-розкладка не ламає Digit1-3); window-global слухач існує лише поки змонтований `PlayerControls` (один на сторінку — kruskal рендерить один із dsu/hasPath/compare); Home/End/стрілки паузять відтворення (side-effect `seek`).

**Залежності:** немає. ⬜ **Питання:** цифри 1·2·3 = **швидкості** (reducer-backed, рекомендовано) чи режими (потребує окремої централізації mode — зараз локальний `useState` у кожному PlaybackView); видимі title чи суто невидимі клавіші.

---

## 3. Друк / PDF конспекту Learn (`@media print` + `window.print()`)

**Feasibility:** straightforward · **Effort:** S · **Value:** 4/5 *(згода)*

Мала фіча без нових залежностей з одним чокпоінтом: **уся** навчальна вкладка рендериться через спільний `SharedLearnView`.

**Підтверджені файли (✅):**
- ⚠️ **25 алгоритмів** (не 24) роутять через `SharedLearnView` — усі grep-підтверджені: bfs, dfs, dijkstra, binary-search, boyer-moore, bubble, floyd-warshall, heap-sort, held-karp, indexed-sequential, insertion, interpolation, kmp, knapsack, kruskal, linear, merge, naive, prim, quick, rabin-karp, radix, selection, shell.
- `src/index.css` — єдина точка глобального CSS (Tailwind v4.3.0, окремого config немає).
- `src/algorithms/shared/learn/LearnView.tsx:126` — `<h2>{t('learn.heading')}</h2>`, `useT` уже імпортований.
- `src/App.tsx:24` `<header>`; `AlgorithmShell.tsx:46` `<TabsList>` (⚠️ Radix не forceMount-ить неактивні вкладки → у DOM лише Learn, ризику форку немає); `TableOfContents.tsx:82` outer `<div>`; `CopyCodeButton.tsx:44-48` className через `cn()` (size `icon-sm`); `toast.tsx:20-22` `data-slot="toast-viewport"` fixed z-100.
- `messages.ts` — `learn.heading` ua:100/en:2096; `MessageKey=keyof typeof ua`(2002), `en:Record<MessageKey,string>`(2004).

**Кроки:**
1. У `index.css` блок `@media print`: `.no-print{display:none!important}`; **примус світлої палітри** (`html,.dark{--background:#fff;--foreground:#000;--border:#ddd;color-scheme:light}`); `overflow:visible!important` + зняти `max-height` зі скрол-контейнерів коду/TOC; `pre,code,figure,table,img,svg{break-inside:avoid;max-width:100%}`; `h2,h3{break-after:avoid}`; правило `pre{background:#fff}` для Shiki.
2. У `LearnView.tsx` поряд із `<h2>` додати `<Button variant="outline" size="sm" className="no-print" onClick={()=>window.print()}><Printer/>{t('learn.print')}</Button>` у flex-justify-between.
3. `no-print` на `<header>`, `<TabsList>`, outer `<div>` TOC, `CopyCodeButton`. Toaster ховати через `[data-slot=toast-viewport]{display:none}` (надійніше за клас, тости транзієнтні).
4. Один ключ `learn.print` (ua «Друк / PDF» / en «Print / PDF»).

**i18n + тести:** lib — немає (чисто презентаційна). RTL-smoke у `LearnView.test.tsx`: `vi.stubGlobal('print', vi.fn())` у `beforeEach` (jsdom не має `print`, інакше throw) → клік кнопки → виклик ×1. `@media print` jsdom не застосовує → ручна перевірка.

**Ризики:**
- ⚠️ **Shiki dark-токени — головна точка відмови, недооцінена**: `MarkdownCode` через `useShikiHtml(code,lang,isDark,...)` запікає **inline-кольори токенів** на `<span style="color:...">`. `pre{background:#fff}` перекриє лише фон обгортки, але **per-token кольори лишаться** (світле-на-білому → нечитабельно). Реальна мітигація: примусити **light Shiki** під час друку (реактивний `isDark`-override) АБО задокументувати «друк найкращий у світлій темі».
- KaTeX (`rehype-katex`) широкі формули можуть вилазити за A4 → `.katex-display{max-width:100%}`.
- Живі фігури (`figureForSrc`) містять контроли MiniPlayer/квізу всередині `<article>` → друкуватимуться «мертві» кнопки (наступна ітерація — `no-print` на них).
- Дублікат i18n-ключа ловить лише `tsc -b`/build.

**Залежності:** немає. ⬜ **Питання:** завжди світлий PDF чи зберігати тему; ховати TOC (рекомендовано) чи робити зміст; Shiki — CSS-override чи реактивний light-render.

---

## 4. MCQ-чекпойнти в Learn (data-driven `quiz-*` фігура з адресним поясненням)

**Feasibility:** straightforward · **Effort:** M · **Value:** 5/5 *(згода)*

Узагальнює єдиний наявний прецедент MCQ у перевикористовуваний data-driven квіз із миттєвим фідбеком ТА **адресним поясненням кожного хибного варіанта** (наявний показує пояснення лише для обраного).

**Підтверджені файли (✅):**
- `src/algorithms/heap-sort/learn/learn-widgets.tsx:367-422` — `MaxHeapQuizFigure`: single-answer, inline `useL(ua,en)`, коректність **обчислена** через `isMaxHeap`, БЕЗ per-distractor контракту.
- `LearnView.tsx:48-53` розгортає `<p>` навколо `<img>`; `:82-83` інжектить `figureForSrc`.
- `figure-widgets.tsx:51-52` — explicit `case "max_heap_quiz"` (НЕ regex).
- `lib/heapSort.ts:25,27` — `leftOf`/`rightOf`.
- `messages.ts` — `learn.heading` ua:100/en:2096.

**Кроки:**
1. Створити `shared/learn/quiz-types.ts`: `QuizOption { id; label: ReactNode|{ua,en}; correct?; explain:{ua,en}; payload? }`, `QuizSpec { prompt:{ua,en}; options; correctPredicate? }`. ⚠️ **Тип-обмеження:** `QuizOption` мусить нести **сирий payload** (напр. `arr`), бо heap обчислює `isMaxHeap(arr)`, а `label` — ReactNode-дерево.
2. Створити `shared/learn/QuizFigure.tsx`: `useState<picked>`, кнопки-варіанти (`transition-colors`, без JS-анімацій → reduced-motion ok), фідбек зелено/червоно, **адресне `opt.explain` під обраним невірним**, verdict, Reset. ⚠️ Немає спільного bordered `Figure` — лише `FigureCard` (dashed fallback); span-обгортку **реплікувати** з локальної `Figure` (learn-widgets.tsx:22-31).
3. `learn-quiz.heap-sort.ts`: `QuizSpec` із per-distractor поясненнями двомовно inline; `correctPredicate = isMaxHeap`.
4. Перевести `MaxHeapQuizFigure` на делегування `<QuizFigure spec={...}/>`, лишивши `HeapTree` у `label`.
5. ~6 скелетних ключів `learn.quiz*` (prompt/correct/wrong/why/reset/pickHint). Контент питань — **inline у learn-quiz.\<id\>.ts**, НЕ в messages (домовленість «навчальний контент — не в messages»).

**i18n + тести:** ⚠️ `messages.test.ts` перевіряє **різницю UA/EN лише на 3 хардкод-ключах** — ідентичні generic-мітки квізу тест НЕ завалять (важлива лише парність ключів + непорожність). ⚠️ Парність ловить і `npm run typecheck` (=`tsc -b`), не лише full build; пропущений en-ключ = **compile error** (`Record<MessageKey,string>`), не рантайм-undefined. RTL-smoke `QuizFigure`: correct/wrong+explain, обидві мови, Reset. Юніт-контракт `learn-quiz.heap-sort.ts`: рівно один correct; кожен невірний має непорожні `explain.ua`+`explain.en`.

**Ризики:** блок-у-`<p>` warning якщо не через img-стем (max_heap_quiz.png **уже** через img → ок); анімації лише CSS; `useState` не скидається при `setLang` (поведінка зберігається — прийнятно). Опц. демо `quiz_complexity.png` потребує **обох** content.ua.md (`docs/images/`) і content.en.md (`docs/images/en/`) + обох стемів у `learn-content.test.ts` keyFigures.

**Залежності:** немає (живе всередині Learn). ⬜ **Питання:** модель коректності (прапорець / `correctPredicate` / обидва — рекомендовано обидва); скоуп (heap-міграція + 1 демо vs усі 24 → XL); фідбек одразу vs кнопка «Перевірити».

---

## 5. Картка передумов і складності + живий детектор порушеної передумови

**Feasibility:** moderate · **Effort:** M · **Value:** 4/5 *(згода)*

Декларативне поле `precondition` на дескрипторі + спільні презентаційні примітиви + винесення живого детектора у **шапку** розділу (видно під час програвання — «момент дії»).

**Підтверджені файли (✅):**
- `src/algorithms/types.ts:63-89` — `Algorithm` має опц. `planned?`; додати `readonly precondition?: Precondition` — non-breaking.
- `src/algorithms/create-algorithm.ts:49-72` — ⚠️ **ГОТЧА підтверджена**: будує об'єкт **field-by-field** (НЕ spread), уже використовує `...(cfg.planned ? {planned:cfg.planned} : {})` (рядок 70). Забути протягнути `precondition` → поле тихо зникне.
- `BinarySummaryPanel.tsx:38-52` / `IxsSummaryPanel.tsx` / `IpSummaryPanel.tsx` — байт-ідентичний amber/emerald + Check/AlertTriangle strip із `isSorted(values)`. **Дедуп реальний — лише ці 3.**
- `lib/arrayUtils.ts:9-14` `isSorted`; `lib/graphAnalysis.ts:33` `analyzeGraph().isConnected`.
- `AlgorithmShell.tsx` — отримує лише `algorithm`+`tab`, **жодного доступу до стору** (головний ризик реальний).
- Стори `useBinarySearchStore`/`useInterpolationSearchStore`/`useIndexedSequentialSearchStore`/`useGraphStore`/`usePrimGraphStore` — окремі, без спільного селектора.

**⚠️ Виправлення верифікатора:**
- `ConnectivityPanel.tsx` — це **Card на `bg-primary/10`/`bg-destructive/10`**, НЕ amber/emerald strip → граф-передумова **НЕ** дедупиться у той самий `PreconditionStrip`, потребує **власного render-шляху**. Summary плану завищував «єдиний дедуп».
- `summary.tsx:40-60` уже має `SortedIndicator({sorted,yes,no})` (простіший варіант), якого 3 пошук-панелі НЕ використовують → новий `PreconditionStrip` ризикує стати **третім** near-duplicate; узгодити з `SortedIndicator`.
- Реальні наявні ключі — `editor.connConnected`/`editor.connDisconnected` (НЕ `connectedOk/Bad`); нові `precond.connectedOk/Bad` — net-new, не «reuse».
- `create-algorithm.test.ts` **не існує** → це **новий файл**, не правка.

**Кроки:**
1. `types.ts`: `PreconditionKind = 'sorted-array'|'connected-graph'`, `Precondition{kind}`, опц. поле на `Algorithm`.
2. `create-algorithm.ts`: `precondition?` у `AlgorithmConfig` + умовний spread у return + **новий** `create-algorithm.test.ts` (round-trip).
3. `shared/editor/precondition.tsx`: `PreconditionStrip` (винести з 3 панелей) + `PreconditionCard` (заголовок+складність+ОК/попередження+нота «не блокує»). Чисті, приймають `ok:boolean`+тексти.
4. Дедуп 3 пошук-панелей на `PreconditionStrip` (UA-рядки байт-у-байт).
5. Парні `precond.*` у ua+en; `tsc -b`.
6. `features/shell/PreconditionBanner.tsx` (адаптер: switch по id→стор-хук, або тонкі `SortedArrayBanner`/`ConnectedGraphBanner`); `null` коли поля немає.
7. Заповнити дескриптори: binary/interpolation/indexed-sequential → `sorted-array`; kruskal/prim → `connected-graph` (лінійний — БЕЗ передумови).
8. Вмонтувати банер у `AlgorithmShell` між TabsList і контентом; **ховати на `tab==='editor'`** (shell уже має `tab`-проп) щоб не дублювати summary.

**i18n + тести:** парні `precond.*`; `tsc -b` (CI уже на `tsc -b`). lib-детектори (`isSorted`/`analyzeGraph`) уже покриті. RTL-smoke `PreconditionBanner`: sorted→ОК, unsorted→попередження, no-precondition→null.

**Ризики:** ⚠️ **головний** — банер у шапці потребує coupling `features/shell`→стори (новий cross-layer; тонкі під-компоненти локалізують). Граф-передумова **педагогічно НЕ блокуюча** (незв'язність → остовний ліс, валідний вихід) → формулювати **інформативно**, не як «помилка коректності» (інакше суперечить наявному `connDisconnected`). Дешевша альтернатива з меншим ризиком: живий ✓/✗ лишити **тільки в editor summary**, у шапку — статична картка складності+передумови. Effort M лише для MVP sorted-array+connected-graph; розширення (radix→невід'ємні, рядкові→m≤n) → L.

**Залежності:** немає блокуючих. Синергія з `#compare` (`ComplexityMatrix` уже читає `complexity`). ⬜ **Питання:** живий детектор у шапці (coupling) vs статична картка + детектор у editor; чи `kind` має розрізняти blocking-incorrect vs informational; скоуп MVP vs розширення.

---

## 6. Текстовий пошук у каталозі + серіалізація фасетів у хеш

**Feasibility:** straightforward · **Effort:** M · **Value:** 4/5 *(згода)*

Додає пошук по тексту в каталог + deep-link фасетів (`?family=…&class=…&q=…`).

**Підтверджені файли (✅):**
- `src/hooks/use-route.ts:54` — `const path = rawHash.replace(/^#\/?/,"").split(/[?&]/)[0]` ⚠️ **підтверджено точно**: `#?family=graphs` → парситься на **каталог-роут** (`{algorithmId:null}`), бо segments.length===0. `&`-форма теж коректно зрізається з path.
- `use-route.ts:72` `setHash` → `window.location.hash = next` (**пушить** history-entry); `:74` early-return при рівному hash (без `emit()`).
- `HomeView.tsx` — локальний `useState(family/cls)`, фільтрує `algorithmsByFamily()` через `matchesClass/matchesFamily`; **пошуку немає**.
- `use-graph-editor.ts:43` — `readGraphParam` precedent (`h.indexOf('?')`+`URLSearchParams`) — ⚠️ **рекомендовано копіювати цей `indexOf('?')` підхід**, а не regex-split.
- `Algorithm.{name,shortName,tagline,category}` (Localized) + `id:string` (types.ts:65-79); `Lang='ua'|'en'`.
- `components/ui/input.tsx` + lucide `Search`/`X` — присутні, нових залежностей немає.
- ⚠️ i18n-рядки **точні, не приблизні**: ua `home.*` 68-78, en 2064-2074.

**Кроки:**
1. `use-route.ts`: розширити `Route` парсеним catalog-query (family/class/q) + `buildCatalogHash()`/`navigateToCatalog()` (омітити `all`/`''`); ⚠️ для debounced q-write додати **варіант `setHash` через `history.replaceState`** (зараз `setHash` тільки пушить) — net-new код.
2. Чистий `features/home/catalog-filter.ts`: `normalize()` (lowercase), `matchesQuery(algo,q,lang)` (name/shortName/tagline/category/id), `applyCatalogFilters(groups,{family,cls,q,lang})` + per-facet counts.
3. `HomeView`: seed family/cls/q із hash на **first render**; shadcn `<Input>` (Search+X) у sticky-панелі; `applyCatalogFilters` для `visible`+counts; empty-state з reset.
4. Debounced effect (~250ms): на зміну (family,cls,q) → `navigateToCatalog`. ⚠️ **Обов'язковий skip-first-render guard** (інакше mount-write клобберить seed і дасть feedback-loop).
5. 5 ключів `home.searchPlaceholder/searchAria/searchClear/emptyResults/emptyResultsReset`.

**i18n + тести:** 5 парних ключів; `tsc -b`. `catalog-filter.ts` бере `lang` параметром → framework-independent unit-тести. `use-route.test.ts`: `parseHash('#?family=graphs&class=linear&q=bfs')`→catalog-query; `buildCatalogHash` омітить all/empty; round-trip. Опц. RTL-smoke.

**Ризики:** router/state loop (seed-once + write-on-change); history-spam (debounce/replace); ⚠️ `setHash` early-return пропускає `emit()` на no-op; ⚠️ `useLangStore` реактивний → при перемиканні мови lang-scoped matchesQuery перезапускається, картки можуть зникати mid-search (нешкідливо). ⚠️ `ComplexityMatrix` (#compare) шарить `FilterChip` і той самий patten — catalog-only пошук = свідомий форк, підтвердити скоуп.

**Залежності:** перетин із deep-link query-surface (якщо планується спільний `parseHashQuery/buildHash` — винести generic). ⬜ **Питання:** local-state-mirrored-to-hash (реком.) vs hash-as-sole-source; push vs replace для q; ключ `class` vs `cls`; пошук current-lang vs обидві; розширити на `#compare`; канонічний empty-URL.

---

## 7. Навчальні шляхи + місточки «Звідки/Куди» (bridges)

**Feasibility:** straightforward · **Effort:** M · **Value:** 5/5 *(згода)*

Додає **один декларативний `BRIDGES`** масив у `registry.ts` (+ `bridgeFrom/bridgeTo` + `Bridge`), що живить 3 тонкі вставки: rail «Шляхи» на Home, footer `←prev/next→` у `AlgorithmShell`, `BridgeNav` у спільному `LearnView`.

**Підтверджені файли (✅):**
- `registry.ts` — `ALGORITHMS` (24 записи), `getAlgorithm`/`isAlgorithmId`/`algorithmsByFamily`/`FAMILIES`/`AlgorithmFamilyInfo`/`ComplexityClassInfo` присутні; co-locating `Bridge`/`BRIDGES` тут — ідіоматично. **`types.ts` правити НЕ треба.**
- `types.ts` — `Localized`; `defaultTab` обчислюється = `'learn'` для всіх (`create-algorithm.ts:68`).
- `use-route.ts` — `navigateTo`/`useRoute`/`navigateToPage`/`PAGE_IDS`; registry **не імпортує** use-route → циклу немає.
- `HomeView` — `AlgoCard` open-pattern.
- ⚠️ `AlgorithmShell` — після soon-guard повертає `<Tabs>` **напряму** (немає «ready branch»); footer мусить **обгорнути `<Tabs>`+footer у фрагмент** `<>...</>`.
- Спільний `LearnView` отримує **лише** `content`+`figureForSrc` (без algo-id) → id брати з `useRoute()` (єдиний спосіб, що не вимагає правки 25 wrapper-ів).
- `messages.ts` — ua@8, MessageKey@2002, en@2004.

**⚠️ Виправлення:** немає `shell.*` namespace (нові ключі = перші `shell.*`); taglines **непослідовні за напрямком** (naive→«місток до KMP» називає наступника; binary→«Винагорода за сортування» — себе через попередника) → нотатки bridges **писати свіжо**, не копіювати taglines.

**Кроки:**
1. `registry.ts`: `Bridge{from,to,note:Localized}` + `BRIDGES` (linear→binary, naive→kmp, binary→indexed-sequential, kmp→boyer-moore, boyer-moore→rabin-karp, sort-ланцюг, kruskal→prim тощо) + `bridgeFrom(id)`/`bridgeTo(id)`.
2. 8 chrome-ключів (`home.pathsHeading/Intro`, `shell.prevAlgo/nextAlgo`, `learn.bridgeFromTitle/ToTitle/GoLabel`). Per-edge `note` — **дані в BRIDGES**, не chrome.
3. `shared/learn/BridgeNav.tsx`: id→from/to картки + note + navigate-кнопка. ⚠️ **Render-null коли обидва bridge undefined** (endpoints).
4. Вмонтувати `BridgeNav` у `LearnView` (id через `useRoute()`, опц. `bridgeAlgoId` override).
5. Footer у `AlgorithmShell` (фрагмент-обгортка) через `bridgeFrom`/`bridgeTo`+`getAlgorithm`+`navigateTo`.
6. Rail «Шляхи» у `HomeView` (per-family або scrollable).

**i18n + тести:** `bridges.test.ts` (lib-style): кожен from/to — реальний id (`isAlgorithmId`), no self-loops, no дублі, `note.ua`+`note.en` непорожні, round-trip `bridgeTo`/`bridgeFrom`. RTL-smoke у `App.test`: ⚠️ **`findBy`/`await`** (learn — lazy-чанк; benchmark-тест уже потребував 5000ms).

**Ризики:** shared-LearnView coupling до роутера (мітигація — optional `bridgeAlgoId`); cross-family bridges — judgement-calls (писати свіжо); Home rail на 24 алго може бути довгим (per-family); ⚠️ зміна алго remount-ить subtree (`App.tsx` ErrorBoundary keyed) → flash перезавантаження lazy-чанку (нешкідливо); `tsc -b` для дублів.

**Залежності:** немає жорстких. Soft: якщо з'явиться спільний navigate-хук — `BridgeNav` його перевикористає. ⬜ **Питання:** масив BRIDGES vs опц. поля на Algorithm (реком. масив); лінійний ланцюг vs DAG (кілька from?); cross-family чи only-within; target-tab (learn для всіх); rail vs `#paths` сервіс-сторінка; авторство нотаток (свіжо).

---

## 8. Маркери фаз на таймлайні (семантичний скрабер) + рядок-діф

**Feasibility:** moderate · **Effort:** M · **Value:** 4/5 *(згода)*

Семантичні засічки на таймлайні (де змінюється `frame.phase`) з клік-seek + компактний рядок-діф «фаза→фаза».

**Підтверджені файли/факти (✅):**
- ⚠️ **18 phase-bearing views** (не «~16»): binary, boyer-moore, bubble, heap, held-karp, indexed-sequential, insertion, interpolation, kmp, knapsack, linear, merge, naive, quick, rabin-karp, radix, selection, shell.
- Граф-родина (kruskal/prim/floyd/dijkstra/tsp) — `frame.sub`/`sub.kind`, **НЕ phase** (`lib/trace.ts`, `graphTraversal.ts`) → generic accessor `(f)=>string` **обов'язковий**.
- `PlayerShell`/`PlayerControls` slot+seek wiring; `player.ts` seek-екшен; `PhaseBadge.tsx`/`PhaseStyle`; per-view `PHASE_STYLES` (`Record<Phase,{labelKey,cls}>`).
- click-to-seek precedent **багатший**: kruskal `DecisionTable.onSeekEdge`, held-karp `DpTablePanel`, floyd-warshall `RelaxationLog` — усі `onSeek:(index)=>player.dispatch({type:'seek',index})`.
- ⚠️ з 24 `<PlayerShell` один — test-harness, один — shared `TraversalPlayback` (BFS/DFS/dijkstra).

**Кроки:**
1. `shared/playback/phase-markers.ts`: тип `PhaseMarker{index,label,cls}` + чиста `computePhaseMarkers<F>(frames,getPhase,styles?,opts?{only?})` — індекси входу у відмінну фазу + filter. ⚠️ **Guard `last===0`** (single-frame → /0/NaN). Чисте ядро без React/i18n.
2. React-хуки `usePhaseMarkers` (мемо+`useT` для label) і `usePhaseDiff(frames,index,getPhase)`.
3. `PlayerControls`: огорнути `<input range>` у relative-контейнер; абсолютний шар засічок (`pointer-events:none` на контейнері, `auto` на кнопках; left=`index/last*100%`; `onClick`→seek). ⚠️ Зберегти `flex-1` слайдера всередині нового wrapper.
4. `PlayerShell`: опц. `markers`+`diffRow` (зворотно сумісно для всіх викликів).
5. Pilot-плеєри + 4 ключі (`play.phaseMarkers/jumpToPhase/diffPhaseChange/diffLabel`); vars передавати у **кожному** `t()`.

**⚠️ Критична корекція пілотів — лише KMP чистий:**
- **KMP** ✅ — єдина чиста межа `lps→search`.
- **merge-sort** ⚠️ — у **bottom-up** усі кадри `phase:'merge'` (крім init/final) → phase-маркери дають лише 2 межі; реальні межі — у `frame.passIndex`, не phase → потрібен **mode-залежний accessor** (`f=>f.passIndex`).
- **quick-sort** ⚠️ — pre-order дерево чергує partition/base **щокадру** → phase-маркери **заллють** слайдер, чистого whitelist немає.

→ **Рекомендація: спершу KMP як єдиний сильний пілот**; merge/quick відкласти до проєктування per-mode accessor.

**i18n + тести:** 4 парні ключі; `tsc -b`. Підписи фаз — **не дублювати**, реюзати `PHASE_STYLES.labelKey`. Юніт `phase-markers.test.ts` (init→single boundary; чергування→лише входи; only-filter; 0/1-кадрові→[]). RTL `PlayerControls.markers.test.tsx` (рендер за title, клік→`dispatch({type:'seek',index})`; без markers — оверлея немає). ⚠️ RTL під UA-дефолт (`getByTitle('Грати')`).

**Ризики:** неоднорідність фаз (граф на sub.kind — окремо); щільність у binary/interpolation (whitelist `opts.only`); перехоплення кліків слайдера; `last===0` guard.

**Залежності:** немає жорстких. Soft із deep-link (seek у URL). ⬜ **Питання:** маркувати всі зміни vs whitelist; графи в цій ітерації чи окремо; формат діфа (мінімальний vs bespoke структурний); 1 пілот (реком. KMP) vs усі 18 (→L).

---

## 9. Узагальнення бенчмарку в registry-driven kit (`Benchmarkable`)

**Feasibility:** moderate · **Effort:** L · **Value:** 4/5 *(згода)*

Benchmark зараз kruskal-only; tab-система **вже** generic. Чистий шов — `create-algorithm.ts`: опц. `benchmark: Benchmarkable` дескриптор → синтез benchmark-вкладки з shared `GenericBenchmarkView`.

**Підтверджені файли (✅):**
- `types.ts` — benchmark-концепту немає (підтверджено).
- `create-algorithm.ts:21-56` — `TAB_VIEW` мапить per-key (learn/editor/playback/benchmark→`*View`). ⚠️ Синтез-вкладки мусить інжектити готовий `lazy(GenericBenchmarkView)` **в обхід** TAB_VIEW name-lookup — невелика структурна добавка до build `tabs[]`, не лише поле.
- `lib/benchmark.ts` — `BenchPoint{dsuMs,hasPathMs,edges}`, `DEFAULT_SIZES`, `timeIt` (warm-up+iterate), `benchmarkPoint`.
- kruskal `benchmark/{BenchmarkView,use-benchmark,benchmark.worker}.ts` — verbatim; `new URL('./benchmark.worker.ts',import.meta.url)` per-call-site static (єдиний call-site `use-benchmark.ts:23`).
- `kruskalDsuCompute`/`kruskalHasPathCompute`, `randomArray`, `randomGraph`, `countOperations`(×7 sorts)/`countComparisons`/`countSteps`/`countProbes`; ⚠️ **гетерогенні return-типи** (BubbleCounts vs QuickCounts vs number) — реальні.
- lib-файли **без React-імпортів** → worker-bundle безпечний.
- `benchmark.test.ts` — лише finiteness/non-negative.
- `App.test.tsx:57` — асертить `/DSU проти наївної/` (bench.title).
- floyd-warshall `index.ts:22-25` — PLANNED benchmark (out of scope).

**⚠️ Виправлення:**
- **IN-PLACE mutation ризик завищений**: усі публічні sort-експорти беруть `readonly number[]` і клонують внутрішньо — навіть `quicksortInplace` клонує `[...input]` (`quickSort.ts:97`). Немає експортованого raw-mutating sort. Uniform-clone лишається доброю практикою для fair-timing, але «quicksortInplace мутує» — **невірно**.
- Реюзати наявний `shared/playback/ModeSwitch.tsx` (`ModeOption<K>`) для ms⇄ops тогла, **не** новий shadcn segmented.
- `bench.title`/`bench.lineNaive` **kruskal-специфічні**; мітка «DSU» **хардкод** у `BenchmarkView.tsx:106` (навіть не i18n-ключ) → generic-view бере series-імена з дескриптора. Міграція kruskal на generic-title **завалить `App.test.tsx:57`** → тримати kruskal bespoke цей PR.

**Кроки:** `lib/benchmark-descriptor.ts` (`Benchmarkable<I>`: id, Localized x-label, sizes, `makeInput`, `series[{id,name,color,runMs,countOps?,theoretical?}]` + worker-side `BENCHMARK_REGISTRY` keyed by id — closures не postMessage-яться, worker резолвить по `descriptorId`); `lib/complexityBounds.ts` (чисті anchor-scaled криві); `shared/benchmark/{generic-benchmark.worker,use-benchmark,GenericBenchmarkView}.ts`; узагальнити `runBenchmarkSeries` у `benchmark.ts` (uniform clone). Wire у `create-algorithm.ts`; kruskal лишити bespoke.

**i18n + тести:** generic chrome `bench.metricMs/Ops/axisOps/theoretical` (per-algorithm series — Localized на дескрипторі); `tsc -b`. lib-unit (детермінований backbone): no-mutation, deterministic `makeInput`, `countOps` match. ⚠️ **ops-метрику можна рахувати на main-thread** (детерміновано, snapshot-testable; уникає worker round-trip) — план недооцінює. ms-метрика недетермінована → тест лише finiteness. RTL-smoke — **тільки статичний chrome** (module-workers не виконуються в jsdom).

**Ризики:** worker резолвить по id (closures); single shared worker на фіксованому шляху (Vite); theoretical-curve anchoring педагогічно тонке («орієнтир, не передбачення»); search/string потребують fair-генераторів (відкласти); ⚠️ дескриптор фактично розділяється на worker-importable (pure) + UI-частину (Localized/colors) — обидва **імпортують** модуль, по дроту лише `descriptorId`.

**Залежності:** none нових (Recharts/Worker/Vitest присутні). Soft: ms⇄ops у URL (`?metric=ops`) із deep-link. ⬜ **Питання:** `Benchmarkable` на `Algorithm` vs тільки `AlgorithmConfig` (реком. config); мігрувати kruskal зараз vs follow-up (реком. лишити); скоуп graphs+sorts vs +search/string; ops на main-thread vs worker; anchoring (largest-n vs least-squares); headline-операція для multi-counter sort.

---

## 10. PWA: офлайн-режим + інсталяція (vite-plugin-pwa)

**Feasibility:** straightforward · **Effort:** M · **Value:** 4/5 *(згода)* · 🆕 **нова dev-залежність**

Додавання offline+installability просте, бо застосунок — статичний client-only SPA: весь learn-markdown inline через `?raw`, уся обчислювалка на клієнті → чистий Workbox-precache достатній. Єдиний load-bearing constraint: `base:'/kruskal-mst-visualizer/'`.

**Підтверджені файли/факти (✅):**
- `vite.config.ts:9` — `base:'/kruskal-mst-visualizer/'`; 196 JS-чанків, 4.1MB dist, 64 шрифти, `?raw` inlining (24 файли).
- toast-store **без action-button slot** → потрібен окремий `pwa-store` + `PwaUpdatePrompt`.
- Zustand `getState()`-pattern; `messages.ts` MessageKey-парність; `tsconfig.app.json` `types`-масив; Toaster поза route-keyed ErrorBoundary; **реальний benchmark Web Worker** (валідує `registerType:'prompt'`).
- ⚠️ **Стрей-файл `src/__smoke_probe2.test.tsx` уже видалено** — `tsc -b`/build більше не зламані ним (перевірено: файл відсутній).

**⚠️ Виправлення:**
- Найбільший чанк — **translate ~430KB** і **FigureCard ~417KB**, не BenchmarkView (~340KB, третій). `maximumFileSizeToCacheInBytes` (~4MB) покриває все, але config-обґрунтування має посилатися на ~430KB.
- `main.tsx` — bare 10-рядковий `createRoot().render()`, **theme-script у `index.html:42-54`**, не в main; реєстрація просто додається після render.

**Кроки:**
1. Dr.dep `vite-plugin-pwa` (Workbox транзитивно; runtime-deps немає); `npm ci` під Node 22.
2. Згенерувати PNG-іконки з `public/favicon.svg`: 192/512/maskable-512/apple-touch-180 (🆕 **єдина реальна прогалина — лише favicon.svg існує; Android install потребує 512 PNG**).
3. `vite.config.ts`: `VitePWA({registerType:'prompt', injectRegister:null, workbox:{globPatterns:[js/css/html/svg/woff2(+woff/ttf?)], maximumFileSizeToCacheInBytes:4_000_000, cleanupOutdatedCaches:true}, manifest:{name/short_name/description, start_url+scope з base, display:'standalone', lang:'uk', theme_color/background_color, icons}})`.
4. `src/vite-pwa.d.ts` (`/// <reference types='vite-plugin-pwa/client'/>`) для `virtual:pwa-register`.
5. `pwa-store.ts` (`needRefresh/offlineReady/updateSW`); `main.tsx` — `registerSW({onNeedRefresh,onOfflineReady})` імперативно поза React; `PwaUpdatePrompt.tsx` поряд із Toaster.
6. 5 ключів `pwa.updateTitle/updateBody/updateReload/updateDismiss/offlineReady`; `index.html` `<link rel='manifest'>`+theme-color+apple-touch.

**i18n + тести:** 5 парних ключів; `tsc -b`. `pwa-store.test.ts` (за зразком toast-store); `pwa-update-prompt.test.tsx` (RTL: banner на needRefresh, Reload→updateSW, обидві мови). ⚠️ `virtual:pwa-register` не резолвиться в Vitest → ізолювати реєстрацію в main.tsx; `vi.mock` лише якщо тест тягне модуль.

**Ризики:** `registerType:'prompt'` (auto-update свопнув би чанки під працюючим плеєром → корупція deteministic Frame-моделі); scope/start_url мусять = base; ⚠️ перший install тягне **весь 4.1MB** (196 js + 64 шрифти) — на мобільному дорого, розглянути runtime-caching для KaTeX ttf/woff (woff2-only precache); ⚠️ benchmark worker-чанк precache-иться broad-glob'ом → **окремо offline-тестувати benchmark-вкладку**, не лише навігацію; iOS Safari обмежений (apple-touch PNG, без install-event).

**Залежності:** 🆕 `vite-plugin-pwa` (dev). Торкає root-файли (App/main/messages) — секвенсувати щоб уникнути merge-churn. ⬜ **Питання:** хто генерує іконки (manual vs `@vite-pwa/assets-generator` = 2-га dev-dep); font-precache (всі 64 vs woff2-only); `prompt` (реком.); short_name/display; динамічний base vs хардкод; sandbox на iframe; кнопка «Install app» у шапці.

---

## 11. Embed-режим для викладачів (`?embed=1`): chromeless widget + Copy embed code

**Feasibility:** straightforward · **Effort:** M · **Value:** 4/5 *(згода)*

Embed-режим простий, бо `App.tsx` централізує весь chrome і onShare уже будує base-path-safe URL.

**Підтверджені файли (✅):**
- `App.tsx:24-46` — весь chrome у одному `<header>`; routed-body у MotionConfig/ErrorBoundary/Toaster.
- `use-route.ts` — торкає **тільки** `window.location.hash`; **нічого** не читає `location.search` → `?embed=1` як реальний query-param безконфліктний; `parseHash` повертає точну `{algorithmId,tab,page}` (рядок 56) — лишити чистою.
- onShare-конструкція `${origin}${pathname}#${route}` дубльована **byte-for-byte** у 3 файлах: `use-graph-editor.ts:229`, `use-doc-editor-actions.ts:87`, ⚠️ held-karp `use-tsp-editor.ts:215` (план правильно називає файл).
- `EditorViewShell.tsx:50-52` — уже бере `onShare`, рендерить `Share2`; додати опц. `onCopyEmbed`+`Code2` тривіально.
- `messages.ts` MessageKey(2002)/en:Record(2004); `setLang`; `Lang='ua'|'en'`.
- `App.test.tsx:8-11` — `beforeEach` ставить hash, **не search** → embed-тести скидають search.

**⚠️ Виправлення:**
- EditorViewShell консьюмлять **16-17 editor-views** (sort/search/string/radix/heap) → кнопка авто-падає туди. Але **граф-редактори ОКРЕМІ**: kruskal/prim/floyd → `GraphEditorScreen.tsx:151-153` (власний хардкод Share2-toolbar, НЕ EditorViewShell), held-karp → власний EditorView+`use-tsp-editor`. Wire Copy-embed для 4 граф/TSP — **другий ручний edit**.
- `CopyCodeButton` під `shared/learn/`, не `shared/editor/` (минорно).

**Кроки:**
1. `src/hooks/use-embed.ts`: `EmbedConfig{embed,lang?}`, `parseEmbedSearch(search)` (чиста), `useEmbed()` (мемо-read at mount, non-reactive). ⚠️ Якщо `config.lang` — `setLang` **у `useEffect`**, не в render-body (інакше setState-during-render warning).
2. `buildEmbedUrl(route,opts?)` → `${origin}${pathname}?embed=1${lang?'&lang='+lang:''}#${route}` (дзеркало onShare).
3. `App.tsx`: при `embed.embed` — без `<header>`, tighter `<main>`, зберегти Toaster/ErrorBoundary/MotionConfig.
4. `shared/editor/use-embed-snippet.ts`: будує `<iframe>` (width/height/title/loading=lazy/border:0), `navigator.clipboard?.writeText`+toast `tr('embed.copied')`.
5. `EditorViewShell`: опц. `onCopyEmbed`+`Code2` після Share; wire з shared-kit редакторів. Граф/TSP — окремо (`GraphEditorScreen` toolbar + held-karp EditorView).
6. 4 ключі `embed.copyCode/copied/openFull/poweredBy`.

**i18n + тести:** 4 парні ключі; `tsc -b`. `use-embed.test.ts` (чиста: `?embed=1`→`{embed:true}`, `&lang=en`→`+lang`, `''`→false); `buildEmbedUrl` (містить pathname+`?embed=1#kruskal/playback`). `use-embed-snippet.test.ts` (мок clipboard, валідний `<iframe>`, toast росте). App.test embed-smoke: `search='?embed=1'`+`hash='#kruskal/playback'` → header відсутній, body рендериться; ⚠️ скидати search у `beforeEach` (захист усіх сьютів).

**Ризики:** embed = query (не hash); iframe-src зберігає pathname; ⚠️ `&lang=` через `setLang`→localStorage **назавжди перезаписує** мову для всього origin (iframe шарить localStorage, sandbox немає) — глобальний side-effect; ⚠️ `setLang` у effect не render; граф-редактори — другий wire-point; buildEmbedUrl: `?embed=1` у реальному query, `?g=` у hash — unit-тест на правильні сторони `#`.

**Залежності:** soft із shared share-URL builder (об'єднало б 3 дублі onShare). ⬜ **Питання:** in-widget контроли (LanguageToggle/«Open full») чи `&lang=`; розміри iframe/пресети; кнопка в editor чи й у playback/learn; чи encode `?g=`; attribution; sandbox; «Install app» кнопка.

---

## 12. Дип-лінк на конкретний крок плеєра (`?g=…&step=N&mode=X`) + «Поділитися кроком»

**Feasibility:** complex · **Effort:** L · **Value:** 3/5 *(згода; L через 17 інтеграцій + гонку готовності trace)*

Дип-лінк на конкретний кадр + кнопка share. **Прихована основна робота:** playback читає **тільки** store; `?g=` вантажиться лише в редакторі. Потрібен новий generic-хук, що сам робить load-з-`?g=`.

**Підтверджені файли (✅):**
- `use-graph-editor.ts:43` `readGraphParam` + тест-файл (дзеркало для `readStepParam`/`readModeParam`).
- `use-route.ts:54` `parseHash` зрізає `?query`; `:72-92` `setHash`/`navigateTo` **викидають `?g=`** → потрібен `setHashWithQuery`.
- `PlayerShell.tsx:39` — **єдина** обгортка `PlayerControls` для всіх плеєрів → `onShareStep` proxy одноточковий.
- `usePlayer` → `{frameCount,index,dispatch}`; `seek` клампить (`player.ts:53-54`).
- **Жоден PlaybackView не читає hash** (grep пусто); `?g=` лише в editor через `useDocEditorActions` (one-time loadedRoutes-guard, `:14,41-48`); onShare (`:84-93`) — шаблон для shareStep.
- Усі кодеки (`createValuesCodec`/`createSearchCodec`/`createTextPatternCodec`+bespoke knapsack/graph) експонують `encodeHash`/`decodeHash`; стори (searchCore/iss/knapsack) — `loadDoc`/`toDoc`.
- ⚠️ **Counts точні**: 14 mode-плеєрів, 3 no-mode (boyer-moore/kmp/radix), 7 graph = 24. Mode-keys перевірені per-file (quick:`strategy` middle|first|last|median3; merge:topDown|bottomUp; shell:shell|knuth|ciura; heap:asc|desc; bubble:naive|optimized; rabin-karp:rolling|recompute).

**⚠️ Виправлення:**
- Share2 **НЕ в EditorViewShell** — імпортується в per-algorithm editor-views; іконка доступна з lucide незалежно.
- linear-search PlaybackView (еталон) зараз **не** імпортує codec/loadDoc/toDoc — читає селектори напряму → кожна з 17 інтеграцій **додає** селектори `loadDoc`/`toDoc` + import codec + `onShareStep`-проп (більше за «просто виклик хука»).
- indexed-sequential **НЕ спеціальний**: стор експонує `loadDoc`/`toDoc` тієї ж форми, doc несе `step` — передати iss-codec.
- onShare у editor **ще й кличе `setHash(route)`** (оновлює адрес-бар), не лише clipboard → відповідь на open-question «чи оновлювати URL» = так; `usePlayer` reset на `sig`-change (НЕ hashchange), `parseHash` зрізає query → `setHash` з shareStep **НЕ** скине плеєр на step 0; будувати share через `window.location.pathname` (deploy-base).

**Кроки:**
1. `readStepParam`/`readModeParam` у `use-graph-editor.ts` + тести.
2. `setHashWithQuery(path,params)` у `use-route.ts` (зберігає path, переписує query) + тест.
3. `shared/playback/use-playback-deeplink.ts` (generic `<M extends string>`): pendingStep-ref; one-time decode `?g=`→`loadDoc`; **setMode потім seek ПІСЛЯ готовності trace** (`frameCount>1`). ⚠️ Гонка реальна: `sig`(=`${mode}|...`) — resetKey usePlayer; зміна mode синхронно міняє sig, `seek` у тому ж render **до** reset-ефекту буде **клоббернутий**. Хук мусить детектувати, що (а) setMode пропагувався у sig **і** (б) usePlayer reset-ефект уже спрацював, перед seek (two-tick / gating на «mode applied AND frameCount matches expected sig»). **НЕ** очищати pendingStep поки `frameCount>1` (реальний trace), інакше empty/fallback-trace з'їсть step.
4. `shareStep()`: `g=encodeHash(toDoc())&step=index&mode=current` → `setHashWithQuery`+clipboard+toast `editor.linkCopied` (реюз).
5. Proxy `onShareStep` через `PlayerShell`→`PlayerControls` (Share2-кнопка).
6. 1 ключ `play.shareStep`; реюз `editor.linkCopied`.
7. Еталон linear-search; розкат на 13 mode + 3 no-mode (`modeKeys=[]`→`?mode=` не пишеться).

**i18n + тести:** `play.shareStep` ua:252/en:2240; `tsc -b`. Юніт `readStepParam`/`readModeParam`; `setHashWithQuery`; `use-playback-deeplink` (мок hash g/step/mode→loadDoc/mode/seek; share збирає URL+clipboard). RTL-smoke одного PlaybackView із prefilled hash → стартовий індекс + кнопка share.

**Ризики:** головний — load-з-`?g=` (прихована робота); гонка trace-готовності; mode у sig скидає курсор (порядок setMode→seek); кламп step; iss doc-step ≠ ?step= (коментар); 17 інтеграцій × generic-типи (`<M extends string>`).

**Залежності:** spільний кодек-шар (присутній). Перетин зі «спільний mode у store» (якщо mode мігрує — хук читатиме стор). 7 граф-плеєрів — **фаза 2** (graph-doc варіант). ⬜ **Питання:** `?step=` vs `?at=/?frame=`; скоуп фази 1 (17 non-graph vs +7 graph); mode→store; невалідний `?g=` UX; share оновлює адрес-бар (так, за editor-патерном).

---

## 13. Режим «Вгадай рішення» (predict-before-reveal) для плеєрів

**Feasibility:** moderate · **Effort:** L · **Value:** 5/5 *(згода; найсильніший педагогічний важіль)*

На кадрі-інтризі автопауза → 2-3 кнопки-варіанти → розкриття ✓/✗. Лягає на наявну **дворівневість trace**: правильну відповідь виводимо з НАСТУПНОГО (resolution) кадру, без дублювання алгоритму.

**Підтверджені файли (✅):**
- `PlayerShell.tsx` — slots + `<div className="grid gap-3 lg:grid-cols-3">` insertion point.
- `use-player.ts` повертає dispatch; `player.ts` має `pause`.
- `binarySearchTrace.ts` (BsFrame/BsPhase: phase/discardLo/discardHi/result/low/high/mid); `linearSearchTrace.ts` (LsFrame: phase/cursor/matches/resolvedTo/result); `lib/trace.ts` Frame (`consideredEdgeId:string|null`, `decision:EdgeDecision|null`).
- shadcn button + lucide ^1.17 + zustand ^5.0.
- UI-зразок `MaxHeapQuizFigure` — `heap-sort/learn/figure-widgets.tsx:367`.

**⚠️ Виправлення:**
- Count: ~21 playback-views (не 23); BFS/DFS/dijkstra рендерять PlayerShell **непрямо** через `shared/traversal/TraversalPlayback.tsx` → `predictSlot` авто-доходить лише якщо TraversalPlayback теж форвардить (не критично для 3 пілотів).
- **Адаптери асиметричні**: binary/linear resolution = `index+1` (probe→discard/found, check→match/reject суміжні), але **kruskal** `consider`-кадр (decision=null) **відділений** DSU-subframes (find/compress/union) → kruskal-адаптер **сканує вперед** на той самий `consideredEdgeId` з non-null decision (НЕ index+1). Це реальний hard-part «доказу генеричності».
- ⚠️ **Інвертована discard-семантика** у binarySearchTrace: коли value<target лінія називається `discardRight`, але ставить `discardLo:oldLow, discardHi:mid` (відкидається НИЖНІЙ діапазон). Адаптер «відкинути ліву/праву» мусить ключитися на **discarded RANGE** (discardLo/discardHi), не на label → інакше correctId **реверснутий**. Bug-magnet, обов'язковий unit-тест.
- `messages.test.ts` перевіряє різницю UA/EN лише на 3 хардкод-ключах → ідентичні generic predict-мітки тест не завалять.

**Кроки:**
1. `predict.ts`: `PredictOption{id,labelKey:MessageKey,labelVars?}`, `PredictQuestion{promptKey,options,correctId}`, `PredictAdapter<F>=(frames,index)=>PredictQuestion|null`, `defaultNoQuestion=()=>null`. Чистий, без JSX.
2. `predict-store.ts` (zustand persist `kruskal-predict`, дефолт **false**) — глобальний тумблер як lang/theme.
3. `use-predict.ts`: `usePredict(player,question)` — `answeredId` прив'язаний до `player.index`; коли `enabled && question && !answered && isPlaying` → **синхронно** `dispatch({type:'pause'})`; повертає `{question,answeredId,isCorrect,pick,revealed}`. ⚠️ Автопауза-гонка: pause у тому ж ефекті, що детектує `question!=null && isPlaying` (reducer-тест).
4. `PredictOverlay.tsx` (за зразком MaxHeapQuizFigure: нейтральний→зелений/червоний, ✓/✗, Reset).
5. `predictSlot?:ReactNode` у `PlayerShell` (між statsBar і grid; опц.→24 виклики не ламаються).
6. Пілоти: binary (`probe`, correctId за discardLo/discardHi — **не label**), linear (`check`→match/reject за наступним), kruskal (`consider`+decision=null → **scan-forward** за consideredEdgeId).
7. Predict-стан **ПОЗА sig** (тумблер не скидає курсор).

**i18n + тести:** parні predict-ключі; `tsc -b`. `use-predict.test.ts` (автопауза на інтризі, прив'язка до index, isCorrect, null-question→no pause). `PredictOverlay.test.tsx` (промпт/варіанти/клік→✓/✗). ⚠️ обов'язковий тест на discard-direction (binary) + kruskal scan-forward. ⚠️ resolution-boundary: binary `found`/`done`, linear final `reject`/`done` — **немає** наступного resolution для останнього probe/check → адаптер повертає null (уникнути OOB `frames[index+1]`).

**Ризики:** синхронна автопауза в usePlayer-інтервалі; predict поза sig; межі «наступного кадру» на done; kruskal asymmetric scan; binary inverted discard; reduced-motion (статичне розкриття).

**Залежності:** none нових. Soft із spільним mode-хуком (predict-тумблер — окремий store). ⬜ **Питання:** глобальний тумблер (реком., дефолт OFF) vs локальний; 3 пілоти (реком.) vs усі 20; автопауза лише autoplay чи й ручний Step; авто-перехід до resolution vs ручний; generic-мітки vs специфічні; статистика вгадувань.

---

## Граф залежностей (текстом)

```
НЕЗАЛЕЖНІ (нічого не розблоковують, нічим не блокуються):
  #1 smoke-тести ─────► авто-покриває ВСІ нові вкладки (passive synergy)
  #2 hotkeys
  #3 print/PDF
  #4 MCQ-квізи
  #5 precondition-card ──soft──► #compare (вже done)
  #6 catalog-search ────soft──► спільний parseHashQuery/buildHash
  #7 bridges ───────────soft──► спільний navigate-хук
  #8 phase-markers ─────soft──► deep-link (seek у URL)

СПІЛЬНИЙ ХУК → ІНТЕГРАЦІЇ:
  #12 use-playback-deeplink (хук)  ──будує──►  setHashWithQuery, readStep/ModeParam
        │                                          (нова query-surface у use-route)
        └──розблоковує──► ms⇄ops у URL (#9), seek у URL (#8), &metric (#6/#11)

  #13 predict.ts/use-predict (хук)  ──pilot──►  binary, linear, kruskal → розкат на 20

  #9 Benchmarkable (kit)  ──будує──►  benchmark-descriptor + GenericBenchmarkView
        └──розблоковує──► benchmark для всіх алгоритмів (зараз kruskal-only)

ЛЕГКА КООРДИНАЦІЯ root-файлів (App/main/messages) — секвенсувати, не блокувати:
  #10 PWA, #11 embed, #2 hotkeys, #7 bridges
```

**Ключове:** жорстких блокувань між фічами **немає**. #12, #13, #9 — кожна будує **власний** спільний хук/kit і розкочує його на N плеєрів усередині себе (їхній L-effort саме про це). Решта — самодостатні. #6/#8/#9/#11 м'яко виграли б від спільного query-helper, якщо його винести під час #6 чи #12.

---

## Секвенсований роадмеп (фази)

| Фаза | Фічі | Чому саме тут |
|------|------|---------------|
| **1. Дешеві незалежні запобіжники** | #1 smoke, #2 hotkeys, #3 print | S-effort, нуль залежностей, нуль ризику регресу. #1 ставить QA-сітку **перед** усіма наступними змінами kit (захищає #5/#8/#12/#13). |
| **2. Контент-важелі (висока цінність, ізольовані)** | #4 MCQ, #7 bridges | Value 5/5, живуть у Learn/registry, не торкають плеєр-kit. #7 формалізує наратив «чому це наступне» через усі 24 алгоритми. |
| **3. Discoverability + chrome** | #6 catalog-search, #5 precondition-card | M-effort; #6 вводить query-surface у роутер (фундамент для deep-link). #5 — педагогічний показ передумов під час дії. |
| **4. Дистрибуція** | #10 PWA, #11 embed | M-effort, торкають root-файли — робити поряд щоб уникнути merge-churn. Embed може реюзати спільний share-URL builder. |
| **5. Складні плеєр-важелі (нові спільні хуки/kit)** | #13 predict, #8 phase-markers, #9 benchmark-kit, #12 deep-link | L/M-effort, кожна будує власний хук+розкат. #13 першим у фазі (value 5/5). #8 — лише KMP-пілот спершу. #12 — найскладніша, дає URL-surface для ms⇄ops(#9)/seek(#8). |

---

## Топ-рекомендація: будувати ПЕРШИМ

**▶ #1 — Контрактні smoke-тести вкладок.**

**Чому:**
1. **Найвищий ROI:** Effort **S**, один новий файл + один рядок у `setup.ts`, **нуль** нових залежностей, **нуль** нових i18n-ключів, **нуль** змін lib. Верифікатор **емпірично відтворив** механізм — усі 73 вкладки монтуються зеленими.
2. **Захищає все інше:** усі наступні фічі (#5/#8/#12/#13) торкають **спільний** PlayerShell/learn/editor-kit. Зараз регресія там **мовчки** ламає кожен екран, а lib-тести цього не ловлять. #1 ставить регресійну сітку **до** того, як почнемо ризиковані kit-зміни.
3. **Самопідтримуваний:** ітерує `ALGORITHMS[*].tabs` (єдине джерело правди) → авто-покриває кожен майбутній алгоритм і кожну нову вкладку (benchmark від #9, predict-slot від #13) **без правок тесту**.
4. **Низький downside:** єдине застереження — `ResizeObserver`-шим змінює середовище всіх тест-файлів, але повний сьют (1199 тестів) уже перевірено зеленим; тривалість ~26с прийнятна.

Одразу після — **#2 (hotkeys)** і **#3 (print)** як решта дешевої незалежної фази, потім контент-важелі **#4/#7** (value 5/5, ізольовані). Складні L-фічі з новими спільними хуками (#13/#9/#12) залишити на кінець, уже під захистом smoke-сітки.