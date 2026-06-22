// Пресети редактора пошуку Рабіна-Карпа: канонічний приклад конспекту, КОЛІЗІЯ під час
// пошуку (унікальна перлина — хеш «for»=«jar»=35), множинні входження («sea» двічі),
// «не знайдено» та випадкова пара (текст + підрядок із нього). Чисто (без React).
// Документ — пара рядків {text, pattern}; жодних передумов (рядки будь-які).

import {
  RK_MAIN,
  RK_COLLISION,
  RK_MULTI,
  RK_NOT_FOUND,
  type StringSearchCase,
} from "@/lib/exampleRabinKarpStringSearch"
import type { RabinKarpStringSearchDoc } from "@/store/rabin-karp-string-search-store"
import { mulberry32 } from "@/lib/prng"

const fromCase = (c: StringSearchCase): RabinKarpStringSearchDoc => ({
  text: c.text,
  pattern: c.pattern,
})

/** Канонічний приклад конспекту `("Being a developer is not easy", "developer")` → 8. */
export function rkMainPreset(): RabinKarpStringSearchDoc {
  return fromCase(RK_MAIN)
}

/** Колізія `("for a jar of jam", "jar")` → 6 (вікно «for» має хеш 35, як і «jar»). */
export function rkCollisionPreset(): RabinKarpStringSearchDoc {
  return fromCase(RK_COLLISION)
}

/** Множинні входження `("she sells sea shells by the sea shore", "sea")` → [10, 28]. */
export function rkMultiPreset(): RabinKarpStringSearchDoc {
  return fromCase(RK_MULTI)
}

/** Не знайдено `("Being a developer is not easy", "manager")` → -1. */
export function rkNotFoundPreset(): RabinKarpStringSearchDoc {
  return fromCase(RK_NOT_FOUND)
}

/**
 * Випадкова пара: текст із малого алфавіту (щоб були часткові збіги хешів і колізії-
 * кандидати) + підрядок із нього як шаблон (зазвичай знайдеться), детерміновано за `seed`.
 */
export function rkRandomPreset(seed: number, textLen = 20, patLen = 4): RabinKarpStringSearchDoc {
  const rnd = mulberry32(seed)
  const alphabet = "abracadabra " // навмисне з повторами та пробілом — багаті часткові хеші
  const chars: string[] = []
  for (let i = 0; i < textLen; i++) {
    chars.push(alphabet[Math.floor(rnd() * alphabet.length)])
  }
  const text = chars.join("")
  const start = textLen > patLen ? Math.floor(rnd() * (textLen - patLen)) : 0
  const pattern = text.slice(start, start + patLen) || "ab"
  return { text, pattern }
}
