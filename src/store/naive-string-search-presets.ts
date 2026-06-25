// Пресети редактора наївного пошуку в рядках: канонічний приклад із конспекту,
// найгірший випадок (вибух порівнянь), «не знайдено», кілька входжень (для режиму
// «усі входження») та випадкова пара (текст + підрядок із нього). Чисто (без React).
// Документ — пара рядків {text, pattern}; жодних передумов (рядки будь-які).

import {
  NSS_MAIN,
  NSS_WORST,
  NSS_NOT_FOUND,
  NSS_OVERLAP,
  type StringSearchCase,
} from "@/lib/exampleNaiveStringSearch"
import type { NaiveStringSearchDoc } from "@/store/naive-string-search-store"
import { randomStringCase } from "@/store/create-string-store"

const fromCase = (c: StringSearchCase): NaiveStringSearchDoc => ({
  text: c.text,
  pattern: c.pattern,
})

/** Канонічний приклад `("ABABDABACDABABCABAB", "ABABCABAB")` → 10 за 29 порівнянь. */
export function nssMainPreset(): NaiveStringSearchDoc {
  return fromCase(NSS_MAIN)
}

/** Найгірший `("AAAAAAAAAA", "AAAAB")` → -1 за 30 порівнянь (вибух часткових збігів). */
export function nssWorstPreset(): NaiveStringSearchDoc {
  return fromCase(NSS_WORST)
}

/** Не знайдено `("ABABABABAB", "ABABB")` → -1 за 18 порівнянь. */
export function nssNotFoundPreset(): NaiveStringSearchDoc {
  return fromCase(NSS_NOT_FOUND)
}

/** Кілька входжень `("ABABAB", "AB")` → [0, 2, 4] (наочно у режимі «усі входження»). */
export function nssOverlapPreset(): NaiveStringSearchDoc {
  return fromCase(NSS_OVERLAP)
}

/**
 * Випадкова пара: текст із малого алфавіту (щоб були часткові збіги й «марна робота»)
 * + підрядок із нього як шаблон (зазвичай знайдеться), детерміновано за `seed`.
 */
export function nssRandomPreset(seed: number, textLen = 18, patLen = 4): NaiveStringSearchDoc {
  return randomStringCase(seed, { alphabet: "ABAB CDABC", textLen, patLen, fallback: "AB" })
}
