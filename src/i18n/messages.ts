// Словник UI-рядків (chrome) для t(). Ключі визначає `ua`; `en` типізовано як
// Record<MessageKey, string>, тож пропущений/зайвий ключ — помилка компіляції
// (парність UA/EN гарантована статично). Контент навчальних вкладок сюди НЕ
// входить — він у markdown UA/EN. Поповнюється по фазах i18n.

import type { Lang } from "@/store/lang-store"

const ua = {
  "app.title": "Алгоритми: інтерактивні розбори",
  "app.subtitle": "Платформа для вивчення алгоритмів",

  "common.loading": "Завантаження…",
  "common.ready": "Готово",
  "common.soon": "Незабаром",
  "common.soonShort": "скоро",
  "common.cancel": "Скасувати",
  "common.save": "Зберегти",

  "home.heading": "Оберіть алгоритм",
  "home.intro":
    "Інтерактивні розбори: теорія, редактор графа, покрокове програвання та бенчмарк. Нові алгоритми додаються поступово.",

  "switcher.aria": "Обрати алгоритм",
  "switcher.placeholder": "Оберіть алгоритм",
  "switcher.label": "Алгоритми",

  "comingSoon.badge": "У розробці — незабаром",
  "comingSoon.plannedTitle": "Що буде в цьому розділі:",

  "learn.heading": "Навчальний розбір",
  "toc.title": "Зміст",
  // Крупний план клітинки ДП (навчальний віджет).
  "learn.knapCellTake": "взяти",
  "learn.knapCellSkip": "не брати",
  "learn.knapCellBase": "база",
  "learn.knapCellNofit": "не вміщається",
  "learn.knapTreeLegend":
    "Ліва гілка — взяти предмет (+вартість), права — не брати; число у вузлі — найкраща вартість підзадачі; ★ — оптимальний шлях.",
  "learn.knapTreeTooBig": "Дерево завелике для показу ({n} предметів).",

  "tab.learn": "Навчання",
  "tab.editor": "Редактор",
  "tab.playback": "Алгоритм",
  "tab.benchmark": "Бенчмарк",

  // — Редактор (Фаза 3) —
  // Тулбар (спільний для всіх редакторів).
  "editor.example": "Приклад",
  "editor.random": "Випадковий",
  "editor.vertex": "Вершина",
  "editor.clear": "Очистити",
  "editor.import": "Імпорт",
  "editor.export": "Експорт",
  "editor.share": "Поділитися",
  // Спільні панелі / стани.
  "editor.emptyGraph": "Граф порожній — додайте вершини.",
  "editor.countVertices": "Вершини",
  "editor.countEdges": "Ребра",
  // Тости.
  "editor.importFailed": "Не вдалося імпортувати",
  "editor.linkCopied": "Посилання скопійовано в буфер обміну.",
  // Помилки кодека (показуються в тості імпорту).
  "editor.errNotObject": "Документ має бути об'єктом",
  "editor.errBadVersion": "Непідтримувана версія документа",
  "editor.errBadVertices": "Поле vertices невалідне",
  "editor.errBadEdges": "Поле edges невалідне",
  "editor.errBadPositions": "Поле positions невалідне",
  "editor.errBadPosition": "Позиція має бути [x, y]",
  "editor.errBadCities": "Поле cities невалідне",
  "editor.errBadStart": "Поле start невалідне",
  // Діалог ваги ребра.
  "editor.weightTitle": "Вага ребра",
  "editor.weightDescPositive": "Додатне ціле число.",
  "editor.weightErrPositive": "Вага має бути додатним цілим числом.",
  "editor.weightDescAnyInt": "Ціле число — додатне, нульове або від'ємне.",
  "editor.weightErrAnyInt": "Вага має бути цілим числом (можна 0 або від'ємне).",
  // Краскал.
  "editor.connTitle": "Зв'язність",
  "editor.connComponents": "Компоненти",
  "editor.connConnected": "Граф зв'язний — існує остовне дерево (МОД).",
  "editor.connDisconnected":
    "Граф незв'язний ({n} компонент) — буде остовний ліс.",
  // Флойд–Воршал.
  "editor.fwExample": "Приклад A–F",
  "editor.fwNegEdge": "Від'ємне ребро",
  "editor.fwNegCycle": "Від'ємний цикл",
  "editor.fwEdgeExists": "Ребро {from}→{to} вже існує.",
  "editor.fwMatrixTitle": "Матриця суміжності",
  "editor.fwEdgesDirected": "Ребра (напрямлені)",
  "editor.fwNegCycleWarn":
    "Виявлено від'ємний цикл (на діагоналі найкоротших відстаней з'являється від'ємне значення) — найкоротші шляхи не визначені.",
  // Хелда–Карпа.
  "editor.hkExample": "Приклад A–E",
  "editor.hkCity": "Місто",
  "editor.hkCoords": "Координати",
  "editor.hkStartCity": "Стартове місто",
  "editor.hkMakeStartHint": "Подвійний клік — зробити стартом",
  "editor.hkCoordsTitle": "Координати міст",
  "editor.hkCoordsDescPre": "Цілі математичні координати (як у прикладі ",
  "editor.hkCoordsDescPost": "). Радіокнопка позначає стартове місто.",
  "editor.hkColNum": "№",
  "editor.hkColStart": "старт",
  "editor.hkNoCities": "Ще немає міст — додай перше.",
  "editor.hkAddCity": "Додати місто",
  "editor.hkCoordsDup":
    "Дві точки збігаються в ({x}, {y}) — координати мають бути різними.",
  "editor.hkAriaCityX": "X міста {name}",
  "editor.hkAriaCityY": "Y міста {name}",
  "editor.hkMakeStartOf": "Зробити стартом — {name}",
  "editor.hkStartOf": "Старт — {name}",
  "editor.hkDeleteOf": "Видалити {name}",
  "editor.hkDistTitle": "Матриця відстаней",
  "editor.hkDistEmpty": "Порожньо — подвійний клік по полю додає місто.",
  "editor.hkNeedTwo": "Потрібно щонайменше 2 міста, щоб був маршрут.",
  "editor.hkCities": "Міст",
  "editor.hkStart": "Старт",
  "editor.hkDpSub": "Підзадач ДП (n²·2ⁿ)",
  "editor.hkBruteTours": "Турів у переборі ((n−1)!)",
  "editor.hkWarnMany":
    "Багато міст: час і пам'ять Хелда–Карпа (O(n·2ⁿ)) помітно зростають.",
  "editor.hkWarnTooMany":
    "Забагато міст — Хелда–Карпа недоцільно запускати у браузері: пам'ять O(n·2ⁿ) вибухає. Зменште кількість міст.",
  // Рюкзак.
  "editor.errBadItems": "Поле items невалідне",
  "editor.errBadCapacity": "Поле capacity невалідне",
  "editor.knapClassic": "Класичний (W=50)",
  "editor.knapSmall": "Малий (W=4)",
  "editor.knapItem": "Предмет",
  "editor.knapCapacity": "Місткість рюкзака",
  "editor.knapColName": "Предмет",
  "editor.knapColWeight": "Вага",
  "editor.knapColValue": "Вартість",
  "editor.knapColRatio": "Цінність/вага",
  "editor.knapNoItems": "Ще немає предметів — додай перший.",
  "editor.knapItems": "Предметів",
  "editor.knapTotalWeight": "Сумарна вага",
  "editor.knapBruteSubsets": "Підмножин (2ⁿ)",
  "editor.knapDpCells": "Клітинок ДП ((n+1)·(W+1))",
  "editor.knapWarnMany":
    "Велика місткість: таблиця ДП ((n+1)·(W+1)) і кількість кадрів плеєра помітно зростають.",
  "editor.knapDeleteOf": "Видалити {name}",
  "editor.knapAriaName": "Назва предмета {name}",
  "editor.knapAriaWeight": "Вага {name}",
  "editor.knapAriaValue": "Вартість {name}",
  "editor.knapHelpCell": "Клітинка таблиці",
  "editor.helpKnapAddItem": "додати предмет",
  "editor.helpKnapEditCell": "редагувати назву, вагу чи вартість",
  "editor.helpKnapCapacity": "змінити місткість рюкзака W",
  "editor.helpKnapRemove": "видалити предмет",
  "editor.helpKnapNote":
    "Питома цінність (цінність/вага) рахується автоматично — саме за нею працює жадібний метод.",
  // Підказка під редактором — дії (чипи) та їхній ефект.
  "editor.helpDblCanvas": "Подвійний клік по полю",
  "editor.helpDragNodes": "Перетягнути між вузлами",
  "editor.helpDblEdge": "Подвійний клік по ребру",
  "editor.helpDragCity": "Перетягнути місто",
  "editor.helpDblCity": "Подвійний клік по місту",
  "editor.helpCoordsBtn": "Кнопка «Координати»",
  "editor.helpAddVertex": "додати вершину",
  "editor.helpAddEdge": "ребро із запитом ваги",
  "editor.helpAddDirectedEdge": "напрямлене ребро, можна від'ємну вагу",
  "editor.helpChangeWeight": "змінити вагу",
  "editor.helpRemoveSelection": "видалити виділене",
  "editor.helpAddCity": "додати місто",
  "editor.helpChangeCoords": "змінити координати (снап до сітки)",
  "editor.helpMakeStart": "зробити стартом",
  "editor.helpEnterCoords": "ввести точні x/y вручну",
  "editor.helpHkNote":
    "Відстані в матриці — евклідові, перераховуються автоматично.",
  "editor.numK": " тис.",
  "editor.numM": " млн",
  "editor.numB": " млрд",

  // — Плеєр (Фаза 4, хром; нарація кроків поки UA) —
  // Контролери та спільне.
  "play.toStart": "На початок",
  "play.stepBack": "Крок назад",
  "play.play": "Грати",
  "play.pause": "Пауза",
  "play.stepForward": "Крок вперед",
  "play.timeline": "Таймлайн",
  "play.step": "Крок",
  "play.code": "Код",
  "play.emptyGraph": "Граф порожній — створіть його у вкладці «Редактор».",
  "play.edgesCount": "{n} ребер",
  "play.edgeSingular": "ребро",
  "play.edgesPlural": "ребер",
  // Краскал.
  "play.modeNaive": "Наївна (BFS)",
  "play.modeCompare": "Порівняння",
  "play.algoVersion": "Версія алгоритму:",
  "play.dsuOpts": "Оптимізації DSU:",
  "play.unionByRank": "об'єднання за рангом",
  "play.pathCompression": "стиснення шляху",
  "play.noOptWarn": "без оптимізацій дерево вироджується в ланцюг — find стає O(n)",
  "play.totalFindSteps": "усього find-кроків:",
  "play.codeDsu": "Код — Краскал на DSU",
  "play.graphDsu": "Граф — множини DSU (кольори компонент)",
  "play.codeNaive": "Код — наївний Краскал (BFS)",
  "play.graphNaive": "Граф — допоміжний ліс + BFS",
  "play.findSteps": "find-кроків:",
  "play.unions": "об'єднань:",
  "play.compressions": "стиснень шляху:",
  "play.summary": "Підсумок",
  "play.naiveLower": "наївна",
  "play.mstWeight": "Вага МОД:",
  "play.spanningTree": "остовне дерево",
  "play.spanningForest": "остовний ліс (граф незв'язний)",
  "play.cmpStart": "Старт: обидві версії починають з порожньої МОД.",
  "play.edgeStep": "Ребро-крок",
  "play.cmpNaive": "Наївна",
  "play.cmpGraphDsu": "DSU — множини (кольори компонент)",
  "play.cmpGraphNaive": "Наївна — ліс (BFS)",
  "play.cmpNote":
    "Обидві реалізації приймають ті самі ребра й дають однакову МОД — різниться лише внутрішня механіка: DSU-множини проти BFS у допоміжному лісі.",
  "play.decisionTable": "Таблиця рішень",
  "play.colEdge": "Ребро",
  "play.colWeight": "Вага",
  "play.colDecision": "Рішення",
  "play.stInMst": "у МОД",
  "play.stCycle": "цикл",
  "play.stConsider": "розгляд",
  "play.naiveTitle": "BFS у допоміжному лісі",
  "play.curVertex": "Поточна вершина",
  "play.queue": "Черга (фронтир)",
  "play.visited": "Відвідані",
  "play.naiveHint":
    "Ребро додається лише тоді, коли BFS НЕ знайшов шлях між його кінцями (інакше — цикл).",
  "play.dsuForest": "Ліс DSU",
  "play.dsuForestOnly": "Доступно лише для DSU-версії алгоритму.",
  "play.dsuForestTitle": "Ліс DSU (ранги, вказівники)",
  "play.rank": "ранг",
  "play.graphCompon": "Граф (кольори компонент)",
  // Флойд–Воршал.
  "play.negCycle": "від'ємний цикл",
  "play.intermediateK": "проміжна k:",
  "play.relaxTotal": "релаксацій усього:",
  "play.improvedThisK": "покращено на цьому k:",
  "play.codeFw": "Код (Флойд–Воршал)",
  "play.fwNegCycleCap": "Від'ємний цикл",
  "play.fwAllPairs": "Найкоротші відстані між усіма парами знайдено",
  "play.fwResultStats": "{n} вершин · {m} релаксацій",
  "play.relaxLog": "Журнал релаксацій ({n})",
  "play.relaxEmpty": "Ще немає покращень — почніть програвання.",
  "play.colViaK": "через k",
  "play.colPath": "шлях",
  "play.colBeforeAfter": "було → стало",
  "play.pathReconstruct": "Відновлення шляху",
  "play.fwNegCycleUndefined":
    "Граф містить від'ємний цикл — найкоротші шляхи не визначені.",
  "play.from": "звідки",
  "play.to": "куди",
  "play.noPath": "Шляху {u} → {v} немає (∞).",
  "play.pathLength": "Довжина шляху:",
  "play.matrixD": "Матриця відстаней D",
  "play.fwNoChange": "(без змін)",
  "play.legSummands": "доданки",
  "play.legImproved": "покращено",
  "play.legRowColK": "рядок/стовпець k",
  "play.graphDirected": "Граф (орієнтований)",
  "play.legIFrom": "i — звідки",
  "play.legKInter": "k — проміжна",
  "play.legJTo": "j — куди",
  // Хелда–Карпа.
  "play.hkTooFew":
    "Замало міст для маршруту — додайте принаймні два у вкладці «Редактор».",
  "play.hkTooMany":
    "Для покрокового плеєра підтримано до {max} міст (інакше забагато кадрів). Зараз — {n}. Зменшіть кількість у редакторі.",
  "play.codeHk": "Код (Хелда–Карпа)",
  "play.hkLevel": "рівень |S|:",
  "play.hkSubset": "підмножина S:",
  "play.hkDpCells": "комірок dp:",
  "play.hkShortestTour": "найкоротший тур:",
  "play.hkOptimalTour": "Оптимальний тур",
  "play.hkResultStats": "{n} міст · {m} підзадач · ≈{ops} операцій",
  "play.hkPhaseBase": "база",
  "play.hkPhaseBuild": "нарощування · |S|={lvl}",
  "play.hkPhaseClosing": "замикання",
  "play.hkPhaseDone": "готово",
  "play.hkMapTitle": "Карта міст і маршрут",
  "play.legStart": "старт",
  "play.legEndJ": "кінець j",
  "play.legRoute": "маршрут",
  "play.cycle": "цикл",
  "play.path": "шлях",
  "play.hkMatrixTitle": "Матриця відстаней",
  "play.legActiveEdge": "активне ребро",
  "play.candTitle": "Вибір у min()",
  "play.candEmpty":
    "Тут з'явиться розбір min() — коли почнемо рахувати комірку dp.",
  "play.candClosingFormula": "тур = min( dp[усі, j] + dist[j→{start}] )",
  "play.candBlock": "блок {path} → {end}",
  "play.candEnd": "кінець {j} → {start}",
  "play.dpTitle": "Таблиця dp[(S, j)]",
  "play.dpProgress": "готово {n}/{total} комірок",
  "play.dpEmpty": "Ще порожньо — почнемо з базових ребер зі старту.",
  "play.dpBase": "База · |S|=2",
  "play.dpLevel": "Рівень · |S|={lvl}",

  // — Нарація кроків (Фаза 4, частина 2) —
  // Спільне (Краскал).
  "play.nConsider": "Розглядаємо ребро {edge} (вага {w}).",
  "play.nDone": "Зібрано {need} ребер — остовне дерево готове.",
  // Краскал — DSU.
  "play.nDsuInit":
    "Ініціалізація: кожна вершина — окрема множина (DSU), МОД порожня.",
  "play.nDsuFind": "find({v}): підйом {path}; корінь {root}.",
  "play.nDsuCompress": "Стиснення шляху: {nodes} → {root}.",
  "play.nDsuCycle":
    "{u} і {v} в одній множині (корінь {root}) — цикл, пропускаємо.",
  "play.nDsuUnion":
    "Різні множини — обʼєднуємо {rootX} та {rootY} → корінь {root}{rankNote}.",
  "play.nDsuRankUp": "; ранг {root}↑",
  "play.nDsuAccept": "Додаємо {edge} до МОД (вага {w}).",
  // Краскал — наївний (BFS).
  "play.nHpInit": "Ініціалізація: допоміжний ліс порожній, МОД порожня.",
  "play.nBfsReached": "BFS досяг {v} — шлях у лісі існує.",
  "play.nBfsVisit": "BFS відвідує {v}; фронтир [{frontier}].",
  "play.nBfsExhausted": "BFS вичерпав чергу — шляху немає.",
  "play.nHpCycle": "{u} і {v} вже зʼєднані в лісі — цикл, пропускаємо.",
  "play.nHpAccept": "Шляху немає — додаємо {edge} до МОД (вага {w}).",
  // Флойд–Воршал.
  "play.nFwInit":
    "Стартова матриця D: 0 на діагоналі, ваги прямих ребер, решта — ∞.",
  "play.nFwOpenK":
    "Відкриваємо проміжну вершину k = {k}. Маршрутам дозволено транзит через неї.",
  "play.nFwCmpInf": "({a}→{b}) через {k}: шлях недосяжний (∞) — без змін.",
  "play.nFwCmpRelax":
    "({a}→{b}) через {k}: {viaK} < {current} — є коротший маршрут, оновимо D[{a}][{b}].",
  "play.nFwCmpNoChange": "({a}→{b}) через {k}: {viaK} ≥ {current} — без змін.",
  "play.nFwApply":
    "Записуємо D[{a}][{b}] = {viaK} і запам'ятовуємо перший крок маршруту (nxt).",
  "play.nFwKDoneNone": "Вершину {k} опрацьовано: без змін.",
  "play.nFwKDoneSome": "Вершину {k} опрацьовано: покращень — {n}.",
  "play.nFwDoneNeg":
    "Готово, але виявлено від'ємний цикл (D[i][i] < 0) — справжні найкоротші відстані не визначені.",
  "play.nFwDone":
    "Готово: знайдено найкоротші відстані між усіма парами вершин.",
  // Хелда–Карпа.
  "play.nHkInit":
    "Будуємо таблицю dp[(S, j)] — найкоротший шлях зі старту через підмножину S з кінцем у j. Старт — {start}.",
  "play.nHkBase":
    "База: пряме ребро {from}→{to} = {cost}. Найдрібніша «цеглинка».",
  "play.nHkLevelOpen":
    "Рівень {r}: підмножини з {r} міст ({cells} підзадач). Спираємось на готові блоки рівня {prev}.",
  "play.nHkCellOpen": "Рахуємо найкоротший шлях через {subset} з кінцем у {end}.",
  "play.nHkCand":
    "Передостаннє {k}: блок ({path}) = {blockCost} + ребро {k}→{end} {edge} = {total}{verdict}",
  "play.nHkCandBetter": " — новий найкращий.",
  "play.nHkCandWorse": " — гірше, відкидаємо.",
  "play.nHkCommit": "Обрано: {path} = {cost} (через {bestK}).",
  "play.nHkClosingOpen":
    "Замикаємо маршрут: до кожного шляху через усі міста додаємо ребро назад у старт.",
  "play.nHkClosingCand":
    "Тур через кінець {j}: {blockCost} + ребро {j}→{start} {edge} = {total}{verdict}",
  "play.nHkTourBetter": " — новий найкоротший тур.",
  "play.nHkTourWorse": " — довше за поточний.",
  "play.nHkDone": "Готово: оптимальний тур {path} = {cost}.",

  // — Рюкзак (плеєр + нарація) —
  "play.knapMethod": "Метод:",
  "play.knapModeDp": "Динамічне програмування",
  "play.knapModeGreedy": "Жадібний",
  "play.knapModeBrute": "Повний перебір",
  "play.knapEmpty": "Немає предметів — додайте їх у вкладці «Редактор».",
  "play.knapDpTooBig":
    "Таблиця ДП завелика для покрокового плеєра (понад {max} клітинок). Зменшіть місткість або кількість предметів у редакторі.",
  "play.knapBruteTooBig":
    "Забагато підмножин (2ⁿ) для покрокового перебору. Зменшіть кількість предметів у редакторі.",
  "play.codeKnapDp": "Код — ДП (таблиця K[i][w])",
  "play.codeKnapGreedy": "Код — жадібний метод",
  "play.codeKnapBrute": "Код — повний перебір",
  "play.knapStatFilled": "клітинок:",
  "play.knapStatItems": "предметів:",
  "play.knapStatCapacity": "місткість:",
  "play.knapStatChecked": "перевірено:",
  "play.knapStatBest": "найкраща:",
  "play.knapPhaseFill": "заповнення",
  "play.knapPhaseBacktrack": "відновлення",
  "play.knapPhaseDone": "готово",
  "play.knapOptimum": "Оптимальна вартість",
  "play.knapChosenSet": "Обраний набір",
  "play.knapSetWeight": "сумарна вага {w} ≤ {cap}",
  "play.knapGreedyValue": "Жадібний результат",
  "play.knapVsOptimal": "Оптимум (ДП): {optimal}",
  "play.knapGreedyLoses":
    "Жадібний програв оптимуму на {gap} — для задачі 0/1 він не гарантує найкращого набору.",
  "play.knapGreedyMatches": "Тут жадібний збігся з оптимумом (щастить не завжди).",
  "play.knapBest": "Найкраща підмножина",
  "play.knapChecked": "перевірено {n} = 2ⁿ підмножин",
  "play.knapDpTitle": "Таблиця K[i][w]",
  "play.knapDpProgress": "заповнено {n}/{total} клітинок",
  "play.knapItemsTitle": "Предмети (W = {w})",
  "play.knapGreedyTitle": "Жадібний: за питомою цінністю",
  "play.knapFilled": "{used}/{cap} зайнято",
  "play.knapValue": "вартість {v}",
  "play.knapColStatus": "статус",
  "play.knapTaken": "взято",
  "play.knapSkipped": "пропущено",
  "play.knapPending": "попереду",
  "play.knapSubsetsTitle": "Підмножини (повний перебір)",
  "play.knapSubsetsProgress": "перевірено {n}/{total}",
  "play.knapColSubset": "Підмножина",
  "play.knapColFits": "влазить",
  // Нарація рюкзака — ДП.
  "play.nKnInit":
    "Будуємо таблицю K[i][w]: максимальна вартість для перших i предметів і місткості w. Рюкзак вміщає {w}, предметів {n}.",
  "play.nKnRowBase": "Базовий рядок i=0: без жодного предмета вартість скрізь 0.",
  "play.nKnRowOpen":
    "Рядок i={i}: тепер дозволено предмет {name} (вага {wt}, вартість {val}).",
  "play.nKnBase": "K[{i}][{w}] — база (немає предметів або місткість 0) → 0.",
  "play.nKnTake":
    "K[{i}][{w}]: {name} вміщається. Взяти: {val}+K[{prev}][{rem}] = {take}; не брати: {skip}. {take} > {skip} → беремо, K={value}.",
  "play.nKnSkip":
    "K[{i}][{w}]: {name} вміщається, але взяти {take} ≤ не брати {skip} → не беремо, K={value}.",
  "play.nKnNofit":
    "K[{i}][{w}]: {name} (вага {wt}) не вміщається у {w} → беремо значення зверху, K={value}.",
  "play.nKnFillDone":
    "Таблицю заповнено. Відповідь у правому нижньому куті: K[{n}][{w}] = {best}.",
  "play.nKnBtOpen": "Відновлюємо набір зворотним проходом з K[{n}][{w}] = {best}.",
  "play.nKnBtTake":
    "K[{i}][{w}]={value} ≠ K[{prev}][{w}]={above} → предмет {name} був узятий. Звільняємо вагу {wt}: w→{colAfter}.",
  "play.nKnBtSkip":
    "K[{i}][{w}]={value} = K[{prev}][{w}]={above} → предмет {name} не брали; w без змін.",
  "play.nKnDone": "Готово. Оптимум {best}; набір {{set}} (сумарна вага {weight}).",
  // Нарація рюкзака — жадібний.
  "play.nKnGreedyInit":
    "Сортуємо предмети за питомою цінністю (спадно) і беремо, поки вміщається. Рюкзак вміщає {w}.",
  "play.nKnGreedyTake":
    "{name} (цінність/вага {ratio}): вага {wt} ≤ вільні {free} → беремо. Вартість +{val} = {total}.",
  "play.nKnGreedySkip":
    "{name} (цінність/вага {ratio}): вага {wt} > вільні {free} → пропускаємо.",
  "play.nKnGreedyDone": "Жадібний підсумок: {total}. Оптимум {optimal}{gapNote}.",
  "play.nKnGreedyGap": " — програш {gap}",
  // Нарація рюкзака — повний перебір.
  "play.nKnBruteInit":
    "Перебираємо всі {count} підмножин предметів; лідер — найцінніша з тих, що влазять.",
  "play.nKnBruteSubset": "{set}: вага {w}, вартість {v} — {verdict}",
  "play.nKnBruteNofit": "не влазить.",
  "play.nKnBruteLeader": "новий лідер {v}.",
  "play.nKnBruteWorse": "не краще за лідера.",
  "play.nKnBruteDone": "Перевірено {count} підмножин. Найкраща: {set} = {best}.",

  // — Плеєр Прима —
  "play.primCode": "Код — Прим (лінива черга)",
  "play.primGraph": "Граф — дерево, що росте",
  "play.primQueue": "Черга з пріоритетами",
  "play.primQueueEmpty": "Черга порожня.",
  "play.primPopped": "Знято:",
  "play.primAccepted": "прийнято",
  "play.primStaleTag": "застаріле",
  "play.primChecking": "перевіряємо…",
  "play.primMstEdges": "Ребра МОД (у порядку додавання)",
  "play.primNoEdgesYet": "Ще жодного ребра — почніть програвання.",
  "play.primEdgesShort": "ребер",
  "play.primTreeSize": "дерево:",
  "play.primQueueSize": "у черзі:",
  "play.primPoppedCount": "знято з черги:",
  "play.primStaleCount": "застарілих ребер:",
  // Нарація Прима.
  "play.nPrimEmpty": "Граф порожній — створіть його у вкладці «Редактор».",
  "play.nPrimInit":
    "Старт із вершини {start}. Дерево росте з неї; у чергу кладемо всі її ребра: {pushed}.",
  "play.nPrimPop":
    "Знімаємо з черги найдешевше ребро {edge}. Перевіряємо: чи {to} уже в дереві?",
  "play.nPrimAccept":
    "{to} ще зовні → приймаємо {edge} (вага {w}). У дереві {count}/{need} ребер, вага {total}. Нові кандидати в чергу: {pushed}.",
  "play.nPrimAcceptNoPush":
    "{to} ще зовні → приймаємо {edge} (вага {w}). У дереві {count}/{need} ребер, вага {total}. Нових ребер немає — усі сусіди {to} вже в дереві.",
  "play.nPrimSkip":
    "{to} уже в дереві → ребро {edge} застаріле. Ліниве видалення: мовчки пропускаємо.",
  "play.nPrimDone":
    "Готово: у дереві всі {n} вершин, {need} ребер, вага МОД {total}.",
  "play.nPrimDoneDisc":
    "Черга порожня, але в дереві лише {reached} із {n} вершин — граф незв'язний. Прим охопив тільки компоненту старту (вага {total}).",

  // — Бенчмарк (Фаза 5) —
  "bench.title": "Бенчмарк: DSU проти наївної (has-path)",
  "bench.introPre":
    "Обидві реалізації дають однакову МОД, але час росте по-різному: DSU — майже лінійно за розміром графа, наївна (BFS у допоміжному лісі) — значно швидше. Обчислення виконуються у ",
  "bench.introPost": ", тож інтерфейс не блокується.",
  "bench.run": "Запустити бенчмарк",
  "bench.restart": "Перезапустити",
  "bench.running": "Рахуємо…",
  "bench.empty": "Натисніть «Запустити бенчмарк»",
  "bench.axisVertices": "вершини",
  "bench.axisMs": "мс",
  "bench.lineNaive": "наївна (has-path)",
  "bench.colVertices": "Вершини",
  "bench.colEdges": "Ребра",
  "bench.colDsuMs": "DSU, мс",
  "bench.colHasPathMs": "has-path, мс",
  "bench.colSpeedup": "Прискорення",

  // — Бульбашкове сортування —
  // Редактор.
  "editor.bsIntro": "Приклад [5,1,4,2,8,3]",
  "editor.bsBest": "Відсортований (найкращий)",
  "editor.bsWorst": "Зворотний (гірший)",
  "editor.bsValue": "Число",
  "editor.bsArrayTitle": "Масив чисел",
  "editor.bsNoValues": "Масив порожній — додайте перше число.",
  "editor.bsSize": "Елементів",
  "editor.bsMaxComparisons": "Порівнянь (n(n−1)/2)",
  "editor.bsMaxPasses": "Проходів (n−1)",
  "editor.bsSortedYes": "Масив уже відсортовано",
  "editor.bsSortedNo": "Масив не відсортовано",
  "editor.bsWarnMany":
    "Масив завеликий — плеєр може бути неплавним. Зменште кількість елементів.",
  "editor.bsAriaValue": "Значення на індексі {i}",
  "editor.bsDeleteAt": "Видалити елемент {i}",
  "editor.bsHelpCell": "Клітинка масиву",
  "editor.helpBsAdd": "додати число в кінець масиву",
  "editor.helpBsEdit": "редагувати значення (ціле ≥ 0)",
  "editor.helpBsRemove": "видалити число з масиву",
  "editor.helpBsNote":
    "Сортуються будь-які цілі числа. Спробуйте відсортований і зворотний масиви, щоб побачити найкращий і гірший випадки.",
  "editor.bsErrBadValues": "Поле values має бути масивом чисел",
  // Плеєр.
  "play.bsMethod": "Версія:",
  "play.bsModeNaive": "Наївна",
  "play.bsModeOptimized": "Оптимізована (swapped)",
  "play.bsEmpty": "Масив порожній — додайте числа у вкладці «Редактор».",
  "play.bsTooBig":
    "Масив завеликий для плавного плеєра (понад {max} елементів). Зменште його у вкладці «Редактор».",
  "play.bsStatComparisons": "порівнянь:",
  "play.bsStatSwaps": "обмінів:",
  "play.bsStatPass": "прохід:",
  "play.bsStatSize": "елементів:",
  "play.bsPhaseScan": "порівняння",
  "play.bsPhasePass": "кінець проходу",
  "play.bsPhaseDone": "готово",
  "play.bsArrayTitle": "Масив (n = {n})",
  "play.codeBsNaive": "Код — наївна бульбашка",
  "play.codeBsOptimized": "Код — оптимізована (swapped)",
  "play.bsInputLabel": "Вхід",
  "play.bsSortedLabel": "Відсортовано",
  "play.bsResultSummary": "Підсумок",
  "play.bsResultCounts":
    "{comparisons} порівнянь · {swaps} обмінів · {passes} проходів",
  "play.bsSaved":
    "Рання зупинка зекономила {saved} порівнянь (наївна зробила б {max}).",
  "play.nBsInit":
    "Старт: масив {arr}, n = {n}. Зовнішній цикл зробить щонайбільше {passes} проходів.",
  "play.nBsCompareSwap":
    "Прохід i={i}, j={j}: {left} > {right} — пара стоїть неправильно, міняємо місцями. Порівнянь: {comparisons}, обмінів: {swaps}.",
  "play.nBsCompareKeep":
    "Прохід i={i}, j={j}: {left} ≤ {right} — порядок правильний, лишаємо. Порівнянь: {comparisons}, обмінів: {swaps}.",
  "play.nBsPassEnd":
    "Кінець проходу i={i}: значення {value} «сплило» на індекс {locked} — стало на місце, зелений хвіст виріс. Наступний прохід на один коротший.",
  "play.nBsEarlyStop":
    "За весь прохід i={i} не було жодного обміну → масив уже відсортовано. Рання зупинка.",
  "play.nBsDone":
    "Готово: масив відсортовано {arr}. Усього {comparisons} порівнянь і {swaps} обмінів за {passes} проходи(-ів).",
  // Навчальні віджети.
  "learn.bsLegendComparing": "порівнюються",
  "learn.bsLegendSwapped": "щойно обміняли",
  "learn.bsLegendSorted": "на місці",
  "learn.bsLegendUnsorted": "не впорядковано",
  "learn.bsVerdictSwap": "{left} > {right} — обмін",
  "learn.bsVerdictKeep": "{left} ≤ {right} — лишаємо",
  "learn.bsCounters": "порівнянь: {comparisons}, обмінів: {swaps}",
  "learn.bsResultSummary":
    "{comparisons} порівнянь · {swaps} обмінів · {passes} проходів",
  "learn.bsStart": "старт",
  "learn.bsPass": "прохід {i}",
  "learn.bsStableNote":
    "Стабільно: серед рівних ключів порядок підписів не змінився.",
  "learn.bsGrowthNote": "n²/2 росте катастрофічно швидше за n·log₂n.",

  // — Сортування вставками —
  // Редактор.
  "editor.isIntro": "Приклад [5,2,4,6,1,3]",
  "editor.isBest": "Відсортований (найкращий)",
  "editor.isWorst": "Зворотний (гірший)",
  "editor.isValue": "Число",
  "editor.isArrayTitle": "Масив чисел",
  "editor.isNoValues": "Масив порожній — додайте перше число.",
  "editor.isSize": "Елементів",
  "editor.isMaxComparisons": "Порівнянь у гіршому (n(n−1)/2)",
  "editor.isInsertions": "Вставок (n−1)",
  "editor.isSortedYes": "Масив уже відсортовано",
  "editor.isSortedNo": "Масив не відсортовано",
  "editor.isWarnMany":
    "Масив завеликий — плеєр може бути неплавним. Зменште кількість елементів.",
  "editor.isAriaValue": "Значення на індексі {i}",
  "editor.isDeleteAt": "Видалити елемент {i}",
  "editor.isHelpCell": "Клітинка масиву",
  "editor.helpIsAdd": "додати число в кінець масиву",
  "editor.helpIsEdit": "редагувати значення (ціле ≥ 0)",
  "editor.helpIsRemove": "видалити число з масиву",
  "editor.helpIsNote":
    "Сортуються будь-які цілі числа. Спробуйте відсортований і зворотний масиви, щоб побачити найкращий і гірший випадки.",
  "editor.isErrBadValues": "Поле values має бути масивом чисел",
  // Плеєр.
  "play.isMethod": "Версія:",
  "play.isModeLinear": "Лінійна",
  "play.isModeBinary": "Бінарна (двійковий пошук)",
  "play.isEmpty": "Масив порожній — додайте числа у вкладці «Редактор».",
  "play.isTooBig":
    "Масив завеликий для плавного плеєра (понад {max} елементів). Зменште його у вкладці «Редактор».",
  "play.isStatComparisons": "порівнянь:",
  "play.isStatShifts": "зсувів:",
  "play.isStatPass": "ітерація:",
  "play.isStatSize": "елементів:",
  "play.isPhaseKey": "ключ у руці",
  "play.isPhaseScan": "пошук місця",
  "play.isPhaseInsert": "вставка",
  "play.isPhaseDone": "готово",
  "play.isArrayTitle": "Масив (n = {n})",
  "play.codeIsLinear": "Код — лінійна вставка",
  "play.codeIsBinary": "Код — бінарна вставка",
  "play.isInputLabel": "Вхід",
  "play.isSortedLabel": "Відсортовано",
  "play.isResultSummary": "Підсумок",
  "play.isResultCounts":
    "{comparisons} порівнянь · {shifts} зсувів · {insertions} вставок",
  "play.isSaved":
    "Бінарний пошук: лише {comparisons} порівнянь (гірший лінійний — до {max}).",
  "play.nIsInit":
    "Старт: масив {arr}, n = {n}. Лівий елемент — тривіальний відсортований префікс.",
  "play.nIsTake":
    "Ітерація i={i}: беремо key = {key} «у руку». На позиції {pos} лишається «дірка»; префікс [0, {prefix}) уже відсортований.",
  "play.nIsShift":
    "i={i}, j={j}: {key} < {compared} — {compared} більший, зсуваємо його праворуч. Порівнянь: {comparisons}, зсувів: {shifts}.",
  "play.nIsStop":
    "i={i}, j={j}: {key} ≥ {compared} — місце знайдено, цикл while зупиняється. Порівнянь: {comparisons}, зсувів: {shifts}.",
  "play.nIsProbeLeft":
    "i={i}: двійковий пошук — перевіряємо a[{mid}]={compared}; {key} < {compared} → шукаємо ліворуч. Порівнянь: {comparisons}.",
  "play.nIsProbeRight":
    "i={i}: двійковий пошук — перевіряємо a[{mid}]={compared}; {key} ≥ {compared} → шукаємо праворуч. Порівнянь: {comparisons}.",
  "play.nIsBShift":
    "i={i}: зсуваємо {value} з індексу {from} на {to}, звільняючи місце. Зсувів: {shifts}.",
  "play.nIsInsert":
    "i={i}: ставимо key = {key} на звільнену позицію {at}. Відсортований префікс виріс до {prefix}.",
  "play.nIsDone":
    "Готово: масив відсортовано {arr}. Усього {comparisons} порівнянь і {shifts} зсувів за {insertions} вставок.",
  // Навчальні віджети.
  "learn.isLegendPrefix": "відсортований префікс",
  "learn.isLegendCompare": "порівняння",
  "learn.isLegendShift": "щойно зсунули",
  "learn.isLegendUnsorted": "несортований суфікс",
  "learn.isLegendKey": "key «в руці»",
  "learn.isCounters": "порівнянь: {comparisons}, зсувів: {shifts}",
  "learn.isResultSummary":
    "{comparisons} порівнянь · {shifts} зсувів · {insertions} вставок",
  "learn.isStart": "старт",
  "learn.isPass": "ітерація {i}",
  "learn.isStableNote":
    "Стабільно: серед рівних ключів порядок підписів не змінився.",
  "learn.isGrowthNote": "n²/2 росте катастрофічно швидше за n·log₂n.",
}

export type MessageKey = keyof typeof ua

const en: Record<MessageKey, string> = {
  "app.title": "Algorithms: interactive walkthroughs",
  "app.subtitle": "A platform for learning algorithms",

  "common.loading": "Loading…",
  "common.ready": "Ready",
  "common.soon": "Coming soon",
  "common.soonShort": "soon",
  "common.cancel": "Cancel",
  "common.save": "Save",

  "home.heading": "Choose an algorithm",
  "home.intro":
    "Interactive walkthroughs: theory, a graph editor, step-by-step playback and a benchmark. New algorithms are added gradually.",

  "switcher.aria": "Choose algorithm",
  "switcher.placeholder": "Choose an algorithm",
  "switcher.label": "Algorithms",

  "comingSoon.badge": "In progress — coming soon",
  "comingSoon.plannedTitle": "What this section will include:",

  "learn.heading": "Learning walkthrough",
  "toc.title": "Contents",
  // DP cell close-up (learn widget).
  "learn.knapCellTake": "take",
  "learn.knapCellSkip": "skip",
  "learn.knapCellBase": "base",
  "learn.knapCellNofit": "doesn't fit",
  "learn.knapTreeLegend":
    "Left branch — take the item (+value), right — skip it; the number in a node is the subproblem's best value; ★ — the optimal path.",
  "learn.knapTreeTooBig": "The tree is too large to display ({n} items).",

  "tab.learn": "Learn",
  "tab.editor": "Editor",
  "tab.playback": "Algorithm",
  "tab.benchmark": "Benchmark",

  // — Editor (Phase 3) —
  "editor.example": "Example",
  "editor.random": "Random",
  "editor.vertex": "Vertex",
  "editor.clear": "Clear",
  "editor.import": "Import",
  "editor.export": "Export",
  "editor.share": "Share",
  "editor.emptyGraph": "The graph is empty — add vertices.",
  "editor.countVertices": "Vertices",
  "editor.countEdges": "Edges",
  "editor.importFailed": "Import failed",
  "editor.linkCopied": "Link copied to clipboard.",
  "editor.errNotObject": "The document must be an object",
  "editor.errBadVersion": "Unsupported document version",
  "editor.errBadVertices": "The vertices field is invalid",
  "editor.errBadEdges": "The edges field is invalid",
  "editor.errBadPositions": "The positions field is invalid",
  "editor.errBadPosition": "A position must be [x, y]",
  "editor.errBadCities": "The cities field is invalid",
  "editor.errBadStart": "The start field is invalid",
  "editor.weightTitle": "Edge weight",
  "editor.weightDescPositive": "A positive integer.",
  "editor.weightErrPositive": "The weight must be a positive integer.",
  "editor.weightDescAnyInt": "An integer — positive, zero or negative.",
  "editor.weightErrAnyInt":
    "The weight must be an integer (0 or negative allowed).",
  "editor.connTitle": "Connectivity",
  "editor.connComponents": "Components",
  "editor.connConnected":
    "The graph is connected — a spanning tree (MST) exists.",
  "editor.connDisconnected":
    "The graph is disconnected ({n} components) — it will be a spanning forest.",
  "editor.fwExample": "Example A–F",
  "editor.fwNegEdge": "Negative edge",
  "editor.fwNegCycle": "Negative cycle",
  "editor.fwEdgeExists": "Edge {from}→{to} already exists.",
  "editor.fwMatrixTitle": "Adjacency matrix",
  "editor.fwEdgesDirected": "Edges (directed)",
  "editor.fwNegCycleWarn":
    "A negative cycle was detected (a negative value appears on the diagonal of shortest distances) — shortest paths are undefined.",
  "editor.hkExample": "Example A–E",
  "editor.hkCity": "City",
  "editor.hkCoords": "Coordinates",
  "editor.hkStartCity": "Start city",
  "editor.hkMakeStartHint": "Double-click to make it the start",
  "editor.hkCoordsTitle": "City coordinates",
  "editor.hkCoordsDescPre": "Integer math coordinates (like the example ",
  "editor.hkCoordsDescPost": "). The radio button marks the start city.",
  "editor.hkColNum": "#",
  "editor.hkColStart": "start",
  "editor.hkNoCities": "No cities yet — add the first one.",
  "editor.hkAddCity": "Add city",
  "editor.hkCoordsDup":
    "Two points coincide at ({x}, {y}) — coordinates must be distinct.",
  "editor.hkAriaCityX": "City {name} X",
  "editor.hkAriaCityY": "City {name} Y",
  "editor.hkMakeStartOf": "Make {name} the start",
  "editor.hkStartOf": "Start — {name}",
  "editor.hkDeleteOf": "Delete {name}",
  "editor.hkDistTitle": "Distance matrix",
  "editor.hkDistEmpty": "Empty — double-click the canvas to add a city.",
  "editor.hkNeedTwo": "At least 2 cities are needed for a route.",
  "editor.hkCities": "Cities",
  "editor.hkStart": "Start",
  "editor.hkDpSub": "DP subproblems (n²·2ⁿ)",
  "editor.hkBruteTours": "Brute-force tours ((n−1)!)",
  "editor.hkWarnMany":
    "Many cities: Held–Karp time and memory (O(n·2ⁿ)) grow noticeably.",
  "editor.hkWarnTooMany":
    "Too many cities — Held–Karp isn't practical in the browser: memory O(n·2ⁿ) blows up. Reduce the number of cities.",
  // Knapsack.
  "editor.errBadItems": "The items field is invalid",
  "editor.errBadCapacity": "The capacity field is invalid",
  "editor.knapClassic": "Classic (W=50)",
  "editor.knapSmall": "Small (W=4)",
  "editor.knapItem": "Item",
  "editor.knapCapacity": "Knapsack capacity",
  "editor.knapColName": "Item",
  "editor.knapColWeight": "Weight",
  "editor.knapColValue": "Value",
  "editor.knapColRatio": "Value/weight",
  "editor.knapNoItems": "No items yet — add the first one.",
  "editor.knapItems": "Items",
  "editor.knapTotalWeight": "Total weight",
  "editor.knapBruteSubsets": "Subsets (2ⁿ)",
  "editor.knapDpCells": "DP cells ((n+1)·(W+1))",
  "editor.knapWarnMany":
    "Large capacity: the DP table ((n+1)·(W+1)) and the number of player frames grow noticeably.",
  "editor.knapDeleteOf": "Delete {name}",
  "editor.knapAriaName": "Item name {name}",
  "editor.knapAriaWeight": "{name} weight",
  "editor.knapAriaValue": "{name} value",
  "editor.knapHelpCell": "Table cell",
  "editor.helpKnapAddItem": "add an item",
  "editor.helpKnapEditCell": "edit the name, weight or value",
  "editor.helpKnapCapacity": "change the knapsack capacity W",
  "editor.helpKnapRemove": "remove the item",
  "editor.helpKnapNote":
    "The value-to-weight ratio is computed automatically — the greedy method sorts by it.",
  "editor.helpDblCanvas": "Double-click the canvas",
  "editor.helpDragNodes": "Drag between nodes",
  "editor.helpDblEdge": "Double-click an edge",
  "editor.helpDragCity": "Drag a city",
  "editor.helpDblCity": "Double-click a city",
  "editor.helpCoordsBtn": "“Coordinates” button",
  "editor.helpAddVertex": "add a vertex",
  "editor.helpAddEdge": "an edge (with a weight prompt)",
  "editor.helpAddDirectedEdge": "a directed edge (weight may be negative)",
  "editor.helpChangeWeight": "change its weight",
  "editor.helpRemoveSelection": "remove the selection",
  "editor.helpAddCity": "add a city",
  "editor.helpChangeCoords": "change coordinates (snapped to the grid)",
  "editor.helpMakeStart": "make it the start",
  "editor.helpEnterCoords": "enter exact x/y manually",
  "editor.helpHkNote":
    "Matrix distances are Euclidean and recomputed automatically.",
  "editor.numK": "k",
  "editor.numM": "M",
  "editor.numB": "B",

  // — Player (Phase 4, chrome; step narration still UA) —
  "play.toStart": "To start",
  "play.stepBack": "Step back",
  "play.play": "Play",
  "play.pause": "Pause",
  "play.stepForward": "Step forward",
  "play.timeline": "Timeline",
  "play.step": "Step",
  "play.code": "Code",
  "play.emptyGraph": "The graph is empty — create one in the “Editor” tab.",
  "play.edgesCount": "{n} edges",
  "play.edgeSingular": "edge",
  "play.edgesPlural": "edges",
  "play.modeNaive": "Naive (BFS)",
  "play.modeCompare": "Comparison",
  "play.algoVersion": "Algorithm version:",
  "play.dsuOpts": "DSU optimizations:",
  "play.unionByRank": "union by rank",
  "play.pathCompression": "path compression",
  "play.noOptWarn":
    "without optimizations the tree degenerates into a chain — find becomes O(n)",
  "play.totalFindSteps": "total find steps:",
  "play.codeDsu": "Code — Kruskal with DSU",
  "play.graphDsu": "Graph — DSU sets (component colors)",
  "play.codeNaive": "Code — naive Kruskal (BFS)",
  "play.graphNaive": "Graph — auxiliary forest + BFS",
  "play.findSteps": "find steps:",
  "play.unions": "unions:",
  "play.compressions": "path compressions:",
  "play.summary": "Summary",
  "play.naiveLower": "naive",
  "play.mstWeight": "MST weight:",
  "play.spanningTree": "spanning tree",
  "play.spanningForest": "spanning forest (disconnected graph)",
  "play.cmpStart": "Start: both versions begin from an empty MST.",
  "play.edgeStep": "Edge step",
  "play.cmpNaive": "Naive",
  "play.cmpGraphDsu": "DSU — sets (component colors)",
  "play.cmpGraphNaive": "Naive — forest (BFS)",
  "play.cmpNote":
    "Both implementations accept the same edges and yield the same MST — only the internal mechanics differ: DSU sets vs BFS in an auxiliary forest.",
  "play.decisionTable": "Decision table",
  "play.colEdge": "Edge",
  "play.colWeight": "Weight",
  "play.colDecision": "Decision",
  "play.stInMst": "in MST",
  "play.stCycle": "cycle",
  "play.stConsider": "considering",
  "play.naiveTitle": "BFS in the auxiliary forest",
  "play.curVertex": "Current vertex",
  "play.queue": "Queue (frontier)",
  "play.visited": "Visited",
  "play.naiveHint":
    "An edge is added only when BFS did NOT find a path between its endpoints (otherwise — a cycle).",
  "play.dsuForest": "DSU forest",
  "play.dsuForestOnly": "Available only for the DSU version.",
  "play.dsuForestTitle": "DSU forest (ranks, pointers)",
  "play.rank": "rank",
  "play.graphCompon": "Graph (component colors)",
  "play.negCycle": "negative cycle",
  "play.intermediateK": "intermediate k:",
  "play.relaxTotal": "relaxations total:",
  "play.improvedThisK": "improved on this k:",
  "play.codeFw": "Code (Floyd–Warshall)",
  "play.fwNegCycleCap": "Negative cycle",
  "play.fwAllPairs": "Shortest distances between all pairs found",
  "play.fwResultStats": "{n} vertices · {m} relaxations",
  "play.relaxLog": "Relaxation log ({n})",
  "play.relaxEmpty": "No improvements yet — start playback.",
  "play.colViaK": "via k",
  "play.colPath": "path",
  "play.colBeforeAfter": "before → after",
  "play.pathReconstruct": "Path reconstruction",
  "play.fwNegCycleUndefined":
    "The graph has a negative cycle — shortest paths are undefined.",
  "play.from": "from",
  "play.to": "to",
  "play.noPath": "No path {u} → {v} (∞).",
  "play.pathLength": "Path length:",
  "play.matrixD": "Distance matrix D",
  "play.fwNoChange": "(no change)",
  "play.legSummands": "summands",
  "play.legImproved": "improved",
  "play.legRowColK": "row/column k",
  "play.graphDirected": "Graph (directed)",
  "play.legIFrom": "i — from",
  "play.legKInter": "k — intermediate",
  "play.legJTo": "j — to",
  "play.hkTooFew":
    "Too few cities for a route — add at least two in the “Editor” tab.",
  "play.hkTooMany":
    "The step player supports up to {max} cities (otherwise too many frames). Now — {n}. Reduce the count in the editor.",
  "play.codeHk": "Code (Held–Karp)",
  "play.hkLevel": "level |S|:",
  "play.hkSubset": "subset S:",
  "play.hkDpCells": "dp cells:",
  "play.hkShortestTour": "shortest tour:",
  "play.hkOptimalTour": "Optimal tour",
  "play.hkResultStats": "{n} cities · {m} subproblems · ≈{ops} operations",
  "play.hkPhaseBase": "base",
  "play.hkPhaseBuild": "build · |S|={lvl}",
  "play.hkPhaseClosing": "closing",
  "play.hkPhaseDone": "done",
  "play.hkMapTitle": "City map and route",
  "play.legStart": "start",
  "play.legEndJ": "end j",
  "play.legRoute": "route",
  "play.cycle": "cycle",
  "play.path": "path",
  "play.hkMatrixTitle": "Distance matrix",
  "play.legActiveEdge": "active edge",
  "play.candTitle": "Choice in min()",
  "play.candEmpty":
    "The min() breakdown will appear here once we start computing a dp cell.",
  "play.candClosingFormula": "tour = min( dp[all, j] + dist[j→{start}] )",
  "play.candBlock": "block {path} → {end}",
  "play.candEnd": "end {j} → {start}",
  "play.dpTitle": "dp[(S, j)] table",
  "play.dpProgress": "done {n}/{total} cells",
  "play.dpEmpty": "Empty yet — we start from base edges out of the start.",
  "play.dpBase": "Base · |S|=2",
  "play.dpLevel": "Level · |S|={lvl}",

  // — Step narration (Phase 4, part 2) —
  "play.nConsider": "Considering edge {edge} (weight {w}).",
  "play.nDone": "Collected {need} edges — the spanning tree is complete.",
  "play.nDsuInit":
    "Initialization: each vertex is its own set (DSU), the MST is empty.",
  "play.nDsuFind": "find({v}): climb {path}; root {root}.",
  "play.nDsuCompress": "Path compression: {nodes} → {root}.",
  "play.nDsuCycle":
    "{u} and {v} are in the same set (root {root}) — a cycle, skip.",
  "play.nDsuUnion":
    "Different sets — union {rootX} and {rootY} → root {root}{rankNote}.",
  "play.nDsuRankUp": "; rank {root}↑",
  "play.nDsuAccept": "Add {edge} to the MST (weight {w}).",
  "play.nHpInit":
    "Initialization: the auxiliary forest is empty, the MST is empty.",
  "play.nBfsReached": "BFS reached {v} — a path exists in the forest.",
  "play.nBfsVisit": "BFS visits {v}; frontier [{frontier}].",
  "play.nBfsExhausted": "BFS exhausted the queue — no path.",
  "play.nHpCycle":
    "{u} and {v} are already connected in the forest — a cycle, skip.",
  "play.nHpAccept": "No path — add {edge} to the MST (weight {w}).",
  "play.nFwInit":
    "Initial matrix D: 0 on the diagonal, weights of direct edges, the rest — ∞.",
  "play.nFwOpenK":
    "Open intermediate vertex k = {k}. Routes may transit through it.",
  "play.nFwCmpInf": "({a}→{b}) via {k}: path unreachable (∞) — no change.",
  "play.nFwCmpRelax":
    "({a}→{b}) via {k}: {viaK} < {current} — there's a shorter route, update D[{a}][{b}].",
  "play.nFwCmpNoChange": "({a}→{b}) via {k}: {viaK} ≥ {current} — no change.",
  "play.nFwApply":
    "Write D[{a}][{b}] = {viaK} and remember the route's first step (nxt).",
  "play.nFwKDoneNone": "Vertex {k} processed: no change.",
  "play.nFwKDoneSome": "Vertex {k} processed: improvements — {n}.",
  "play.nFwDoneNeg":
    "Done, but a negative cycle was detected (D[i][i] < 0) — true shortest distances are undefined.",
  "play.nFwDone":
    "Done: found the shortest distances between all pairs of vertices.",
  "play.nHkInit":
    "Building the dp[(S, j)] table — the shortest path from the start through subset S ending at j. Start — {start}.",
  "play.nHkBase":
    "Base: direct edge {from}→{to} = {cost}. The smallest building block.",
  "play.nHkLevelOpen":
    "Level {r}: subsets of {r} cities ({cells} subproblems). We build on completed blocks of level {prev}.",
  "play.nHkCellOpen": "Computing the shortest path through {subset} ending at {end}.",
  "play.nHkCand":
    "Second-to-last {k}: block ({path}) = {blockCost} + edge {k}→{end} {edge} = {total}{verdict}",
  "play.nHkCandBetter": " — new best.",
  "play.nHkCandWorse": " — worse, discard.",
  "play.nHkCommit": "Chosen: {path} = {cost} (via {bestK}).",
  "play.nHkClosingOpen":
    "Closing the route: to each path through all cities we add the edge back to the start.",
  "play.nHkClosingCand":
    "Tour via end {j}: {blockCost} + edge {j}→{start} {edge} = {total}{verdict}",
  "play.nHkTourBetter": " — new shortest tour.",
  "play.nHkTourWorse": " — longer than the current.",
  "play.nHkDone": "Done: the optimal tour {path} = {cost}.",

  // — Knapsack (player + narration) —
  "play.knapMethod": "Method:",
  "play.knapModeDp": "Dynamic programming",
  "play.knapModeGreedy": "Greedy",
  "play.knapModeBrute": "Brute force",
  "play.knapEmpty": "No items — add them in the “Editor” tab.",
  "play.knapDpTooBig":
    "The DP table is too large for the step player (over {max} cells). Reduce the capacity or item count in the editor.",
  "play.knapBruteTooBig":
    "Too many subsets (2ⁿ) for step-by-step brute force. Reduce the item count in the editor.",
  "play.codeKnapDp": "Code — DP (table K[i][w])",
  "play.codeKnapGreedy": "Code — greedy method",
  "play.codeKnapBrute": "Code — brute force",
  "play.knapStatFilled": "cells:",
  "play.knapStatItems": "items:",
  "play.knapStatCapacity": "capacity:",
  "play.knapStatChecked": "checked:",
  "play.knapStatBest": "best:",
  "play.knapPhaseFill": "filling",
  "play.knapPhaseBacktrack": "backtrack",
  "play.knapPhaseDone": "done",
  "play.knapOptimum": "Optimal value",
  "play.knapChosenSet": "Chosen set",
  "play.knapSetWeight": "total weight {w} ≤ {cap}",
  "play.knapGreedyValue": "Greedy result",
  "play.knapVsOptimal": "Optimum (DP): {optimal}",
  "play.knapGreedyLoses":
    "Greedy fell short of the optimum by {gap} — for the 0/1 problem it doesn't guarantee the best set.",
  "play.knapGreedyMatches": "Here greedy matched the optimum (it doesn't always).",
  "play.knapBest": "Best subset",
  "play.knapChecked": "checked {n} = 2ⁿ subsets",
  "play.knapDpTitle": "Table K[i][w]",
  "play.knapDpProgress": "filled {n}/{total} cells",
  "play.knapItemsTitle": "Items (W = {w})",
  "play.knapGreedyTitle": "Greedy: by value/weight",
  "play.knapFilled": "{used}/{cap} used",
  "play.knapValue": "value {v}",
  "play.knapColStatus": "status",
  "play.knapTaken": "taken",
  "play.knapSkipped": "skipped",
  "play.knapPending": "ahead",
  "play.knapSubsetsTitle": "Subsets (brute force)",
  "play.knapSubsetsProgress": "checked {n}/{total}",
  "play.knapColSubset": "Subset",
  "play.knapColFits": "fits",
  // Knapsack narration — DP.
  "play.nKnInit":
    "Building the table K[i][w]: the maximum value for the first i items and capacity w. The knapsack holds {w}, items {n}.",
  "play.nKnRowBase": "Base row i=0: with no items the value is 0 everywhere.",
  "play.nKnRowOpen":
    "Row i={i}: item {name} is now allowed (weight {wt}, value {val}).",
  "play.nKnBase": "K[{i}][{w}] — base (no items or zero capacity) → 0.",
  "play.nKnTake":
    "K[{i}][{w}]: {name} fits. Take: {val}+K[{prev}][{rem}] = {take}; skip: {skip}. {take} > {skip} → take it, K={value}.",
  "play.nKnSkip":
    "K[{i}][{w}]: {name} fits, but take {take} ≤ skip {skip} → don't take it, K={value}.",
  "play.nKnNofit":
    "K[{i}][{w}]: {name} (weight {wt}) doesn't fit in {w} → take the value above, K={value}.",
  "play.nKnFillDone":
    "Table filled. The answer is in the bottom-right corner: K[{n}][{w}] = {best}.",
  "play.nKnBtOpen": "Reconstructing the set by backtracking from K[{n}][{w}] = {best}.",
  "play.nKnBtTake":
    "K[{i}][{w}]={value} ≠ K[{prev}][{w}]={above} → item {name} was taken. Free its weight {wt}: w→{colAfter}.",
  "play.nKnBtSkip":
    "K[{i}][{w}]={value} = K[{prev}][{w}]={above} → item {name} wasn't taken; w unchanged.",
  "play.nKnDone": "Done. Optimum {best}; set {{set}} (total weight {weight}).",
  // Knapsack narration — greedy.
  "play.nKnGreedyInit":
    "Sort items by value/weight (descending) and take while they fit. The knapsack holds {w}.",
  "play.nKnGreedyTake":
    "{name} (value/weight {ratio}): weight {wt} ≤ free {free} → take it. Value +{val} = {total}.",
  "play.nKnGreedySkip":
    "{name} (value/weight {ratio}): weight {wt} > free {free} → skip it.",
  "play.nKnGreedyDone": "Greedy total: {total}. Optimum {optimal}{gapNote}.",
  "play.nKnGreedyGap": " — short by {gap}",
  // Knapsack narration — brute force.
  "play.nKnBruteInit":
    "Enumerating all {count} subsets of items; the leader is the most valuable that fits.",
  "play.nKnBruteSubset": "{set}: weight {w}, value {v} — {verdict}",
  "play.nKnBruteNofit": "doesn't fit.",
  "play.nKnBruteLeader": "new leader {v}.",
  "play.nKnBruteWorse": "not better than the leader.",
  "play.nKnBruteDone": "Checked {count} subsets. Best: {set} = {best}.",

  // — Prim player —
  "play.primCode": "Code — Prim (lazy queue)",
  "play.primGraph": "Graph — the growing tree",
  "play.primQueue": "Priority queue",
  "play.primQueueEmpty": "The queue is empty.",
  "play.primPopped": "Popped:",
  "play.primAccepted": "accepted",
  "play.primStaleTag": "stale",
  "play.primChecking": "checking…",
  "play.primMstEdges": "MST edges (in order of addition)",
  "play.primNoEdgesYet": "No edges yet — start the playback.",
  "play.primEdgesShort": "edges",
  "play.primTreeSize": "tree:",
  "play.primQueueSize": "in queue:",
  "play.primPoppedCount": "popped:",
  "play.primStaleCount": "stale edges:",
  // Prim narration.
  "play.nPrimEmpty": "The graph is empty — create one on the “Editor” tab.",
  "play.nPrimInit":
    "Start from vertex {start}. The tree grows from it; we push all its edges onto the queue: {pushed}.",
  "play.nPrimPop":
    "Pop the cheapest edge {edge} off the queue. Check: is {to} already in the tree?",
  "play.nPrimAccept":
    "{to} is still outside → accept {edge} (weight {w}). Tree has {count}/{need} edges, weight {total}. New candidates onto the queue: {pushed}.",
  "play.nPrimAcceptNoPush":
    "{to} is still outside → accept {edge} (weight {w}). Tree has {count}/{need} edges, weight {total}. No new edges — all neighbours of {to} are already in the tree.",
  "play.nPrimSkip":
    "{to} is already in the tree → edge {edge} is stale. Lazy deletion: skip it silently.",
  "play.nPrimDone":
    "Done: the tree spans all {n} vertices, {need} edges, MST weight {total}.",
  "play.nPrimDoneDisc":
    "The queue is empty but only {reached} of {n} vertices are in the tree — the graph is disconnected. Prim covered only the start component (weight {total}).",

  // — Benchmark (Phase 5) —
  "bench.title": "Benchmark: DSU vs naive (has-path)",
  "bench.introPre":
    "Both implementations yield the same MST, but the time grows differently: DSU — almost linearly in graph size, the naive one (BFS in an auxiliary forest) — much faster. Computations run in a ",
  "bench.introPost": ", so the UI isn't blocked.",
  "bench.run": "Run benchmark",
  "bench.restart": "Restart",
  "bench.running": "Computing…",
  "bench.empty": "Press “Run benchmark”",
  "bench.axisVertices": "vertices",
  "bench.axisMs": "ms",
  "bench.lineNaive": "naive (has-path)",
  "bench.colVertices": "Vertices",
  "bench.colEdges": "Edges",
  "bench.colDsuMs": "DSU, ms",
  "bench.colHasPathMs": "has-path, ms",
  "bench.colSpeedup": "Speedup",

  // — Bubble Sort —
  // Editor.
  "editor.bsIntro": "Example [5,1,4,2,8,3]",
  "editor.bsBest": "Sorted (best case)",
  "editor.bsWorst": "Reversed (worst case)",
  "editor.bsValue": "Value",
  "editor.bsArrayTitle": "Array of numbers",
  "editor.bsNoValues": "The array is empty — add the first number.",
  "editor.bsSize": "Elements",
  "editor.bsMaxComparisons": "Comparisons (n(n−1)/2)",
  "editor.bsMaxPasses": "Passes (n−1)",
  "editor.bsSortedYes": "The array is already sorted",
  "editor.bsSortedNo": "The array is not sorted",
  "editor.bsWarnMany":
    "The array is too large — playback may stutter. Reduce the number of elements.",
  "editor.bsAriaValue": "Value at index {i}",
  "editor.bsDeleteAt": "Delete element {i}",
  "editor.bsHelpCell": "Array cell",
  "editor.helpBsAdd": "append a number to the array",
  "editor.helpBsEdit": "edit a value (integer ≥ 0)",
  "editor.helpBsRemove": "remove a number from the array",
  "editor.helpBsNote":
    "Any integers can be sorted. Try the sorted and reversed arrays to see the best and worst cases.",
  "editor.bsErrBadValues": "The `values` field must be an array of numbers",
  // Player.
  "play.bsMethod": "Version:",
  "play.bsModeNaive": "Naive",
  "play.bsModeOptimized": "Optimized (swapped)",
  "play.bsEmpty": "The array is empty — add numbers in the “Editor” tab.",
  "play.bsTooBig":
    "The array is too large for smooth playback (over {max} elements). Reduce it in the “Editor” tab.",
  "play.bsStatComparisons": "comparisons:",
  "play.bsStatSwaps": "swaps:",
  "play.bsStatPass": "pass:",
  "play.bsStatSize": "elements:",
  "play.bsPhaseScan": "comparing",
  "play.bsPhasePass": "pass complete",
  "play.bsPhaseDone": "done",
  "play.bsArrayTitle": "Array (n = {n})",
  "play.codeBsNaive": "Code — naive bubble sort",
  "play.codeBsOptimized": "Code — optimized (swapped)",
  "play.bsInputLabel": "Input",
  "play.bsSortedLabel": "Sorted",
  "play.bsResultSummary": "Summary",
  "play.bsResultCounts": "{comparisons} comparisons · {swaps} swaps · {passes} passes",
  "play.bsSaved":
    "Early exit saved {saved} comparisons (the naive version would do {max}).",
  "play.nBsInit":
    "Start: array {arr}, n = {n}. The outer loop runs at most {passes} passes.",
  "play.nBsCompareSwap":
    "Pass i={i}, j={j}: {left} > {right} — the pair is out of order, swap them. Comparisons: {comparisons}, swaps: {swaps}.",
  "play.nBsCompareKeep":
    "Pass i={i}, j={j}: {left} ≤ {right} — order is correct, leave it. Comparisons: {comparisons}, swaps: {swaps}.",
  "play.nBsPassEnd":
    "End of pass i={i}: value {value} “bubbled up” to index {locked} — it's now in place, the green tail grew. The next pass is one shorter.",
  "play.nBsEarlyStop":
    "No swaps happened during the whole pass i={i} → the array is already sorted. Early exit.",
  "play.nBsDone":
    "Done: the array is sorted {arr}. In total {comparisons} comparisons and {swaps} swaps over {passes} pass(es).",
  // Learn widgets.
  "learn.bsLegendComparing": "comparing",
  "learn.bsLegendSwapped": "just swapped",
  "learn.bsLegendSorted": "in place",
  "learn.bsLegendUnsorted": "unsorted",
  "learn.bsVerdictSwap": "{left} > {right} — swap",
  "learn.bsVerdictKeep": "{left} ≤ {right} — keep",
  "learn.bsCounters": "comparisons: {comparisons}, swaps: {swaps}",
  "learn.bsResultSummary": "{comparisons} comparisons · {swaps} swaps · {passes} passes",
  "learn.bsStart": "start",
  "learn.bsPass": "pass {i}",
  "learn.bsStableNote":
    "Stable: among equal keys the order of labels did not change.",
  "learn.bsGrowthNote": "n²/2 grows catastrophically faster than n·log₂n.",

  // — Insertion Sort —
  // Editor.
  "editor.isIntro": "Example [5,2,4,6,1,3]",
  "editor.isBest": "Sorted (best case)",
  "editor.isWorst": "Reversed (worst case)",
  "editor.isValue": "Value",
  "editor.isArrayTitle": "Array of numbers",
  "editor.isNoValues": "The array is empty — add the first number.",
  "editor.isSize": "Elements",
  "editor.isMaxComparisons": "Comparisons, worst case (n(n−1)/2)",
  "editor.isInsertions": "Insertions (n−1)",
  "editor.isSortedYes": "The array is already sorted",
  "editor.isSortedNo": "The array is not sorted",
  "editor.isWarnMany":
    "The array is too large — playback may stutter. Reduce the number of elements.",
  "editor.isAriaValue": "Value at index {i}",
  "editor.isDeleteAt": "Delete element {i}",
  "editor.isHelpCell": "Array cell",
  "editor.helpIsAdd": "append a number to the array",
  "editor.helpIsEdit": "edit a value (integer ≥ 0)",
  "editor.helpIsRemove": "remove a number from the array",
  "editor.helpIsNote":
    "Any integers can be sorted. Try the sorted and reversed arrays to see the best and worst cases.",
  "editor.isErrBadValues": "The `values` field must be an array of numbers",
  // Player.
  "play.isMethod": "Version:",
  "play.isModeLinear": "Linear",
  "play.isModeBinary": "Binary (binary search)",
  "play.isEmpty": "The array is empty — add numbers in the “Editor” tab.",
  "play.isTooBig":
    "The array is too large for smooth playback (over {max} elements). Reduce it in the “Editor” tab.",
  "play.isStatComparisons": "comparisons:",
  "play.isStatShifts": "shifts:",
  "play.isStatPass": "iteration:",
  "play.isStatSize": "elements:",
  "play.isPhaseKey": "key in hand",
  "play.isPhaseScan": "finding the spot",
  "play.isPhaseInsert": "insert",
  "play.isPhaseDone": "done",
  "play.isArrayTitle": "Array (n = {n})",
  "play.codeIsLinear": "Code — linear insertion",
  "play.codeIsBinary": "Code — binary insertion",
  "play.isInputLabel": "Input",
  "play.isSortedLabel": "Sorted",
  "play.isResultSummary": "Summary",
  "play.isResultCounts": "{comparisons} comparisons · {shifts} shifts · {insertions} insertions",
  "play.isSaved":
    "Binary search: only {comparisons} comparisons (the worst-case linear would do up to {max}).",
  "play.nIsInit":
    "Start: array {arr}, n = {n}. The leftmost element is a trivial sorted prefix.",
  "play.nIsTake":
    "Iteration i={i}: take key = {key} “in hand”. Position {pos} becomes a “hole”; the prefix [0, {prefix}) is already sorted.",
  "play.nIsShift":
    "i={i}, j={j}: {key} < {compared} — {compared} is bigger, shift it right. Comparisons: {comparisons}, shifts: {shifts}.",
  "play.nIsStop":
    "i={i}, j={j}: {key} ≥ {compared} — the spot is found, the while loop stops. Comparisons: {comparisons}, shifts: {shifts}.",
  "play.nIsProbeLeft":
    "i={i}: binary search — probe a[{mid}]={compared}; {key} < {compared} → search left. Comparisons: {comparisons}.",
  "play.nIsProbeRight":
    "i={i}: binary search — probe a[{mid}]={compared}; {key} ≥ {compared} → search right. Comparisons: {comparisons}.",
  "play.nIsBShift":
    "i={i}: shift {value} from index {from} to {to}, making room. Shifts: {shifts}.",
  "play.nIsInsert":
    "i={i}: place key = {key} into the freed position {at}. The sorted prefix grew to {prefix}.",
  "play.nIsDone":
    "Done: the array is sorted {arr}. In total {comparisons} comparisons and {shifts} shifts over {insertions} insertions.",
  // Learn widgets.
  "learn.isLegendPrefix": "sorted prefix",
  "learn.isLegendCompare": "comparing",
  "learn.isLegendShift": "just shifted",
  "learn.isLegendUnsorted": "unsorted suffix",
  "learn.isLegendKey": "key “in hand”",
  "learn.isCounters": "comparisons: {comparisons}, shifts: {shifts}",
  "learn.isResultSummary": "{comparisons} comparisons · {shifts} shifts · {insertions} insertions",
  "learn.isStart": "start",
  "learn.isPass": "iteration {i}",
  "learn.isStableNote":
    "Stable: among equal keys the order of labels did not change.",
  "learn.isGrowthNote": "n²/2 grows catastrophically faster than n·log₂n.",
}

export const messages: Record<Lang, Record<MessageKey, string>> = { ua, en }
