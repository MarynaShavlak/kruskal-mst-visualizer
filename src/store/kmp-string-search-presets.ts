// Пресети редактора KMP: канонічний приклад (контраст із наївним), конспект «алг»,
// найгірший для наївного (KMP лишається лінійним), «не знайдено» та випадкова пара
// (текст + підрядок із нього). Чисто (без React). Документ — пара рядків {text, pattern};
// жодних передумов (рядки будь-які).

import {
  KMP_CANONICAL,
  KMP_KONSPECT,
  KMP_WORST,
  KMP_NOT_FOUND,
  type StringSearchCase,
} from "@/lib/exampleKmpStringSearch"
import type { KmpStringSearchDoc } from "@/store/kmp-string-search-store"
import { mulberry32 } from "@/lib/prng"

const fromCase = (c: StringSearchCase): KmpStringSearchDoc => ({
  text: c.text,
  pattern: c.pattern,
})

/** Канонічний приклад `("ABABDABACDABABCABAB", "ABABCABAB")` → 10; lps 9 + пошук 23 = 32. */
export function kmpMainPreset(): KmpStringSearchDoc {
  return fromCase(KMP_CANONICAL)
}

/** Конспект `(текст, "алг")` → 4; lps [0,0,0], lps 2 + пошук 7. */
export function kmpKonspectPreset(): KmpStringSearchDoc {
  return fromCase(KMP_KONSPECT)
}

/** Найгірший для наївного `("AAAAAAAAAA", "AAAAB")` → -1; KMP лінійний (23 проти 30). */
export function kmpWorstPreset(): KmpStringSearchDoc {
  return fromCase(KMP_WORST)
}

/** Не знайдено `("ABCABDABABABD", "ABABABC")` → -1 (lps 8 + пошук 18 = 26). */
export function kmpNotFoundPreset(): KmpStringSearchDoc {
  return fromCase(KMP_NOT_FOUND)
}

/**
 * Випадкова пара: текст із малого алфавіту (щоб були часткові збіги й багаті стрибки lps)
 * + підрядок із нього як шаблон (зазвичай знайдеться), детерміновано за `seed`.
 */
export function kmpRandomPreset(seed: number, textLen = 18, patLen = 5): KmpStringSearchDoc {
  const rnd = mulberry32(seed)
  const alphabet = "ABAB CDABC" // навмисне з повторами та пробілом — багаті часткові збіги
  const chars: string[] = []
  for (let i = 0; i < textLen; i++) {
    chars.push(alphabet[Math.floor(rnd() * alphabet.length)])
  }
  const text = chars.join("")
  const start = textLen > patLen ? Math.floor(rnd() * (textLen - patLen)) : 0
  const pattern = text.slice(start, start + patLen) || "AB"
  return { text, pattern }
}
