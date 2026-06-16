// Канонічні приклади задачі про рюкзак (еталон коректності з README та
// Python-репозиторію algo-knapsack/tests/test_core.py). Той самий набір
// перевіряють повний перебір, жадібний і ДП, тож їхні результати звіряються
// напряму. Використовується пресетами редактора й тестами.

import type { KnapsackInstance } from "@/lib/knapsack"

/**
 * Малий інстанс (W=4): три предмети з малими вагами — зручний для покрокового
 * заповнення таблиці 4×5. Оптимум 18, набір {П1, П3} (індекси 0, 2).
 */
export const KNAPSACK_SMALL: KnapsackInstance = {
  items: [
    { name: "П1", weight: 1, value: 6 },
    { name: "П2", weight: 2, value: 10 },
    { name: "П3", weight: 3, value: 12 },
  ],
  capacity: 4,
}

/** Відомий оптимум малого інстансу. */
export const KNAPSACK_SMALL_OPTIMAL = 18
/** Обрані предмети малого інстансу (0-базові індекси). */
export const KNAPSACK_SMALL_CHOSEN: readonly number[] = [0, 2]

/**
 * Класичний інстанс (W=50) «з конспекту»: три предмети. Оптимум 220, набір
 * {П2, П3} (індекси 1, 2). Жадібний за питомою цінністю дає лише 160 —
 * навчальний контрприклад до задачі 0/1.
 */
export const KNAPSACK_CLASSIC: KnapsackInstance = {
  items: [
    { name: "П1", weight: 10, value: 60 },
    { name: "П2", weight: 20, value: 100 },
    { name: "П3", weight: 30, value: 120 },
  ],
  capacity: 50,
}

/** Відомий оптимум класичного інстансу. */
export const KNAPSACK_CLASSIC_OPTIMAL = 220
/** Обрані предмети класичного інстансу (0-базові індекси). */
export const KNAPSACK_CLASSIC_CHOSEN: readonly number[] = [1, 2]
/** Результат жадібного методу на класичному інстансі (програє оптимуму). */
export const KNAPSACK_CLASSIC_GREEDY = 160

/** Ваги/вартості інстансу окремими масивами — зручно для масивних функцій ядра. */
export function arrays(instance: KnapsackInstance): {
  readonly weights: number[]
  readonly values: number[]
} {
  return {
    weights: instance.items.map((it) => it.weight),
    values: instance.items.map((it) => it.value),
  }
}
