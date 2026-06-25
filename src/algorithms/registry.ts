import type {
  Algorithm,
  AlgorithmFamily,
  ComplexityClass,
  Localized,
} from "@/algorithms/types"
import { kruskal } from "@/algorithms/kruskal"
import { prim } from "@/algorithms/prim"
import { floydWarshall } from "@/algorithms/floyd-warshall"
import { bfs } from "@/algorithms/bfs"
import { dfs } from "@/algorithms/dfs"
import { dijkstra } from "@/algorithms/dijkstra"
import { heldKarp } from "@/algorithms/held-karp"
import { knapsack } from "@/algorithms/knapsack"
import { bubbleSort } from "@/algorithms/bubble-sort"
import { insertionSort } from "@/algorithms/insertion-sort"
import { selectionSort } from "@/algorithms/selection-sort"
import { quickSort } from "@/algorithms/quick-sort"
import { mergeSort } from "@/algorithms/merge-sort"
import { heapSort } from "@/algorithms/heap-sort"
import { shellSort } from "@/algorithms/shell-sort"
import { radixSort } from "@/algorithms/radix-sort"
import { linearSearch } from "@/algorithms/linear-search"
import { binarySearch } from "@/algorithms/binary-search"
import { indexedSequentialSearch } from "@/algorithms/indexed-sequential-search"
import { interpolationSearch } from "@/algorithms/interpolation-search"
import { naiveStringSearch } from "@/algorithms/naive-string-search"
import { kmpStringSearch } from "@/algorithms/kmp-string-search"
import { boyerMooreStringSearch } from "@/algorithms/boyer-moore-string-search"
import { rabinKarpStringSearch } from "@/algorithms/rabin-karp-string-search"

/**
 * Єдиний реєстр алгоритмів платформи. Щоб додати новий:
 * 1) створити теку `src/algorithms/<id>/` з описом `Algorithm`;
 * 2) додати його в цей масив.
 * Каталог, перемикач у шапці й роутер автоматично його підхоплять.
 */
export const ALGORITHMS: readonly Algorithm[] = [
  kruskal,
  prim,
  floydWarshall,
  bfs,
  dfs,
  dijkstra,
  heldKarp,
  knapsack,
  bubbleSort,
  insertionSort,
  selectionSort,
  quickSort,
  mergeSort,
  heapSort,
  shellSort,
  radixSort,
  linearSearch,
  binarySearch,
  indexedSequentialSearch,
  interpolationSearch,
  naiveStringSearch,
  kmpStringSearch,
  boyerMooreStringSearch,
  rabinKarpStringSearch,
]

/** Опис родини для каталогу: підпис + один рядок «про що вона». */
export interface AlgorithmFamilyInfo {
  readonly id: AlgorithmFamily
  readonly label: Localized
  readonly blurb: Localized
}

/**
 * Родини в порядку показу на стартовій сторінці (верхній рівень групування).
 * Порядок алгоритмів УСЕРЕДИНІ родини бере `ALGORITHMS` (навчальна послідовність).
 */
export const FAMILIES: readonly AlgorithmFamilyInfo[] = [
  {
    id: "graphs",
    label: { ua: "Графи", en: "Graphs" },
    blurb: {
      ua: "Остовні дерева й найкоротші шляхи на зважених графах.",
      en: "Spanning trees and shortest paths on weighted graphs.",
    },
  },
  {
    id: "dp",
    label: { ua: "Динамічне програмування", en: "Dynamic programming" },
    blurb: {
      ua: "Оптимум через підзадачі: рюкзак і комівояжер.",
      en: "Optimum via subproblems: knapsack and the travelling salesman.",
    },
  },
  {
    id: "sorting",
    label: { ua: "Сортування", en: "Sorting" },
    blurb: {
      ua: "Упорядкування масиву: від O(n²) до O(n·log n) і непорівняльного.",
      en: "Ordering an array: from O(n²) to O(n·log n) and non-comparison.",
    },
  },
  {
    id: "search",
    label: { ua: "Пошук", en: "Search" },
    blurb: {
      ua: "Знайти елемент у масиві: від лінійного до інтерполяційного.",
      en: "Find an element in an array: from linear to interpolation.",
    },
  },
  {
    id: "string-search",
    label: { ua: "Пошук у рядку", en: "String search" },
    blurb: {
      ua: "Знайти шаблон у тексті: від наївного до Рабіна–Карпа.",
      en: "Find a pattern in text: from naive to Rabin–Karp.",
    },
  },
]

/** Група каталогу: опис родини + її алгоритми в порядку реєстру. */
export interface AlgorithmGroup {
  readonly family: AlgorithmFamilyInfo
  readonly items: readonly Algorithm[]
}

/**
 * Алгоритми, згруповані за родиною — у порядку `FAMILIES`, а всередині — у порядку
 * `ALGORITHMS`. Порожні родини пропускаються. Споживає каталог на стартовій сторінці.
 */
export function algorithmsByFamily(): readonly AlgorithmGroup[] {
  return FAMILIES.map((family) => ({
    family,
    items: ALGORITHMS.filter((a) => a.family === family.id),
  })).filter((g) => g.items.length > 0)
}

/** Опис класу складності для фільтра: назва словами + представницька формула. */
export interface ComplexityClassInfo {
  readonly id: ComplexityClass
  readonly label: Localized
  readonly formula: string
}

/**
 * Класи складності в порядку зростання — другий (фасетний) фільтр каталогу.
 * Кожен алгоритм оголошує свій `complexityClass` (за ТИПОВОЮ складністю).
 */
export const COMPLEXITY_CLASSES: readonly ComplexityClassInfo[] = [
  { id: "logarithmic", label: { ua: "Логарифмічна", en: "Logarithmic" }, formula: "O(log n)" },
  { id: "sublinear", label: { ua: "Сублінійна", en: "Sublinear" }, formula: "O(√n)" },
  { id: "linear", label: { ua: "Лінійна", en: "Linear" }, formula: "O(n)" },
  { id: "linearithmic", label: { ua: "Лінійно-логарифмічна", en: "Linearithmic" }, formula: "O(n log n)" },
  { id: "subquadratic", label: { ua: "Субквадратична", en: "Sub-quadratic" }, formula: "O(n√n)" },
  { id: "quadratic", label: { ua: "Квадратична", en: "Quadratic" }, formula: "O(n²)" },
  { id: "cubic", label: { ua: "Кубічна", en: "Cubic" }, formula: "O(n³)" },
  { id: "pseudo-polynomial", label: { ua: "Псевдополіноміальна", en: "Pseudo-polynomial" }, formula: "O(n·W)" },
  { id: "exponential", label: { ua: "Експоненційна", en: "Exponential" }, formula: "O(2ⁿ)" },
]

export function getAlgorithm(
  id: string | null | undefined,
): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.id === id)
}

export function isAlgorithmId(id: string): boolean {
  return ALGORITHMS.some((a) => a.id === id)
}

/**
 * Місток «Звідки → Куди»: спрямоване ребро навчального шляху між двома
 * алгоритмами з двомовною нотаткою «чому саме це наступне». Декларативний масив
 * `BRIDGES` — єдине джерело правди для трьох тонких вставок: rail «Шляхи» на
 * головній, footer «← попередній / наступний →» у розділі та `BridgeNav` у
 * навчальній вкладці. Нотатки написані СВІЖО (не скопійовані з taglines, які
 * непослідовні за напрямком).
 */
export interface Bridge {
  /** id алгоритму-джерела (звідки прийшли). */
  readonly from: string
  /** id алгоритму-призначення (куди веде логіка курсу). */
  readonly to: string
  /** Двомовна нотатка містка: «чому from природно веде до to». */
  readonly note: Localized
}

/**
 * Навчальні містки в порядку курсу. Лінійний ланцюг (один наступник на алгоритм)
 * — простий і покриває послідовність, у якій родини вивчаються на платформі.
 */
export const BRIDGES: readonly Bridge[] = [
  // Графи: остовні дерева → найкоротші шляхи.
  {
    from: "kruskal",
    to: "prim",
    note: {
      ua: "Та сама МОД, інша стратегія: Краскал росте по найлегших ребрах усього графа, Прим — нарощує одне дерево від вершини.",
      en: "Same MST, different strategy: Kruskal grows from the globally lightest edges, Prim expands a single tree from one vertex.",
    },
  },
  {
    from: "prim",
    to: "floyd-warshall",
    note: {
      ua: "Від остовного дерева — до найкоротших шляхів: Флойд–Воршал рахує відстані між УСІМА парами вершин.",
      en: "From spanning trees to shortest paths: Floyd–Warshall computes distances between ALL pairs of vertices.",
    },
  },
  {
    from: "floyd-warshall",
    to: "bfs",
    note: {
      ua: "Перш ніж зважувати ребра — навчись просто обходити граф: BFS відвідує вершини шарами завширшки.",
      en: "Before weighting edges, learn to traverse a graph: BFS visits vertices in breadth-first layers.",
    },
  },
  {
    from: "bfs",
    to: "dfs",
    note: {
      ua: "Той самий обхід, інша черга: DFS іде вглиб стеком, а не шарами, як BFS.",
      en: "Same traversal, different frontier: DFS dives deep with a stack instead of BFS layers.",
    },
  },
  {
    from: "dfs",
    to: "dijkstra",
    note: {
      ua: "Додай ваги до обходу — і отримаєш Дейкстру: найкоротші шляхи з однієї вершини за пріоритетною чергою.",
      en: "Add weights to traversal and you get Dijkstra: single-source shortest paths via a priority queue.",
    },
  },
  // Графи → динамічне програмування.
  {
    from: "dijkstra",
    to: "held-karp",
    note: {
      ua: "Коли треба обійти ВСІ вершини й повернутися — це вже комівояжер: Хелд–Карп розв'язує його динамічним програмуванням по бітмасках.",
      en: "When you must visit ALL vertices and return, it becomes the TSP: Held–Karp solves it with bitmask dynamic programming.",
    },
  },
  {
    from: "held-karp",
    to: "knapsack",
    note: {
      ua: "Ще одна класична ДП-задача, але простіша за станом: рюкзак 0/1 максимізує вартість за обмеженням ваги.",
      en: "Another classic DP problem with a simpler state: the 0/1 knapsack maximises value under a weight limit.",
    },
  },
  // ДП → сортування.
  {
    from: "knapsack",
    to: "bubble-sort",
    note: {
      ua: "Тепер — фундамент: упорядкування масиву. Бульбашка найпростіша — сусідні обміни, доки масив не впорядкується.",
      en: "Now the fundamentals: ordering an array. Bubble sort is the simplest — adjacent swaps until the array is sorted.",
    },
  },
  {
    from: "bubble-sort",
    to: "insertion-sort",
    note: {
      ua: "Замість обмінів сусідів — вставляй кожен елемент на місце у вже впорядкований префікс.",
      en: "Instead of swapping neighbours, insert each element into its place within the already-sorted prefix.",
    },
  },
  {
    from: "insertion-sort",
    to: "selection-sort",
    note: {
      ua: "Інша квадратична ідея: щоразу знаходь мінімум решти й став його на початок.",
      en: "A different quadratic idea: each pass finds the minimum of the rest and places it at the front.",
    },
  },
  {
    from: "selection-sort",
    to: "quick-sort",
    note: {
      ua: "Перший крок за межі O(n²): «розділяй і володарюй» навколо опорного елемента.",
      en: "The first step beyond O(n²): divide and conquer around a pivot element.",
    },
  },
  {
    from: "quick-sort",
    to: "merge-sort",
    note: {
      ua: "Той самий «розділяй і володарюй», але з гарантованим O(n·log n): поділ навпіл і злиття двома вказівниками.",
      en: "The same divide and conquer but with guaranteed O(n·log n): split in half and merge with two pointers.",
    },
  },
  {
    from: "merge-sort",
    to: "heap-sort",
    note: {
      ua: "Ще одне гарантоване O(n·log n), але на місці: масив як двійкова купа, з якої щоразу витягуємо корінь.",
      en: "Another guaranteed O(n·log n), but in place: treat the array as a binary heap and repeatedly extract the root.",
    },
  },
  {
    from: "heap-sort",
    to: "shell-sort",
    note: {
      ua: "Повертаємось до вставок, але «через крок» gap — субквадратичне узагальнення, що зменшує далекі зсуви.",
      en: "Back to insertion, but across a gap — a sub-quadratic generalisation that cuts down long-distance shifts.",
    },
  },
  {
    from: "shell-sort",
    to: "radix-sort",
    note: {
      ua: "А якщо взагалі не порівнювати? Порозрядне сортування розкладає числа по кошиках за цифрами — лінійний час.",
      en: "What if we never compare at all? Radix sort buckets numbers by their digits — linear time.",
    },
  },
  // Сортування → пошук («винагорода за сортування»).
  {
    from: "radix-sort",
    to: "linear-search",
    note: {
      ua: "Масив упорядковано — час шукати в ньому. Найпростіше: лінійний скан зліва направо.",
      en: "The array is ordered — now search it. The simplest way: a linear scan from left to right.",
    },
  },
  {
    from: "linear-search",
    to: "binary-search",
    note: {
      ua: "Винагорода за сортування: на впорядкованому масиві дивись у середину й відкидай половину — O(log n).",
      en: "The reward for sorting: on a sorted array, probe the middle and discard half — O(log n).",
    },
  },
  {
    from: "binary-search",
    to: "indexed-sequential-search",
    note: {
      ua: "Гібрид двох попередніх: двійковий пошук по розрідженому індексу → потрібний блок → лінійний скан усередині.",
      en: "A hybrid of the previous two: binary search over a sparse index → the right block → a linear scan inside it.",
    },
  },
  {
    from: "indexed-sequential-search",
    to: "interpolation-search",
    note: {
      ua: "Та сама ідея «звузити вікно», але пробу обчислюємо формулою інтерполяції — як шукають слово у словнику.",
      en: "Same window-narrowing idea, but the probe is computed by an interpolation formula — like finding a word in a dictionary.",
    },
  },
  // Пошук → пошук у рядку.
  {
    from: "interpolation-search",
    to: "naive-string-search",
    note: {
      ua: "Від числа у масиві — до шаблону в тексті: наївний пошук ставить шаблон на кожне вирівнювання й звіряє посимвольно.",
      en: "From a number in an array to a pattern in text: naive search slides the pattern over every alignment, comparing char by char.",
    },
  },
  {
    from: "naive-string-search",
    to: "kmp-string-search",
    note: {
      ua: "Прибираємо марну повторну роботу: таблиця LPS дає шаблону «пам'ять про себе», і індекс тексту ніколи не відкочується.",
      en: "Cut out the wasted re-work: the LPS table gives the pattern a memory of itself, so the text index never backs up.",
    },
  },
  {
    from: "kmp-string-search",
    to: "boyer-moore-string-search",
    note: {
      ua: "Інший трюк проти повторів: звіряй СПРАВА НАЛІВО й стрибай уперед за таблицею поганого символу.",
      en: "A different trick against repeats: compare RIGHT to LEFT and jump ahead via the bad-character table.",
    },
  },
  {
    from: "boyer-moore-string-search",
    to: "rabin-karp-string-search",
    note: {
      ua: "Замість символів — числа: порівнюй поліноміальні хеші вікон (ковзний хеш за O(1)), а збіг хешів доперевіряй.",
      en: "Numbers instead of characters: compare polynomial hashes of windows (rolling hash in O(1)), verifying on a hash match.",
    },
  },
]

/** Місток, що ВІДХОДИТЬ від алгоритму (куди він веде далі), або `undefined`. */
export function bridgeFrom(id: string): Bridge | undefined {
  return BRIDGES.find((b) => b.from === id)
}

/** Місток, що ПРИХОДИТЬ до алгоритму (звідки до нього прийшли), або `undefined`. */
export function bridgeTo(id: string): Bridge | undefined {
  return BRIDGES.find((b) => b.to === id)
}
