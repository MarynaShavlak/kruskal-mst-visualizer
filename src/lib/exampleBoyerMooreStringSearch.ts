// Канонічні приклади пошуку Боєра-Мура (еталон коректності з README та Python-репозиторію
// algo-boyer-moore-string-search). Кожен пошуковий інстанс — пара (ТЕКСТ, ШАБЛОН); кожен
// табличний — лише ШАБЛОН + очікувана таблиця зсувів. «Ціна» — кількість ПОРІВНЯНЬ символів,
// але на «природному» тексті вона часто МЕНША за довжину тексту (велика частина символів
// пропускається стрибками). Ті самі пари розбирає навчальна вкладка; їхні відомі підсумки
// (індекс / порівняння / стрибки / пропущені) звіряють тести. Без React.
//
// Тип `StringSearchCase` — спільний для всіх рядкових алгоритмів — реекспортуємо з
// наївного модуля (не передекларовуємо).

export type { StringSearchCase } from "@/lib/exampleNaiveStringSearch"
import type { StringSearchCase } from "@/lib/exampleNaiveStringSearch"

/** Інстанс фази передобробки: шаблон + очікувана таблиця зсувів. */
export interface ShiftTableCase {
  readonly pattern: string
  readonly expected: Record<string, number>
}

/**
 * КАНОНІЧНИЙ приклад із конспекту `("Being a developer is not easy", "developer")`: збіг на
 * позиції 8 за 10 порівнянь, 1 стрибок, 8 пропущених символів. На ньому README веде весь
 * розбір — зокрема повне трасування з 24 кадрів (фаза таблиці T00–T10 = 11 + фаза пошуку
 * S00–S12 = 13). Шаблон «developer» показує перезапис повторюваного 'e': 7→5→1.
 */
export const BM_MAIN: StringSearchCase = {
  text: "Being a developer is not easy",
  pattern: "developer",
}

/** Великі стрибки (рідкісні символи) `("the quick brown fox jumps over the lazy dog", "jumps")` → 20, 9 порівнянь, 4 стрибки, 16 пропущених. */
export const BM_BIG_JUMPS: StringSearchCase = {
  text: "the quick brown fox jumps over the lazy dog",
  pattern: "jumps",
}

/** Інтуїція «шукаємо слово вручну» `("HELLO WORLD", "WORLD")` → 6. */
export const BM_INTUITION: StringSearchCase = {
  text: "HELLO WORLD",
  pattern: "WORLD",
}

/**
 * НАЙГІРШИЙ випадок `("AAAAAAAAAA", "CAAAA")` → -1: символ кінця вікна 'A' дає зсув 1
 * щоразу, тож (N-M+1)·M = 6·5 = 30 порівнянь, 6 стрибків, 0 пропущених — вибух роботи
 * (Боєра-Мура деградує до O(n·m), як наївний).
 */
export const BM_WORST: StringSearchCase = {
  text: "AAAAAAAAAA",
  pattern: "CAAAA",
}

/** Не знайдено (швидка відмова) `("ABCDEF", "XYZ")` → -1: 2 порівняння, 2 стрибки, 4 пропущених. */
export const BM_NOT_FOUND: StringSearchCase = {
  text: "ABCDEF",
  pattern: "XYZ",
}

/** Кілька входжень `("abcabcabc", "abc")` → перше 0; усі `[0, 3, 6]`. */
export const BM_OVERLAP: StringSearchCase = {
  text: "abcabcabc",
  pattern: "abc",
}

/** Перекривні входження `("AABAACAADAABAABA", "AABA")` → перше 0; усі `[0, 9, 12]`. */
export const BM_MULTI: StringSearchCase = {
  text: "AABAACAADAABAABA",
  pattern: "AABA",
}

// ─── Табличні кейси (фаза передобробки) ───────────────────────────────────

/** Конспект: «developer» → showcase перезапису 'e' (7→5→1) + setdefault 'r' → 9. */
export const BM_TABLE_DEVELOPER: ShiftTableCase = {
  pattern: "developer",
  expected: { d: 8, e: 1, v: 6, l: 4, o: 3, p: 2, r: 9 },
}

/** Конспект: «ABC» → {A:2, B:1, C:3} (мінімальний приклад). */
export const BM_TABLE_ABC: ShiftTableCase = {
  pattern: "ABC",
  expected: { A: 2, B: 1, C: 3 },
}

/** Повтори: «AABA» → перезапис 'A' (3→2); setdefault останнього 'A' лишає 2. */
export const BM_TABLE_AABA: ShiftTableCase = {
  pattern: "AABA",
  expected: { A: 2, B: 1 },
}

/** Патологічний: «CAAAA» → {C:4, A:1} (символ кінця вікна дає зсув 1). */
export const BM_TABLE_CAAAA: ShiftTableCase = {
  pattern: "CAAAA",
  expected: { C: 4, A: 1 },
}

/** Тематичний: «MOORE» → перезапис 'O' (3→2). */
export const BM_TABLE_MOORE: ShiftTableCase = {
  pattern: "MOORE",
  expected: { M: 4, O: 2, R: 1, E: 5 },
}

/** Усі табличні кейси для тестів. */
export const BM_TABLE_CASES: readonly ShiftTableCase[] = [
  BM_TABLE_DEVELOPER,
  BM_TABLE_ABC,
  BM_TABLE_AABA,
  BM_TABLE_CAAAA,
  BM_TABLE_MOORE,
]

/** Відомі підсумки головних прикладів (з README) для тестів і панелей. */
export const BM_MAIN_STATS = {
  result: 8,
  comparisons: 10,
  jumps: 1,
  skipped: 8,
  /** Фаза таблиці T00–T10 (11) + фаза пошуку S00–S12 (13). */
  frames: 24,
  tableFrames: 11,
  searchFrames: 13,
} as const

export const BM_BIG_JUMPS_STATS = {
  result: 20,
  comparisons: 9,
  jumps: 4,
  skipped: 16,
} as const

export const BM_WORST_STATS = {
  result: -1,
  comparisons: 30,
  jumps: 6,
  skipped: 0,
} as const

export const BM_NOT_FOUND_STATS = {
  result: -1,
  comparisons: 2,
  jumps: 2,
  skipped: 4,
} as const

export const BM_OVERLAP_STATS = {
  result: 0,
  allIndices: [0, 3, 6],
} as const

export const BM_MULTI_STATS = {
  result: 0,
  allIndices: [0, 9, 12],
} as const

/** Контраст «Боєра-Мура проти наївного й KMP» (порівнянь) для графіка/тестів. */
export const BM_CONTRAST = {
  bigJumps: { bm: 9, naive: 43, kmp: 29 },
  worst: { bm: 30, naive: 6, kmpTotal: 14 },
} as const
