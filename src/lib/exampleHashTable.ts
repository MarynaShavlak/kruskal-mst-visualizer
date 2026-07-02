// Канонічний приклад хеш-таблиці — ЄДИНЕ джерело правди для тестів lib/, прев'ю
// редактора й живих навчальних віджетів (щоб числа НЕ дрейфували між екранами).
// Побудований на конспекті edu.goit (HashTable(5) + apple/orange/banana), але
// доповнений навмисною КОЛІЗІЄЮ (lemon у ту саму комірку, що й banana) і серією
// get, щоб показати влучення, скан ланцюга й промах. Хеш — «сума кодів % 5»
// (усно перевірний). Без React.

import type { HtOp } from "@/lib/hashTable"

/**
 * Головний навчальний скрипт. Місткість 5, хеш «сума кодів символів % 5».
 * Розклад комірок (перевірено вручну):
 *   apple  = 530 % 5 = 0
 *   orange = 636 % 5 = 1
 *   banana = 609 % 5 = 4
 *   lemon  = 539 % 5 = 4  ← КОЛІЗІЯ з banana (той самий слот)
 *   grape  = 527 % 5 = 2  ← порожня комірка → get дає промах одразу
 * Операції: три чисті вставки, вставка-колізія, влучення прямо, влучення через
 * скан ланцюга (2 порівняння) і промах у порожню комірку.
 */
export const HT_INTRO_OPS: readonly HtOp[] = [
  { kind: "insert", key: "apple", value: 10 },
  { kind: "insert", key: "orange", value: 20 },
  { kind: "insert", key: "banana", value: 30 },
  { kind: "insert", key: "lemon", value: 40 }, // колізія з banana у комірці 4
  { kind: "get", key: "orange" }, // влучення прямо (ланцюг з 1 пари)
  { kind: "get", key: "lemon" }, // влучення через скан ланцюга [banana, lemon]
  { kind: "get", key: "grape" }, // промах: комірка 2 порожня
]

/** Місткість таблиці головного прикладу. */
export const HT_INTRO_CAPACITY = 5

/**
 * Відомі підсумки головного прикладу (звіряють тести й підписи).
 * size=4 (apple/orange/banana/lemon), α=0.8; одна колізія (lemon), чотири
 * порівняння ключів (lemon-скан 1 + orange 1 + lemon-get 2 + grape 0);
 * 35 кадрів trace.
 */
export const HT_INTRO_STATS = {
  size: 4,
  capacity: 5,
  comparisons: 4,
  collisions: 1,
  loadFactor: 0.8,
  frames: 35,
} as const

/**
 * Той самий скрипт під ЛІНІЙНИМ ЗОНДУВАННЯМ (відкрите адресування): банан у комірці 4,
 * а lemon (домашня теж 4) «прогулюється» 4→0→1→2 крізь зайняті apple/orange і сідає в
 * комірку 2. Кластеризація дорожча: 9 порівнянь проти 4 у ланцюжків. Фінал:
 * [apple, orange, lemon, —, banana]; size=4, α=0.8, 1 колізія, 40 кадрів.
 */
export const HT_INTRO_LINEAR_STATS = {
  size: 4,
  capacity: 5,
  comparisons: 9,
  collisions: 1,
  loadFactor: 0.8,
  frames: 40,
} as const

/** Домашні індекси ключів прикладу (для наочних перевірок і прев'ю). */
export const HT_INTRO_SLOTS: Readonly<Record<string, number>> = {
  apple: 0,
  orange: 1,
  banana: 4,
  lemon: 4,
  grape: 2,
}

/**
 * Демонстрація АНАГРАМ — слабкості «суми кодів»: ate/eat/tea мають однакову суму
 * кодів (97+116+101 = 314), тож усі йдуть у ту саму комірку 314 % 5 = 4 →
 * найгірший випадок O(n): один довгий ланцюг. Підкреслює вимогу РІВНОМІРНОСТІ.
 */
export const HT_ANAGRAMS_OPS: readonly HtOp[] = [
  { kind: "insert", key: "ate", value: 1 },
  { kind: "insert", key: "eat", value: 2 },
  { kind: "insert", key: "tea", value: 3 },
  { kind: "get", key: "tea" }, // влучення аж у кінці ланцюга з трьох
]

/** Місткість прикладу-анаграм. */
export const HT_ANAGRAMS_CAPACITY = 5

/**
 * «Зловмисний» скрипт для ПОГАНОЇ хеш-функції `firstChar` (лише перша літера):
 * п'ять РІЗНИХ ключів, що всі починаються на «a», тож усі падають в одну комірку
 * (97 % 5 = 2) → один довгий ланцюг, найгірший випадок O(n). get «acorn» аж у кінці
 * ланцюга дає 5 порівнянь. Демонструє, чому рівномірність критична й звідки береться
 * атака hash-flooding (тому реальні мови «солять» хеш — Python hash() різний між сесіями).
 */
export const HT_ADVERSARIAL_OPS: readonly HtOp[] = [
  { kind: "insert", key: "apple", value: 1 },
  { kind: "insert", key: "avocado", value: 2 },
  { kind: "insert", key: "apricot", value: 3 },
  { kind: "insert", key: "almond", value: 4 },
  { kind: "insert", key: "acorn", value: 5 },
  { kind: "get", key: "acorn" }, // аж у кінці ланцюга → O(n)
  { kind: "get", key: "apple" },
]

/** Місткість «зловмисного» прикладу. */
export const HT_ADVERSARIAL_CAPACITY = 5
