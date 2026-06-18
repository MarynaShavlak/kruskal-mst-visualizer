# Kruskal MST Visualizer

Інтерактивна платформа для вивчення алгоритмів. Перший і найповніший розділ —
алгоритм Краскала (мінімальне остовне дерево); далі — Прим (МОД), Флойда–Воршала,
Хелда–Карпа (TSP), задача про рюкзак 0/1 (динамічне програмування проти перебору
та жадібного), бульбашкове сортування (наївна проти оптимізованої з прапорцем
swapped), сортування вставками (лінійний пошук місця проти бінарної вставки),
сортування прямим вибором (стандартне з обміном проти стабільного зі зсувом) і
швидке сортування (тристороннє «розділяй і володарюй» + дерево рекурсії, перемикач
стратегії опорного), сортування злиттям (поділ навпіл + злиття двома вказівниками,
дерево рекурсії, перемикач реалізації низхідна/вихідна bottom-up — місток до TimSort)
сортування Шелла (узагальнення вставок «через крок» gap, підпослідовності,
перемикач послідовності проміжків n//2/Кнут/Ciura — субквадратичне, нестабільне)
порозрядне сортування radix sort (ПЕРШЕ НЕПОРІВНЯЛЬНЕ — не «що більше?», а самі
цифри: розкладаємо по 10 кошиках 0–9 за цифрою розряду й збираємо, LSD; стабільне
сортування підрахунком — лінчпін; лінійний час O(d·(n+k)), не in-place)
лінійний пошук linear search (ПЕРШИЙ алгоритм ПОШУКУ після серії сортувань:
послідовно перевіряємо кожен елемент зліва направо, доки не знайдемо x → індекс,
або не дійдемо до кінця → -1; масив нерухомий, без передумов; «ціна» — кількість
перевірок arr[i]==x; перемикач режимів «перший збіг»/«усі входження» find_all;
головний акцент — аналіз випадків O(1)/O(n); місток до двійкового пошуку)
і двійковий (бінарний) пошук binary search (ДРУГИЙ алгоритм ПОШУКУ, «винагорода за
сортування»: на ВІДСОРТОВАНОМУ масиві дивимось у середину вікна [low..high] і
відкидаємо половину, у якій шуканого точно немає; вікно звужується вдвічі → O(log n);
передумова — масив відсортований; перемикач реалізації ітеративний/рекурсивний)
— у кожного навчання/редактор/плеєр готові. Компаньйон до
Python-репозиторіїв із повним розбором: https://github.com/MarynaShavlak/algo-krustal-mst
(рюкзак — https://github.com/MarynaShavlak/algo-knapsack,
бульбашка — https://github.com/MarynaShavlak/algo-bubble-sort,
вставки — https://github.com/MarynaShavlak/algo-insertion-sort,
вибір — https://github.com/MarynaShavlak/algo-selection-sort,
швидке — https://github.com/MarynaShavlak/algo-quick-sort,
злиттям — https://github.com/MarynaShavlak/algo-merge-sort,
Шелла — https://github.com/MarynaShavlak/algo-shell-sort,
порозрядне — https://github.com/MarynaShavlak/algo-radix-sort,
лінійний пошук — https://github.com/MarynaShavlak/algo-linear-search,
двійковий пошук — https://github.com/MarynaShavlak/algo-binary-search)
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
            kruskal/{learn,editor,playback,benchmark}, prim/{...}, floyd-warshall/{...},
            held-karp/{learn,editor,playback}, knapsack/{learn,editor,playback},
            bubble-sort/{learn,editor,playback}, insertion-sort/{learn,editor,playback},
            selection-sort/{learn,editor,playback}, quick-sort/{learn,editor,playback},
            merge-sort/{learn,editor,playback}, shell-sort/{learn,editor,playback},
            radix-sort/{learn,editor,playback}, linear-search/{learn,editor,playback},
            binary-search/{learn,editor,playback}
            (рюкзак 0/1: табличний редактор предметів; плеєр — 3 режими ДП/жадібний/перебір;
            бульбашка: редактор масиву чисел; плеєр — 2 режими наївна/оптимізована (swapped),
            панель стовпчиків; вставки: редактор масиву чисел; плеєр — 2 режими лінійна/бінарна,
            панель стовпчиків із «ключем у руці» + «діркою» + зеленим префіксом;
            вибір: редактор масиву чисел; плеєр — 2 режими стандартний (обмін)/стабільний (зсув),
            панель стовпчиків із «біжучим мінімумом» + курсором j + парою обміну ↔ + плаваючим
            мінімумом «у руці» (стабільна);
            швидке: редактор масиву чисел; плеєр — ДЕРЕВО РЕКУРСІЇ (SVG, росте в pre-order) +
            панель розбиття вузла (left/middle/right) + перемикач стратегії опорного
            (середина/перший/останній/медіана-3 → збалансоване проти виродженого дерева);
            злиттям: редактор масиву чисел; плеєр — 2 режими низхідна (ДЕРЕВО РЕКУРСІЇ: поділ
            навпіл униз 🔵/🟧, злиття вгору 🟢)/вихідна (bottom-up: проходи-пробіжки 1,2,4,…) +
            спільна ЗІРКОВА панель злиття двома вказівниками (ліва/права половини + курсори +
            merged); дерево ЗАВЖДИ збалансоване → гарантований O(n·log n);
            Шелла: редактор масиву чисел; плеєр — стовпчики (temp «у руці» + «дірка» +
            🔴 gap-зсув + 🟡 порівняння) з підсвіткою ПОТОЧНОЇ підпослідовності (індекси
            через крок gap, фіолетові чипи) + перемикач послідовності проміжків
            (n//2/Кнут/Ciura → різна ціна на тих самих даних); 76 кадрів = 76 подій;
            порозрядне (radix): редактор масиву НЕВІД'ЄМНИХ цілих; плеєр — КОШИКИ 0–9 +
            фішки-числа з підсвіченою цифрою поточного розряду (🟠 цифра, 🔴 фішка падає,
            🟢 зібраний, ⬜ ще не розкладені; провідні нулі тьмяні) + наочний код «з кошиками»;
            режим/перемикача нема — основа фіксована 10 (вибір основи 2/10/256 — лише таблиця
            у редакторі + навчанні); INTRO [3,89,67,254,9,21,185,4,62] = 35 кадрів = 35 подій;
            лінійний пошук (linear-search): ПЕРШИЙ алгоритм ПОШУКУ (не сортування) — редактор
            масиву цілих + ЦІЛЬ target; плеєр — нерухомий ряд КОМІРОК + курсор-бігунець ▼
            (🌸 перевіряємо, 🟢 знайдено ✓, 🩶 відкинуто ✗, ⬜ ще не перевіряли) + 2 режими
            «перший збіг» (linear_search, зупинка) / «усі входження» (find_all, повний скан);
            кадр = init + по 2 на перевірку (інтрига+розв'язок) + done (8 кадрів на головному
            прикладі = step_00..07); редактор-панель — АНАЛІЗ ВИПАДКІВ (best O(1)/worst/absent/
            avg O(n));
            двійковий пошук (binary-search): ДРУГИЙ алгоритм ПОШУКУ — редактор ВІДСОРТОВАНОГО
            масиву цілих + ЦІЛЬ target + кнопка «Відсортувати» + індикатор передумови (is_sorted);
            плеєр — ВІКНО [low..high], що звужується вдвічі (🟦 активне вікно, 🌸 mid-проба ▼,
            🟥 половина-відкидання ✗, 🟢 збіг ✓, 🩶 поза вікном; дужки low/high) + 2 режими
            ітеративний(while)/рекурсивний(розділяй і володарюй: різний лістинг + «глибина рекурсії»,
            еволюція вікна ідентична); кадр = init + по 2 на крок (проба+розв'язок) + done
            (8 кадрів на INTRO [1,3,5,8,10,12,15,18,20,22,24]→15 = step_00..07; i18n-префікс `bin`,
            бо `bs` зайнятий бульбашкою); benchmark лише у kruskal);
  shared/   спільний UI-«kit»: playback/ (PlayerShell, PlayerControls, CodePanel, Panel,
            player+use-player), learn/ (LearnView, TableOfContents, MarkdownCode, learn-content,
            shiki/scroll-spy), editor/ (graph-doc codec). Специфічне інжектиться пропсами
            (figureForSrc, панелі/слоти плеєра, graph-модель).
features/   home/ (каталог карток), shell/ (AlgorithmShell, AlgorithmSwitcher, ComingSoon)
lib/        graph.ts, directedGraph.ts, dsu.ts, kruskalHasPath.ts, kruskalDsu.ts, trace.ts,
            floydWarshall.ts(+Trace), heldKarp.ts(+Trace), tsp.ts, prim.ts(+Trace),
            knapsack.ts(+Trace, +AltTrace)/exampleKnapsack/randomKnapsack (рюкзак 0/1),
            bubbleSort.ts(+Trace)/exampleBubbleSort/randomArray (сортування, без графа),
            insertionSort.ts(+Trace)/exampleInsertionSort (вставки: лінійна+бінарна, спільний randomArray),
            selectionSort.ts(+Trace)/exampleSelectionSort (вибір: стандартна+стабільна, спільний randomArray),
            quickSort.ts(+Trace)/exampleQuickSort (швидке: тристороння+in-place Ломуто; quicksortSteps → дерево рекурсії),
            mergeSort.ts(+Trace)/exampleMergeSort (злиттям: низхідна mergeSortSteps→дерево +
              вихідна mergeSortBottomUpSteps→проходи; mergeSteps→журнал двох вказівників; спільний randomArray),
            shellSort.ts(+Trace)/exampleShellSort (Шелла: shellSortSteps→журнал подій (gap_start/
              i_start/compare/shift/insert); gapsShell/Knuth/Ciura→послідовності проміжків; спільний randomArray),
            radixSort.ts(+Trace)/exampleRadixSort (порозрядне: countingSort/radixSort (база) +
              radixSortBuckets (наочна) + radixSortSteps→журнал подій кошиків (init/pass_start/distribute/
              gather/final) + countingSortSteps→фази підрахунку (freq/prefix/builds); maxDigits/digitAt;
              НЕВІД'ЄМНІ цілі, base=10; спільний randomArray),
            linearSearch.ts(+Trace)/exampleLinearSearch (лінійний пошук, ПОШУК не сортування:
              linearSearch/existsInList/findAll/linearSearchSentinel/linearSearchSteps (журнал
              init/probe/found/not_found/final) + countComparisons + caseAnalysis (best/worst/absent/avg);
              buildLinearSearchTrace(arr,target,findAll)→кадри інтрига+розв'язок; LINEAR_CODE/FIND_ALL_CODE;
              будь-які цілі, спільний randomArray),
            binarySearch.ts(+Trace)/exampleBinarySearch (двійковий пошук на ВІДСОРТОВАНОМУ:
              binarySearch/binarySearchRecursive (дослівно той самий результат)/lowerBound/upperBound
              (bisect, межі при дублікатах)/isSorted (передумова)/binarySearchSteps (журнал
              init/probe(compare lt/gt + decision right/left)/found/not_found/final) + countSteps +
              caseAnalysis (best 1/worst ⌊log₂n⌋+1/linear n);
              buildBinarySearchTrace(arr,target,recursive)→кадри проба+розв'язок (вікно low/high/mid +
              discardLo/discardHi); ITERATIVE_CODE/RECURSIVE_CODE; SearchCase спільний із linear),
            graphAnalysis.ts, randomGraph.ts, theme.ts
components/ спільний UI (shadcn/ui)
hooks/      use-route.ts (роутер платформи)
i18n/       messages.ts (словник chrome UA/EN, парність типізована) + use-t (хук t())
store/      create-graph-store (generic-ядро) → graph-store / directed-graph-store / prim-graph-store;
            presets / directed-presets; tsp-store(+presets); knapsack-store(+presets, без ребер/координат);
            bubble-sort-store(+presets, масив чисел); insertion-sort-store(+presets, масив чисел);
            selection-sort-store(+presets, масив чисел); quick-sort-store(+presets, масив чисел);
            merge-sort-store(+presets, масив чисел); shell-sort-store(+presets, масив чисел);
            radix-sort-store(+presets, масив НЕВІД'ЄМНИХ цілих);
            linear-search-store(+presets, масив цілих + ЦІЛЬ target);
            binary-search-store(+presets, ВІДСОРТОВАНИЙ масив цілих + ЦІЛЬ target + sortValues);
            theme-store, lang-store, toast-store

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