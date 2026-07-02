// Детермінований генератор випадкового скрипта операцій для пресета редактора
// хеш-таблиці. Бере `count` різних ключів-слів зі сталого пулу, вставляє їх із
// випадковими значеннями, потім додає влучення (наявний ключ) і промах (ключ поза
// набором). Місткість трохи менша за кількість ключів → неминучі колізії (наочно).
// Детерміновано за seed: однаковий seed — однаковий скрипт. Чисто, без React.

import { mulberry32 } from "@/lib/prng"
import type { HtOp } from "@/lib/hashTable"

/** Пул ключів-слів (фрукти/ягоди) для випадкових скриптів. */
const WORD_POOL: readonly string[] = [
  "apple", "orange", "banana", "lemon", "grape", "cherry", "melon", "kiwi",
  "peach", "plum", "mango", "fig", "lime", "pear", "berry", "olive",
]

/** Ключ, якого гарантовано немає в пулі — для операції-промаху. */
const MISSING_KEY = "quince"

export interface RandomHashTableOptions {
  /** Скільки ключів вставити (за замовч. 6). */
  readonly count?: number
  readonly seed?: number
}

/** Результат генерації: скрипт операцій + місткість. */
export interface RandomHashTable {
  readonly ops: readonly HtOp[]
  readonly capacity: number
}

/**
 * `count` вставок різних ключів із пулу (значення [10..99]), далі get наявного
 * ключа (влучення) і get відсутнього (промах). Місткість ≈ 0.7·count (щонайменше
 * 4), тож α > 0.75 і колізії майже гарантовані — добрий матеріал для демонстрації.
 */
export function randomHashTable(
  options: RandomHashTableOptions = {},
): RandomHashTable {
  const { count = 6, seed = 1 } = options
  const rand = mulberry32(seed)

  // Перемішуємо копію пулу (Fisher–Yates) і беремо перші `count` ключів.
  const pool = [...WORD_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const n = Math.max(1, Math.min(count, pool.length))
  const keys = pool.slice(0, n)

  const ops: HtOp[] = keys.map((key) => ({
    kind: "insert",
    key,
    value: 10 + Math.floor(rand() * 90),
  }))
  // Влучення (наявний ключ) і промах (ключ поза набором).
  ops.push({ kind: "get", key: keys[Math.floor(rand() * keys.length)] })
  ops.push({ kind: "get", key: MISSING_KEY })

  const capacity = Math.max(4, Math.ceil(n * 0.7))
  return { ops, capacity }
}
