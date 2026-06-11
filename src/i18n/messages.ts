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
  "editor.kruskalHelp":
    "Подвійний клік по полю — додати вершину; перетягни від вузла до вузла — ребро (із запитом ваги); подвійний клік по ребру — змінити вагу; Delete — видалити виділене.",
  // Флойд–Воршал.
  "editor.fwExample": "Приклад A–F",
  "editor.fwNegEdge": "Від'ємне ребро",
  "editor.fwNegCycle": "Від'ємний цикл",
  "editor.fwEdgeExists": "Ребро {from}→{to} вже існує.",
  "editor.fwMatrixTitle": "Матриця суміжності",
  "editor.fwEdgesDirected": "Ребра (напрямлені)",
  "editor.fwNegCycleWarn":
    "Виявлено від'ємний цикл (на діагоналі найкоротших відстаней з'являється від'ємне значення) — найкоротші шляхи не визначені.",
  "editor.fwHelp":
    "Подвійний клік по полю — додати вершину; перетягни від вузла до вузла — напрямлене ребро (із запитом ваги, можна від'ємну); подвійний клік по ребру — змінити вагу; Delete — видалити виділене.",
  // Хелда–Карпа.
  "editor.hkExample": "Приклад A–E",
  "editor.hkCity": "Місто",
  "editor.hkCoords": "Координати",
  "editor.hkHelp":
    "Подвійний клік по полю — додати місто; перетягни місто — змінити координати (зі снапом до сітки); подвійний клік по місту — зробити його стартом; Delete — видалити виділене. Кнопка «Координати» — ввести точні x/y кожного міста вручну. Відстані в матриці — евклідові, перераховуються автоматично.",
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
  "editor.numK": " тис.",
  "editor.numM": " млн",
  "editor.numB": " млрд",
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
  "editor.kruskalHelp":
    "Double-click the canvas to add a vertex; drag from node to node to create an edge (with a weight prompt); double-click an edge to change its weight; Delete to remove the selection.",
  "editor.fwExample": "Example A–F",
  "editor.fwNegEdge": "Negative edge",
  "editor.fwNegCycle": "Negative cycle",
  "editor.fwEdgeExists": "Edge {from}→{to} already exists.",
  "editor.fwMatrixTitle": "Adjacency matrix",
  "editor.fwEdgesDirected": "Edges (directed)",
  "editor.fwNegCycleWarn":
    "A negative cycle was detected (a negative value appears on the diagonal of shortest distances) — shortest paths are undefined.",
  "editor.fwHelp":
    "Double-click the canvas to add a vertex; drag from node to node to create a directed edge (with a weight prompt, may be negative); double-click an edge to change its weight; Delete to remove the selection.",
  "editor.hkExample": "Example A–E",
  "editor.hkCity": "City",
  "editor.hkCoords": "Coordinates",
  "editor.hkHelp":
    "Double-click the canvas to add a city; drag a city to change its coordinates (snapped to the grid); double-click a city to make it the start; Delete to remove the selection. The “Coordinates” button lets you enter exact x/y for each city manually. Matrix distances are Euclidean and recomputed automatically.",
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
  "editor.numK": "k",
  "editor.numM": "M",
  "editor.numB": "B",
}

export const messages: Record<Lang, Record<MessageKey, string>> = { ua, en }
