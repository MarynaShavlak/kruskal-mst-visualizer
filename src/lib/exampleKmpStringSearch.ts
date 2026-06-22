// Канонічні приклади KMP (еталон коректності з README та Python-репозиторію
// algo-knuth-morris-pratt-search). Два типи інстансів: LPS-кейс (лише шаблон + очікувана
// таблиця `lps`, для фази передобробки) і пошук-кейс (текст + шаблон, для фази пошуку).
// «Ціна» — КІЛЬКІСТЬ ПОРІВНЯНЬ символів у двох фазах (lps + пошук). Тип `StringSearchCase`
// — спільний для всіх рядкових алгоритмів — імпортуємо з наївного, не дублюємо. Без React.

import {
  type StringSearchCase,
  NSS_MAIN,
} from "@/lib/exampleNaiveStringSearch"

export type { StringSearchCase }

/** Інстанс фази передобробки: шаблон + очікувана таблиця `lps`. */
export interface LpsCase {
  readonly pattern: string
  readonly expected: readonly number[]
}

// ---------------------------------------------------------------------------
// LPS-кейси (тільки шаблон) — еталонні таблиці конспекту
// ---------------------------------------------------------------------------
/** Конспект: «ABAB» → [0, 0, 1, 2]. */
export const LPS_ABAB: LpsCase = { pattern: "ABAB", expected: [0, 0, 1, 2] }

/** Конспект: «AABAA» → [0, 1, 0, 1, 2] — showcase кроку відкоту length = lps[length-1]. */
export const LPS_AABAA: LpsCase = { pattern: "AABAA", expected: [0, 1, 0, 1, 2] }

/** Шаблон канонічного прикладу пошуку: «ABABCABAB» → [0, 0, 1, 2, 0, 1, 2, 3, 4]. */
export const LPS_ABABCABAB: LpsCase = {
  pattern: "ABABCABAB",
  expected: [0, 0, 1, 2, 0, 1, 2, 3, 4],
}

/** Патологічний шаблон: «AAAAB» → [0, 1, 2, 3, 0]. */
export const LPS_AAAAB: LpsCase = { pattern: "AAAAB", expected: [0, 1, 2, 3, 0] }

/** Багатий відкіт: «AABAAAB» → [0, 1, 0, 1, 2, 2, 3]. */
export const LPS_AABAAAB: LpsCase = { pattern: "AABAAAB", expected: [0, 1, 0, 1, 2, 2, 3] }

/** Шаблон конспект-прикладу пошуку: «алг» → [0, 0, 0] (усі символи різні). */
export const LPS_ALG: LpsCase = { pattern: "алг", expected: [0, 0, 0] }

/** Усі LPS-кейси (для тестів). */
export const LPS_CASES: readonly LpsCase[] = [
  LPS_ABAB,
  LPS_AABAA,
  LPS_ABABCABAB,
  LPS_AAAAB,
  LPS_AABAAAB,
  LPS_ALG,
]

// ---------------------------------------------------------------------------
// ПОШУК-кейси (текст, шаблон)
// ---------------------------------------------------------------------------
/**
 * КАНОНІЧНИЙ приклад `("ABABDABACDABABCABAB", "ABABCABAB")` → збіг на позиції 10.
 * Ціна KMP: lps 9 + пошук 23 = 32 порівняння (наївний на тому самому вході — 29).
 * Спільний із наївним прикладом (NSS_MAIN) — прямий контраст.
 */
export const KMP_CANONICAL: StringSearchCase = {
  text: NSS_MAIN.text,
  pattern: NSS_MAIN.pattern,
}

/** Текст конспекту: пошук «алг» → 4 (Ц,е,й,␣,а,л,г → «алг» з індексу 4). */
export const KMP_KONSPECT: StringSearchCase = {
  text: "Цей алгоритм часто використовується в текстових редакторах та системах пошуку для ефективного знаходження підрядка в тексті.",
  pattern: "алг",
}

/**
 * НАЙГІРШИЙ для наївного `("AAAAAAAAAA", "AAAAB")` → -1. KMP лінійний (lps 7 + пошук 16 =
 * 23), наївний — (N-M+1)·M = 30. Тут KMP виграє понад удвічі.
 */
export const KMP_WORST: StringSearchCase = {
  text: "AAAAAAAAAA",
  pattern: "AAAAB",
}

/** Шаблон відсутній `("ABCABDABABABD", "ABABABC")` → -1 (lps 8 + пошук 18 = 26). */
export const KMP_NOT_FOUND: StringSearchCase = {
  text: "ABCABDABABABD",
  pattern: "ABABABC",
}

/** Множинні (перекривні) входження `("ABABAB", "AB")`: перший збіг 0, усі — [0, 2, 4]. */
export const KMP_MULTI: StringSearchCase = {
  text: "ABABAB",
  pattern: "AB",
}

/** Усі ПОШУК-кейси (для тестів). */
export const KMP_SEARCH_CASES: readonly StringSearchCase[] = [
  KMP_CANONICAL,
  KMP_KONSPECT,
  KMP_WORST,
  KMP_NOT_FOUND,
  KMP_MULTI,
]

// ---------------------------------------------------------------------------
// Відомі підсумки головних прикладів (з README) для тестів і панелей
// ---------------------------------------------------------------------------
export const KMP_CANONICAL_STATS = {
  result: 10,
  lpsComparisons: 9,
  searchComparisons: 23,
  totalComparisons: 32,
  naiveComparisons: 29,
} as const

export const KMP_WORST_STATS = {
  result: -1,
  lpsComparisons: 7,
  searchComparisons: 16,
  totalComparisons: 23,
  naiveComparisons: 30,
} as const

export const KMP_NOT_FOUND_STATS = {
  result: -1,
  lpsComparisons: 8,
  searchComparisons: 18,
  totalComparisons: 26,
} as const

export const KMP_KONSPECT_STATS = {
  result: 4,
  lpsComparisons: 2,
  searchComparisons: 7,
} as const

export const KMP_MULTI_STATS = {
  result: 0,
  allIndices: [0, 2, 4],
} as const
