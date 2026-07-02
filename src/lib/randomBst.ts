// Детермінований генератор випадкового скрипта операцій для пресета редактора ДДП.
// Бере `count` РІЗНИХ випадкових ключів (перемішані 1..99), вставляє їх, далі пошук
// наявного ключа, пошук відсутнього і видалення наявного — щоб показати всі три
// операції. Детерміновано за seed: однаковий seed — однаковий скрипт. Чисто, без React.

import { mulberry32 } from "@/lib/prng"
import type { BstOp } from "@/lib/binarySearchTree"

export interface RandomBstOptions {
  /** Скільки ключів вставити (за замовч. 7). Кламп до [1, 15]. */
  readonly count?: number
  readonly seed?: number
}

/**
 * `count` вставок різних ключів (1..99) у випадковому порядку, далі search наявного,
 * search відсутнього і delete наявного. Випадковий порядок вставок зазвичай дає
 * розумно збалансоване дерево (на відміну від відсортованого входу).
 */
export function randomBst(options: RandomBstOptions = {}): BstOp[] {
  const { seed = 1, count } = options
  const rand = mulberry32(seed)
  const n = Math.max(1, Math.min(15, count ?? 7))

  // Перемішуємо 1..99 і беремо перші n як унікальні ключі.
  const pool = Array.from({ length: 99 }, (_, i) => i + 1)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const keys = pool.slice(0, n)

  const ops: BstOp[] = keys.map((key) => ({ kind: "insert", key }))
  const present = keys[Math.floor(rand() * keys.length)]
  const absent = pool[pool.length - 1] // гарантовано поза набором (не в перших n)
  ops.push({ kind: "search", key: present })
  ops.push({ kind: "search", key: absent })
  ops.push({ kind: "delete", key: present })
  return ops
}
