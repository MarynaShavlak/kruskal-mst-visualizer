// Детермінований генератор випадкового двійкового дерева для пресета редактора.
// Будує дерево «випадковим приєднанням»: кожен наступний вузол чіпляють до випадкового
// вільного слота (ліворуч/праворуч) уже наявного вузла — гарантовано рівно `count`
// вузлів, валідне двійкове дерево, різноманітна (несиметрична) форма. Значення —
// перемішані 1..count. Потім серіалізує у рівневий список (BFS з `null` для порожніх
// дітей), сумісний із buildTree. Детерміновано за seed. Чисто, без React.

import { mulberry32 } from "@/lib/prng"

export interface RandomTreeOptions {
  /** Скільки вузлів (за замовч. 6..12 від seed). Кламп до [1, 15]. */
  readonly count?: number
  readonly seed?: number
}

/**
 * Повертає рівневий список (BFS-серіалізація) випадкового двійкового дерева з `count`
 * вузлів. Однаковий seed → однакове дерево. Форма варіюється (не завжди повне),
 * значення — перемішані 1..count.
 */
export function randomTree(options: RandomTreeOptions = {}): (number | null)[] {
  const { seed = 1, count } = options
  const rand = mulberry32(seed)
  const n = Math.max(1, Math.min(15, count ?? 6 + Math.floor(rand() * 7)))

  // Перемішані значення 1..n (Fisher–Yates).
  const values = Array.from({ length: n }, (_, i) => i + 1)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }

  // Приєднання: node i (i≥1) чіпляється до випадкового вузла з вільним слотом.
  const left = new Array<number | null>(n).fill(null)
  const right = new Array<number | null>(n).fill(null)
  for (let i = 1; i < n; i++) {
    const candidates: number[] = []
    for (let j = 0; j < i; j++) {
      if (left[j] === null || right[j] === null) candidates.push(j)
    }
    const parent = candidates[Math.floor(rand() * candidates.length)]
    const sides: ("left" | "right")[] = []
    if (left[parent] === null) sides.push("left")
    if (right[parent] === null) sides.push("right")
    const side = sides[Math.floor(rand() * sides.length)]
    if (side === "left") left[parent] = i
    else right[parent] = i
  }

  // Серіалізація у рівневий список (LeetCode-стиль): порожні діти → null, без розкриття.
  const levels: (number | null)[] = []
  const queue: (number | null)[] = [0]
  while (queue.length > 0) {
    const id = queue.shift() as number | null
    if (id === null) {
      levels.push(null)
      continue
    }
    levels.push(values[id])
    queue.push(left[id])
    queue.push(right[id])
  }
  // Прибираємо хвостові null (їх buildTree однаково ігнорує).
  while (levels.length > 0 && levels[levels.length - 1] === null) levels.pop()
  return levels
}
