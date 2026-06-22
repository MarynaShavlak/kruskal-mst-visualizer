// Канонічні приклади пошуку Рабіна-Карпа (еталон коректності з README та
// Python-репозиторію algo-rabin-karp-string-search). Кожен інстанс — пара (ТЕКСТ, ШАБЛОН):
// шукаємо перше (або всі) входження шаблону в тексті, порівнюючи ХЕШІ (не символи).
// «Ціна» — порівняння хешів / посимвольні перевірки / колізії / rolling-оновлення.
// Ті самі пари розбирає навчальна вкладка; їхні відомі підсумки звіряють тести. Без React.
//
// Тип `StringSearchCase` — спільний для всіх рядкових алгоритмів — імпортуємо з модуля
// наївного пошуку (НЕ перевизначаємо). Окремо — інстанси хешу й колізій.

import type { StringSearchCase } from "@/lib/exampleNaiveStringSearch"

export type { StringSearchCase }

/** Інстанс фази ХЕШУВАННЯ: рядок + очікуваний поліноміальний хеш (mod 101). */
export interface HashCase {
  readonly s: string
  /** polynomialHash(s, 256, 101). */
  readonly expected: number
}

/** Колізія: два різні рядки однакової довжини з однаковим хешем під (256, 101). */
export interface CollisionCase {
  readonly s1: string
  readonly s2: string
  /** Спільний polynomialHash(s1) == polynomialHash(s2). */
  readonly hash: number
}

// ---------------------------------------------------------------------------
// Дані з конспекту (драйвер друкує: Substring found at index 8)
// ---------------------------------------------------------------------------

/**
 * КАНОНІЧНИЙ приклад конспекту `("Being a developer is not easy", "developer")`: збіг на
 * позиції 8. На зміщенні 6 вікно «a develop» має ТОЙ САМИЙ хеш 35, що й шаблон — це
 * КОЛІЗІЯ, відкинута посимвольною перевіркою. Підсумок: 9 порівнянь хешів, 2 char-
 * перевірки (1 колізія), 8 rolling-оновлень. На ньому README веде повне трасування у дві
 * фази (хешування «developer» + пошук).
 */
export const RK_MAIN: StringSearchCase = {
  text: "Being a developer is not easy",
  pattern: "developer",
}

/** Хеш-приклади конспекту: «abc» → 90, «developer» → 35, «general» → 82. */
export const RK_HASH_ABC: HashCase = { s: "abc", expected: 90 }
export const RK_HASH_DEVELOPER: HashCase = { s: "developer", expected: 35 }
export const RK_HASH_GENERAL: HashCase = { s: "general", expected: 82 }

/** Усі хеш-кейси (для тестів і панелей). */
export const RK_HASH_CASES: readonly HashCase[] = [RK_HASH_ABC, RK_HASH_DEVELOPER, RK_HASH_GENERAL]

/**
 * КОЛІЗІЯ під час пошуку `("for a jar of jam", "jar")` → 6. Вікно «for» має той самий хеш
 * (35), що «jar», але це не «jar» — char-перевірка відкидає колізію на зміщенні 0;
 * справжній збіг — на 6. Підсумок: 7 порівнянь хешів, 2 char-перевірки (1 колізія).
 */
export const RK_COLLISION: StringSearchCase = {
  text: "for a jar of jam",
  pattern: "jar",
}

/** Множинні входження `("she sells sea shells by the sea shore", "sea")` → перший 10, усі [10, 28]. */
export const RK_MULTI: StringSearchCase = {
  text: "she sells sea shells by the sea shore",
  pattern: "sea",
}

/** Мало збігів (best/avg ≈ O(n+m)): `("a polynomial hash maps a string to a number", "string")` → 25. */
export const RK_BEST: StringSearchCase = {
  text: "a polynomial hash maps a string to a number",
  pattern: "string",
}

/** Не знайдено `("Being a developer is not easy", "manager")` → -1. */
export const RK_NOT_FOUND: StringSearchCase = {
  text: "Being a developer is not easy",
  pattern: "manager",
}

/**
 * Найгірший (багато колізій під МАЛИМ модулем): `("aaaaaaaaaaaaaaaa", "aaaaaaab")` → -1.
 * Під простим 101 — 0 колізій (RK швидкий); під модулем 1 — кожне вікно колізує
 * (RK вироджується в наївний O(n·m)).
 */
export const RK_WORST: StringSearchCase = {
  text: "a".repeat(16),
  pattern: "a".repeat(7) + "b",
}

/** Кілька входжень, що перекриваються `("ababab", "ab")` → перший 0, усі [0, 2, 4]. */
export const RK_OVERLAP: StringSearchCase = {
  text: "ababab",
  pattern: "ab",
}

// ---------------------------------------------------------------------------
// Колізії-кейси (різні рядки однакової довжини — однаковий хеш під (256, 101))
// ---------------------------------------------------------------------------

/** «for» і «jar» → обидва 35 (та сама пара, що демонструє колізію під час пошуку). */
export const RK_COLLISION_FOR_JAR: CollisionCase = { s1: "for", s2: "jar", hash: 35 }

/** «heap» і «user» → обидва 12 (дві програмістські абревіатури колізують). */
export const RK_COLLISION_HEAP_USER: CollisionCase = { s1: "heap", s2: "user", hash: 12 }

/** Усі колізії-кейси (для тестів і навчальної вкладки). */
export const RK_COLLISION_CASES: readonly CollisionCase[] = [
  RK_COLLISION_FOR_JAR,
  RK_COLLISION_HEAP_USER,
]

// ---------------------------------------------------------------------------
// Відомі підсумки (з README) для тестів і панелей
// ---------------------------------------------------------------------------

/** Канонічний: позиція 8; 9 порівнянь хешів, 2 char-перевірки, 1 колізія, 8 rolls. */
export const RK_MAIN_STATS = {
  result: 8,
  hashComparisons: 9,
  charVerifications: 2,
  collisions: 1,
  rolls: 8,
} as const

/** Колізія «for/jar»: позиція 6; 7 порівнянь хешів, 2 char-перевірки, 1 колізія, 6 rolls. */
export const RK_COLLISION_STATS = {
  result: 6,
  hashComparisons: 7,
  charVerifications: 2,
  collisions: 1,
  rolls: 6,
} as const

/** Множинні: перший 10, усі [10, 28]. */
export const RK_MULTI_STATS = {
  result: 10,
  allIndices: [10, 28],
} as const

/** Перекривні: перший 0, усі [0, 2, 4]. */
export const RK_OVERLAP_STATS = {
  result: 0,
  allIndices: [0, 2, 4],
} as const

/** Множник h для M=9 (pow(256, 8) % 101) і велике число «abc» без модуля. */
export const RK_H_MULTIPLIER_M9 = 79
export const RK_RAW_ABC = 6382179n
