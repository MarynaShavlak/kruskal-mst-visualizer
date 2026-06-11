# Kruskal MST Visualizer

Інтерактивна платформа для вивчення алгоритмів. Перший і найповніший розділ —
алгоритм Краскала (мінімальне остовне дерево); другий — Флойда–Воршала
(навчання/редактор/плеєр готові; бенчмарк — у планах). Компаньйон до Python-репозиторію з повним розбором:
https://github.com/MarynaShavlak/algo-krustal-mst
Мова — глобальна (стор `lang-store`, перемикач UA/EN у шапці, persist у localStorage).
Повністю двомовний (UA/EN): каталог/шапка, навчальна вкладка (markdown), редактор,
плеєр і бенчмарк. Глобальний перемикач у шапці (`lang-store`, persist). UI-рядки —
`i18n/messages` (парність UA/EN типізована) через `useT()`/`tr()`; нарація trace —
через інжектований у lib-білдери `Translate` (lib лишається фреймворк-незалежним).
(Назва репозиторію й base-path досі `kruskal-mst-visualizer` — деплой не чіпаємо.)

## Стек
- Vite + React + TypeScript (strict), SPA
- @xyflow/react (React Flow) — редактор графа і відмальовка під час програвання
- Zustand — стан; степпер може бути на reducer
- Tailwind CSS + shadcn/ui — каркас UI
- Motion — переходи між кроками
- react-markdown + remark-gfm + remark-math + rehype-katex + Shiki — навчальна вкладка
  (підсвітка ОКРЕМИХ рядків коду через Shiki — обов'язкова)
- Recharts — графіки бенчмарку
- d3-hierarchy або власний SVG — панель «ліс вказівників DSU»
- Vitest + Testing Library — тести

## Архітектура
Платформа на кілька алгоритмів. `src/algorithms/registry.ts` — єдине джерело правди
(каталог, перемикач у шапці й роутер читають його). Дворівневий хеш-роут
`#<algoId>/<tab>` (порожній хеш → каталог), див. `src/hooks/use-route.ts`; є
зворотна сумісність зі старими посиланнями `#editor`/`#playback?g=...`.
Алгоритмічне ядро (`lib/`) — фреймворк-незалежне, без імпортів React.
Додати алгоритм: нова тека `algorithms/<id>/` з описом `Algorithm` + запис у `registry.ts`;
екрани складаються зі спільного `algorithms/shared/` (каркаси) + алгоритмо-специфічних панелей.
src/
algorithms/ types.ts, registry.ts; <id>/index.ts (опис Algorithm) + теки екранів
            kruskal/{learn,editor,playback,benchmark} і floyd-warshall/{learn,editor,playback}
            (benchmark — у планах);
  shared/   спільний UI-«kit»: playback/ (PlayerShell, PlayerControls, CodePanel, Panel,
            player+use-player), learn/ (LearnView, TableOfContents, MarkdownCode, learn-content,
            shiki/scroll-spy), editor/ (graph-doc codec). Специфічне інжектиться пропсами
            (figureForSrc, панелі/слоти плеєра, graph-модель).
features/   home/ (каталог карток), shell/ (AlgorithmShell, AlgorithmSwitcher, ComingSoon)
lib/        graph.ts, directedGraph.ts, dsu.ts, kruskalHasPath.ts, kruskalDsu.ts, trace.ts,
            floydWarshall.ts(+Trace), graphAnalysis.ts, randomGraph.ts, theme.ts
components/ спільний UI (shadcn/ui)
hooks/      use-route.ts (роутер платформи)
i18n/       messages.ts (словник chrome UA/EN, парність типізована) + use-t (хук t())
store/      create-graph-store (generic-ядро) → graph-store / directed-graph-store;
            presets / directed-presets; theme-store, lang-store, toast-store

Ключова абстракція — модель trace: алгоритм проганяється один раз і пише список
незмінних кадрів (Frame), UI лише рухає курсор по них (scrubbing, крок назад).
Формат дворівневий: крок на ребро + підкроки (BFS-фронтир для наївної версії;
підйом find + стиснення шляху + union для DSU).

## Дві реалізації
- has-path: перевірка циклу обходом (BFS) у допоміжному лісі — повільна, для ідеї.
- dsu: Union-Find з union-by-rank + path compression — швидка, основна.
  Обидві ОБОВ'ЯЗКОВО дають ідентичний результат.

## Конвенції
- TypeScript strict, без any.
- Неорієнтований граф: ребро нормалізується як "A|B" (відсортовані кінці),
  без петель і дублів, додатні цілі ваги.
- React-ідіоматика: компоненти PascalCase, решта файлів kebab-case; одна фіча — одна тека.
- Спільне між алгоритмами (каркаси плеєра/навчання, серіалізація графа, generic-стор) живе
  в `algorithms/shared/` і `store/create-graph-store`, а не копіюється між `<id>/` теками;
  алгоритмо-специфічне інжектиться пропсами/конфігом. Див. `docs/refactoring-plan.md`.
- lib/ покривається юніт-тестами і не залежить від UI.
- Не додавай залежності без потреби; кожну нову — познач у відповіді.

## Еталон коректності (для тестів lib/)
Граф: 7 вершин A–G, 11 ребер:
A-B 7, A-D 5, B-C 8, B-D 9, B-E 7, C-E 5, D-E 15, D-F 6, E-F 8, E-G 9, F-G 11.
Правильна МОД = вага 39; ребра: A-D(5), C-E(5), D-F(6), A-B(7), B-E(7), E-G(9).

## Роадмеп (виконувати по фазах, 0–5)
0. Каркас: Vite+TS+Tailwind+shadcn, оболонка з вкладками, деплой-пайплайн.
1. Ядро lib/: порт graph, dsu, обох алгоритмів і trace + повні Vitest-тести проти еталона.
2. Редактор на React Flow: додавання вершин/ребер з вагою, режим покрокової побудови,
   пресети (приклад + випадковий граф), імпорт/експорт JSON + шаринг через URL-хеш,
   панель зв'язності/компонент.
3. Плеєр: спершу DSU-версія з панелями (код з підсвіткою рядків | граф із кольорами
   компонент | ліс DSU з рангами), потім наївна (підсвітка BFS), потім режим порівняння
   обох на одному кроці. Контролери play/pause/крок±1/швидкість/таймлайн, таблиця рішень, нарація.
4. Навчальна вкладка: README через react-markdown з TOC і scroll-spy, статичні фігури
   замінити живими віджетами, перемикач UA/EN.
5. Диференціатори: перемикачі оптимізацій DSU (вимкнення → виродження в ланцюг),
   лічильник операцій + жива складність, бенчмарк у Web Worker, інтерактивні доведення
   (cut property, exchange argument).

## Деплой
GitHub Pages (project site) → у vite.config `base: '/kruskal-mst-visualizer/'`.
Альтернатива — Vercel/Netlify (без base-path).

## Робочий процес
- Працюй по одній фазі; наприкінці — короткий підсумок і запит на наступну.
- Пиши тести разом з кодом lib/.
- Атомарні коміти з осмисленими повідомленнями.