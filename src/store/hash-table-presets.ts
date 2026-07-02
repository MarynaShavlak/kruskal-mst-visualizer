// Пресети редактора хеш-таблиці: канонічний скрипт із конспекту (HashTable(5) +
// apple/orange/banana/lemon/grape із навмисною колізією), «анаграмний» скрипт
// (ate/eat/tea в одну комірку — найгірший випадок) і випадковий. Клонуємо операції,
// щоб стор не тримав посилань на незмінні константи еталона. Чисто, без React.

import {
  HT_INTRO_OPS,
  HT_INTRO_CAPACITY,
  HT_ANAGRAMS_OPS,
  HT_ANAGRAMS_CAPACITY,
  HT_ADVERSARIAL_OPS,
  HT_ADVERSARIAL_CAPACITY,
} from "@/lib/exampleHashTable"
import { randomHashTable } from "@/lib/randomHashTable"
import type { HtOp } from "@/lib/hashTable"
import type { HashTableDoc } from "@/store/hash-table-store"

const cloneOps = (ops: readonly HtOp[]): HtOp[] => ops.map((op) => ({ ...op }))

/**
 * Класичний еталон: HashTable(5), хеш «сума кодів», навмисна колізія lemon↔banana.
 * На ньому тримається навчальна вкладка й тести lib.
 */
export function hashClassicPreset(): HashTableDoc {
  return {
    ops: cloneOps(HT_INTRO_OPS),
    capacity: HT_INTRO_CAPACITY,
    hashFn: "sum",
    strategy: "chaining",
  }
}

/**
 * «Анаграмний» скрипт: ate/eat/tea мають однакову суму кодів (314) → усі в одну
 * комірку. Демонструє найгірший випадок O(n) і вимогу РІВНОМІРНОСТІ хеш-функції.
 */
export function hashAnagramsPreset(): HashTableDoc {
  return {
    ops: cloneOps(HT_ANAGRAMS_OPS),
    capacity: HT_ANAGRAMS_CAPACITY,
    hashFn: "sum",
    strategy: "chaining",
  }
}

/**
 * «Зловмисний» скрипт із ПОГАНОЮ хеш-функцією `firstChar`: п'ять різних ключів на
 * «a» падають в одну комірку → найгірший випадок O(n). Демонструє DoS hash-flooding.
 */
export function hashAdversarialPreset(): HashTableDoc {
  return {
    ops: cloneOps(HT_ADVERSARIAL_OPS),
    capacity: HT_ADVERSARIAL_CAPACITY,
    hashFn: "firstChar",
    strategy: "chaining",
  }
}

/** Випадковий скрипт: `count` вставок + влучення + промах; місткість ≈ 0.7·count. */
export function hashRandomPreset(seed: number, count = 6): HashTableDoc {
  const { ops, capacity } = randomHashTable({ seed, count })
  return { ops: cloneOps(ops), capacity, hashFn: "sum", strategy: "chaining" }
}
