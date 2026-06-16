// Детермінований генератор випадкових інстансів задачі про рюкзак (для пресета
// редактора). Ваги — додатні цілі [1..maxWeight], вартості — цілі [0..maxValue],
// місткість — частка суми ваг (щоб задача була нетривіальною: вміщається не все).
// Детерміновано за seed: однаковий seed — однаковий інстанс. Чисто, без React.

import { vertexName } from "@/lib/graph"
import { mulberry32 } from "@/lib/randomGraph"
import type { KnapsackInstance, KnapsackItem } from "@/lib/knapsack"

export interface RandomKnapsackOptions {
  readonly count: number
  /** Максимальна вага предмета (за замовч. 15). */
  readonly maxWeight?: number
  /** Максимальна вартість предмета (за замовч. 30). */
  readonly maxValue?: number
  /** Частка сумарної ваги, що стає місткістю (за замовч. 0.5). */
  readonly capacityRatio?: number
  readonly seed?: number
}

/**
 * `count` предметів із канонічними іменами (A, B, …), випадковими цілими вагами
 * [1..maxWeight] і вартостями [0..maxValue]; місткість ≈ `capacityRatio` від суми
 * ваг (щонайменше maxWeight, щоб бодай один предмет точно вмістився).
 */
export function randomKnapsack(options: RandomKnapsackOptions): KnapsackInstance {
  const {
    count,
    maxWeight = 15,
    maxValue = 30,
    capacityRatio = 0.5,
    seed = 1,
  } = options
  const rand = mulberry32(seed)
  const items: KnapsackItem[] = []
  let totalWeight = 0
  for (let i = 0; i < count; i++) {
    const weight = 1 + Math.floor(rand() * maxWeight)
    const value = Math.floor(rand() * (maxValue + 1))
    totalWeight += weight
    items.push({ name: vertexName(i), weight, value })
  }
  const capacity =
    count === 0 ? 0 : Math.max(maxWeight, Math.round(totalWeight * capacityRatio))
  return { items, capacity }
}
