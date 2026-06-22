// Канонічні приклади наївного пошуку в рядках (еталон коректності з README та
// Python-репозиторію algo-naive-string-search). Кожен інстанс — пара (ТЕКСТ, ШАБЛОН):
// шукаємо перше (або всі) входження шаблону в тексті. На відміну від пошуку в масивах,
// тут немає передумов (масив не мусить бути відсортований) — працює на будь-яких рядках.
// «Ціна» — КІЛЬКІСТЬ ПОРІВНЯНЬ символів. Ті самі пари розбирає навчальна вкладка; їхні
// відомі підсумки (індекс / порівняння / вирівнювання / зсуви) звіряють тести. Без React.
//
// Тип `StringSearchCase` — спільний для всіх ЧОТИРЬОХ рядкових алгоритмів (наївний, KMP,
// Боєра-Мура, Рабіна-Карпа), як `SearchCase` для пошуку в масивах.

/** Пара «текст, у якому шукаємо + шаблон (підрядок)». Спільна для рядкових алгоритмів. */
export interface StringSearchCase {
  readonly text: string
  readonly pattern: string
}

/**
 * КАНОНІЧНИЙ приклад із конспекту `("ABABDABACDABABCABAB", "ABABCABAB")`: збіг на
 * позиції 10 за 29 порівнянь (11 вирівнювань, 10 зсувів). На ньому README веде весь
 * розбір — зокрема повне трасування з 13 кадрів (init + 11 вирівнювань + done).
 * Повторюваний префікс ABAB дає часткові збіги (марна робота — місток до KMP).
 */
export const NSS_MAIN: StringSearchCase = {
  text: "ABABDABACDABABCABAB",
  pattern: "ABABCABAB",
}

/** Інтуїція «шукаємо слово вручну»: `("HELLO WORLD", "WORLD")` → 6, 11 порівнянь, 7 вирівнювань. */
export const NSS_INTUITION: StringSearchCase = {
  text: "HELLO WORLD",
  pattern: "WORLD",
}

/** Збіг на старті: `("ABABZZZ", "ABAB")` → 0, 4 порівняння, 1 вирівнювання, 0 зсувів. */
export const NSS_START: StringSearchCase = {
  text: "ABABZZZ",
  pattern: "ABAB",
}

/** Не знайдено: `("ABABABABAB", "ABABB")` → -1, 18 порівнянь, 6 вирівнювань, 6 зсувів. */
export const NSS_NOT_FOUND: StringSearchCase = {
  text: "ABABABABAB",
  pattern: "ABABB",
}

/**
 * НАЙГІРШИЙ випадок `("AAAAAAAAAA", "AAAAB")` → -1, (N-M+1)·M = 6·5 = 30 порівнянь
 * (6 вирівнювань, 6 зсувів). Префікс AAAA щоразу збігається, далі B≠A — вибух роботи.
 */
export const NSS_WORST: StringSearchCase = {
  text: "AAAAAAAAAA",
  pattern: "AAAAB",
}

/** Найгірший шаблон, але збіг у кінці `("AAAAAAAAAB", "AAAB")` → 6, 28 порівнянь, 7 вирівнювань. */
export const NSS_WORST_FOUND: StringSearchCase = {
  text: "AAAAAAAAAB",
  pattern: "AAAB",
}

/**
 * Кілька входжень (для режиму «усі входження») `("ABABAB", "AB")`: перший збіг — 0
 * (2 порівняння, 1 вирівнювання), `find_all` — `[0, 2, 4]`.
 */
export const NSS_OVERLAP: StringSearchCase = {
  text: "ABABAB",
  pattern: "AB",
}

/** Швидка відмова: `("ABCDEF", "XYZ")` → -1, розбіжність на j=0 щоразу: 4 порівняння, 4 вирівнювання. */
export const NSS_QUICKFAIL: StringSearchCase = {
  text: "ABCDEF",
  pattern: "XYZ",
}

/** Відомі підсумки головних прикладів (з README) для тестів і панелей. */
export const NSS_MAIN_STATS = {
  result: 10,
  comparisons: 29,
  alignments: 11,
  shifts: 10,
  frames: 13,
} as const

export const NSS_WORST_STATS = {
  result: -1,
  comparisons: 30,
  alignments: 6,
  shifts: 6,
} as const

export const NSS_NOT_FOUND_STATS = {
  result: -1,
  comparisons: 18,
  alignments: 6,
  shifts: 6,
} as const

export const NSS_OVERLAP_STATS = {
  result: 0,
  allIndices: [0, 2, 4],
} as const
