// Детермінований генератор випадкових масивів для пресета редактора бульбашкового
// сортування. Значення — цілі [min..max]; довжина — count. Детерміновано за seed
// (однаковий seed → однаковий масив). Чисто, без React.

import { mulberry32 } from "@/lib/randomGraph"

export interface RandomArrayOptions {
  readonly count: number
  /** Мінімальне значення (за замовч. 1). */
  readonly min?: number
  /** Максимальне значення (за замовч. 99). */
  readonly max?: number
  readonly seed?: number
}

/** `count` випадкових цілих у [min..max], детерміновано за seed. */
export function randomArray(options: RandomArrayOptions): number[] {
  const { count, min = 1, max = 99, seed = 1 } = options
  const rand = mulberry32(seed)
  const span = Math.max(0, max - min)
  return Array.from({ length: count }, () => min + Math.floor(rand() * (span + 1)))
}
