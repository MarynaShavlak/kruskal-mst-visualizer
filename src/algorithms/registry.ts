import type { Algorithm } from "@/algorithms/types"
import { kruskal } from "@/algorithms/kruskal"
import { floydWarshall } from "@/algorithms/floyd-warshall"

/**
 * Єдиний реєстр алгоритмів платформи. Щоб додати новий:
 * 1) створити теку `src/algorithms/<id>/` з описом `Algorithm`;
 * 2) додати його в цей масив.
 * Каталог, перемикач у шапці й роутер автоматично його підхоплять.
 */
export const ALGORITHMS: readonly Algorithm[] = [kruskal, floydWarshall]

export function getAlgorithm(
  id: string | null | undefined,
): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.id === id)
}

export function isAlgorithmId(id: string): boolean {
  return ALGORITHMS.some((a) => a.id === id)
}
