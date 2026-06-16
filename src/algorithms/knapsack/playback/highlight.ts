// Чисті хелпери для панелей плеєра рюкзака (без React). Тестуються окремо.

import type { ReadonlyTable } from "@/lib/knapsack"

/** Формат цілого значення клітинки/вартості. */
export const fmt = (x: number): string => String(x)

/** Лінійний (row-major) індекс клітинки (i, w) у таблиці з `cols` стовпцями. */
export function dpLinear(i: number, w: number, cols: number): number {
  return i * cols + w
}

/** Координати клітинок-джерел для активної клітинки (i, w): «не брати» та «взяти». */
export interface CellSources {
  /** Джерело «не брати» = K[i−1][w] (клітинка прямо зверху); null у рядку 0. */
  readonly skip: readonly [number, number] | null
  /** Джерело «взяти» = K[i−1][w−wt]; null, якщо предмет не вміщається або рядок 0. */
  readonly take: readonly [number, number] | null
}

export function cellSources(
  i: number,
  w: number,
  weights: readonly number[],
): CellSources {
  if (i <= 0) return { skip: null, take: null }
  const wt = weights[i - 1]
  return {
    skip: [i - 1, w],
    take: wt <= w ? [i - 1, w - wt] : null,
  }
}

/** Один крок зворотного проходу: клітинка (i, w) та чи взято предмет i. */
export interface BacktrackStep {
  readonly i: number
  readonly w: number
  readonly taken: boolean
}

/**
 * Шлях зворотного проходу по таблиці K з правого нижнього кута вгору — той самий
 * хід, що й reconstructItems. Повертає кроки в порядку i = n … 1.
 */
export function backtrackPath(
  table: ReadonlyTable,
  weights: readonly number[],
  capacity: number,
): BacktrackStep[] {
  const n = table.length - 1
  let w = capacity
  const steps: BacktrackStep[] = []
  for (let i = n; i > 0; i--) {
    const taken = table[i][w] !== table[i - 1][w]
    steps.push({ i, w, taken })
    if (taken) w -= weights[i - 1]
  }
  return steps
}
