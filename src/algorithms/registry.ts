import type { Algorithm } from "@/algorithms/types"
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
]

export function getAlgorithm(
  id: string | null | undefined,
): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.id === id)
}

export function isAlgorithmId(id: string): boolean {
  return ALGORITHMS.some((a) => a.id === id)
}
