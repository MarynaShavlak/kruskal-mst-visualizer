// Пресети редактора пошуку Боєра-Мура: канонічний приклад із конспекту (developer),
// великі стрибки (рідкісні символи — сублінійно), найгірший випадок (CAAAA/AAAA… — зсув
// щоразу 1, вибух порівнянь), кілька (перекривних) входжень та випадкова пара (текст +
// підрядок із нього). Чисто (без React). Документ — пара рядків {text, pattern}; жодних
// передумов (рядки будь-які).

import {
  BM_MAIN,
  BM_BIG_JUMPS,
  BM_WORST,
  BM_MULTI,
  type StringSearchCase,
} from "@/lib/exampleBoyerMooreStringSearch"
import type { BoyerMooreStringSearchDoc } from "@/store/boyer-moore-string-search-store"
import { mulberry32 } from "@/lib/prng"

const fromCase = (c: StringSearchCase): BoyerMooreStringSearchDoc => ({
  text: c.text,
  pattern: c.pattern,
})

/** Канонічний приклад `("Being a developer is not easy", "developer")` → 8 за 10 порівнянь. */
export function bmMainPreset(): BoyerMooreStringSearchDoc {
  return fromCase(BM_MAIN)
}

/** Великі стрибки `("the quick brown fox jumps over the lazy dog", "jumps")` → 20, 9 порівнянь, 16 пропущених. */
export function bmBigJumpsPreset(): BoyerMooreStringSearchDoc {
  return fromCase(BM_BIG_JUMPS)
}

/** Найгірший `("AAAAAAAAAA", "CAAAA")` → -1 за 30 порівнянь (зсув щоразу 1). */
export function bmWorstPreset(): BoyerMooreStringSearchDoc {
  return fromCase(BM_WORST)
}

/** Кілька (перекривних) входжень `("AABAACAADAABAABA", "AABA")` → [0, 9, 12]. */
export function bmMultiPreset(): BoyerMooreStringSearchDoc {
  return fromCase(BM_MULTI)
}

/**
 * Випадкова пара: текст із ширшого алфавіту (рідкісніші символи → більші стрибки —
 * показ сильної сторони Боєра-Мура) + підрядок із нього як шаблон, детерміновано за `seed`.
 */
export function bmRandomPreset(seed: number, textLen = 24, patLen = 4): BoyerMooreStringSearchDoc {
  const rnd = mulberry32(seed)
  const alphabet = "ABCDEFGH IJKLMNOP" // ширший алфавіт + пробіл → рідкісніші символи, великі стрибки
  const chars: string[] = []
  for (let i = 0; i < textLen; i++) {
    chars.push(alphabet[Math.floor(rnd() * alphabet.length)])
  }
  const text = chars.join("")
  // Шаблон — підрядок тексту (щоб був збіг), якщо текст достатньо довгий.
  const start = textLen > patLen ? Math.floor(rnd() * (textLen - patLen)) : 0
  const pattern = text.slice(start, start + patLen) || "AB"
  return { text, pattern }
}
