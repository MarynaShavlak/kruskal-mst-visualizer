import type {
  Algorithm,
  AlgorithmFamily,
  Localized,
} from "@/algorithms/types"
import { kruskal } from "@/algorithms/kruskal"
import { prim } from "@/algorithms/prim"
import { floydWarshall } from "@/algorithms/floyd-warshall"
import { heldKarp } from "@/algorithms/held-karp"
import { knapsack } from "@/algorithms/knapsack"
import { bubbleSort } from "@/algorithms/bubble-sort"
import { insertionSort } from "@/algorithms/insertion-sort"
import { selectionSort } from "@/algorithms/selection-sort"
import { quickSort } from "@/algorithms/quick-sort"
import { mergeSort } from "@/algorithms/merge-sort"
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
  heldKarp,
  knapsack,
  bubbleSort,
  insertionSort,
  selectionSort,
  quickSort,
  mergeSort,
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

export function getAlgorithm(
  id: string | null | undefined,
): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.id === id)
}

export function isAlgorithmId(id: string): boolean {
  return ALGORITHMS.some((a) => a.id === id)
}
