import type {
  Algorithm,
  AlgorithmFamily,
  ComplexityClass,
  Localized,
} from "@/algorithms/types"
import { kruskal } from "@/algorithms/kruskal"
import { prim } from "@/algorithms/prim"
import { bfs } from "@/algorithms/bfs"
import { dfs } from "@/algorithms/dfs"
import { dijkstra } from "@/algorithms/dijkstra"
import { floydWarshall } from "@/algorithms/floyd-warshall"
import { bubbleSort } from "@/algorithms/bubble-sort"
import { insertionSort } from "@/algorithms/insertion-sort"
import { selectionSort } from "@/algorithms/selection-sort"
import { shellSort } from "@/algorithms/shell-sort"
import { quickSort } from "@/algorithms/quick-sort"
import { mergeSort } from "@/algorithms/merge-sort"
import { heapSort } from "@/algorithms/heap-sort"
import { radixSort } from "@/algorithms/radix-sort"
import { linearSearch } from "@/algorithms/linear-search"
import { binarySearch } from "@/algorithms/binary-search"
import { interpolationSearch } from "@/algorithms/interpolation-search"
import { indexedSequentialSearch } from "@/algorithms/indexed-sequential-search"
import { naiveStringSearch } from "@/algorithms/naive-string-search"
import { kmpStringSearch } from "@/algorithms/kmp-string-search"
import { boyerMooreStringSearch } from "@/algorithms/boyer-moore-string-search"
import { rabinKarpStringSearch } from "@/algorithms/rabin-karp-string-search"
import { hashTable } from "@/algorithms/hash-table"
import { treeTraversal } from "@/algorithms/tree-traversal"
import { binarySearchTree } from "@/algorithms/bst"
import { knapsack } from "@/algorithms/knapsack"
import { heldKarp } from "@/algorithms/held-karp"

/**
 * Єдиний реєстр алгоритмів платформи. Щоб додати новий:
 * 1) створити теку `src/algorithms/<id>/` з описом `Algorithm`;
 * 2) додати його в цей масив.
 * Каталог, перемикач у шапці й роутер автоматично його підхоплять.
 */
export const ALGORITHMS: readonly Algorithm[] = [
  kruskal,
  prim,
  bfs,
  dfs,
  dijkstra,
  floydWarshall,
  bubbleSort,
  insertionSort,
  selectionSort,
  shellSort,
  quickSort,
  mergeSort,
  heapSort,
  radixSort,
  linearSearch,
  binarySearch,
  interpolationSearch,
  indexedSequentialSearch,
  naiveStringSearch,
  kmpStringSearch,
  boyerMooreStringSearch,
  rabinKarpStringSearch,
  hashTable,
  treeTraversal,
  binarySearchTree,
  knapsack,
  heldKarp,
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
  {
    id: "hashing",
    label: { ua: "Хешування", en: "Hashing" },
    blurb: {
      ua: "Прямий доступ за ключем через хеш-функцію: у середньому O(1).",
      en: "Direct key access via a hash function: O(1) on average.",
    },
  },
  {
    id: "trees",
    label: { ua: "Дерева", en: "Trees" },
    blurb: {
      ua: "Ієрархічна структура й обходи: відвідати кожен вузол у своєму порядку.",
      en: "A hierarchical structure and its traversals: visit every node in order.",
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
  { id: "constant", label: { ua: "Стала", en: "Constant" }, formula: "O(1)" },
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
  // Графи: остовні дерева → обхід → найкоротші шляхи.
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
    to: "bfs",
    note: {
      ua: "Дві стратегії МОД позаду — тепер крок до голого, незваженого кістяка обходу, на якому тримається кожен графовий алгоритм, ще ДО того, як зважувати ребра для найкоротших шляхів: BFS відвідує вершини шарами завширшки.",
      en: "Two MST strategies behind us — now step to the bare, unweighted traversal skeleton every graph algorithm rests on, before weighting edges for shortest paths: BFS visits vertices in breadth-first layers.",
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
  {
    from: "dijkstra",
    to: "floyd-warshall",
    note: {
      ua: "Від найкоротших шляхів з однієї вершини — до УСІХ пар: Флойд–Воршал рахує найкоротшу відстань між КОЖНОЮ парою вершин динамічним програмуванням по проміжних вершинах.",
      en: "From single-source shortest paths to ALL pairs: Floyd–Warshall computes the shortest distance between EVERY pair of vertices by dynamic programming over intermediate vertices.",
    },
  },
  // Графи → сортування.
  {
    from: "floyd-warshall",
    to: "bubble-sort",
    note: {
      ua: "Тепер — фундамент: упорядкування масиву. Бульбашка найпростіша — сусідні обміни, доки масив не впорядкується.",
      en: "Now the fundamentals: ordering an array. Bubble sort is the simplest — adjacent swaps until the array is sorted.",
    },
  },
  // Сортування: елементарні → субквадратичне → «розділяй і володарюй» → непорівняльне.
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
    to: "shell-sort",
    note: {
      ua: "Перша субквадратична ідея: сортування вставками «через крок» gap, що коротшає, приборкує далекі зсуви — близько O(n^1.5).",
      en: "The first sub-quadratic idea: insertion sort across a shrinking gap, which tames long-distance shifts — about O(n^1.5).",
    },
  },
  {
    from: "shell-sort",
    to: "quick-sort",
    note: {
      ua: "Перше сортування «розділяй і володарюй»: розбиваємо масив навколо опорного елемента — у середньому O(n·log n) (у найгіршому все ще O(n²) на невдалому опорному).",
      en: "The first divide-and-conquer sort: partition the array around a pivot — O(n·log n) on average (still O(n²) in the worst case on a bad pivot).",
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
    to: "radix-sort",
    note: {
      ua: "А якщо взагалі не порівнювати? Порозрядне сортування розкладає числа по кошиках за цифрами — лінійний час.",
      en: "What if we never compare at all? Radix sort buckets numbers by their digits — linear time.",
    },
  },
  // Сортування → пошук.
  {
    from: "radix-sort",
    to: "linear-search",
    note: {
      ua: "Масиви є — час шукати в них. Найпростіший спосіб, якому не потрібен жоден порядок, — лінійний скан зліва направо.",
      en: "You have arrays — now find things in them. The simplest way, needing no order at all, is a linear scan from left to right.",
    },
  },
  // Пошук: лінійний → двійковий → інтерполяційний → гібрид-фінал.
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
    to: "interpolation-search",
    note: {
      ua: "Той самий кістяк «звузити вікно», що й у двійкового, але замість СЕРЕДИНИ пробу вгадуємо формулою інтерполяції — як шукають слово у словнику.",
      en: "The same window-narrowing skeleton as binary, but instead of the MIDDLE the probe is guessed by an interpolation formula — like finding a word in a dictionary.",
    },
  },
  {
    from: "interpolation-search",
    to: "indexed-sequential-search",
    note: {
      ua: "Синтез серії й фінал пошуку — гібрид двох ідей: ДВІЙКОВИЙ пошук по розрідженому індексу обирає блок, а далі ЛІНІЙНИЙ скан усередині; його O(√n) — не про швидкість, а про поєднання обох підходів.",
      en: "The synthesis and finale of the search series — a hybrid of two ideas: BINARY search over a sparse index picks the block, then a LINEAR scan inside it; its O(√n) is not about raw speed but about combining both approaches.",
    },
  },
  // Пошук → пошук у рядку.
  {
    from: "indexed-sequential-search",
    to: "naive-string-search",
    note: {
      ua: "Від числа у масиві — до шаблону в тексті: наївний пошук ставить шаблон на кожне вирівнювання й звіряє посимвольно.",
      en: "From a number in an array to a pattern in text: naive search slides the pattern over every alignment, comparing char by char.",
    },
  },
  // Пошук у рядку: наївний → KMP → Боєра–Мура → Рабіна–Карпа.
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
      ua: "Інший спосіб пропускати роботу: звіряй з КІНЦЯ, а при розбіжності стрибай уперед за таблицею поганого символу.",
      en: "Another way to skip work: compare from the END, and on a mismatch jump ahead via the bad-character table.",
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
  // Пошук у рядку → хешування.
  {
    from: "rabin-karp-string-search",
    to: "hash-table",
    note: {
      ua: "Від хешу як прийому — до хешу як структури: той самий поліноміальний хеш, яким ми порівнювали рядки, тепер стає АДРЕСОЮ. Хеш-таблиця кладе ключ одразу в комірку за значенням хеш-функції, тож пошук у середньому O(1) — кульмінація історії пошуку.",
      en: "From hashing as a trick to hashing as a structure: the same polynomial hash we used to compare strings now becomes an ADDRESS. A hash table places a key straight into a slot by its hash value, so lookup is O(1) on average — the climax of the search story.",
    },
  },
  // Хешування → дерева.
  {
    from: "hash-table",
    to: "tree-traversal",
    note: {
      ua: "Хеш-таблиця дала O(1), але ЦІНОЮ порядку: ключі лежать хаотично, а на колізії витрачається пам'ять. Дерево — інша структура даних: ієрархія, де зв'язки явні, а обхід відвідує вузли ВПОРЯДКОВАНО (центровий обхід дерева пошуку видає відсортовану послідовність). Спершу розберемо саме дерево та три його обходи.",
      en: "The hash table gave us O(1) but at the COST of order: keys sit chaotically and collisions waste memory. A tree is a different data structure: a hierarchy with explicit links, where traversal visits nodes IN ORDER (an in-order walk of a search tree yields a sorted sequence). First we study the tree itself and its three traversals.",
    },
  },
  // Дерева: обхід → дерево ПОШУКУ.
  {
    from: "tree-traversal",
    to: "bst",
    note: {
      ua: "Ти вмієш обходити дерево — тепер надай йому ПРАВИЛО порядку: у лівому піддереві ключі менші, у правому більші. Це дерево двійкового ПОШУКУ: вставка/пошук/видалення за O(log n) на збалансованому дереві. Невипадково саме центровий обхід BST, який ти вже бачив, видає відсортовану послідовність.",
      en: "You can traverse a tree — now give it an ORDER rule: smaller keys in the left subtree, larger in the right. That is a binary SEARCH tree: insert/search/delete in O(log n) on a balanced tree. It is no accident that the in-order traversal of a BST, which you have already seen, yields a sorted sequence.",
    },
  },
  // Дерева → динамічне програмування.
  {
    from: "bst",
    to: "knapsack",
    note: {
      ua: "Дерево пошуку будувало відповідь із піддерев — те саме «знизу вгору», що й постфіксний обхід. Це вже думка динамічного програмування: оптимум складають із готових розв'язків менших підзадач. Останній поворот курсу — до цієї завершальної парадигми; найчистіший перший приклад — рюкзак 0/1: проста двовимірна таблиця максимізує вартість за обмеженням ваги.",
      en: "The search tree built its answer from subtrees — the same bottom-up idea as a post-order traversal. That is already the essence of dynamic programming: the optimum is assembled from ready answers to smaller subproblems. The course's final turn is to that closing paradigm; the cleanest first DP is the 0/1 knapsack: a simple 2-D table maximising value under a weight limit.",
    },
  },
  // ДП: від найпростішого рюкзака до вибуху станів (комівояжер).
  {
    from: "knapsack",
    to: "held-karp",
    note: {
      ua: "Від найпростішого ДП — до вибуху станів: коли треба обійти ВСІ вершини й повернутися, це вже комівояжер, і Хелд–Карп розв'язує його динамічним програмуванням по бітмасках.",
      en: "From the simplest DP to a state explosion: when you must visit ALL vertices and return, it becomes the TSP, and Held–Karp solves it with bitmask dynamic programming.",
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
